/**
 * @file wikiAccess.test.js
 * @description Suite de pruebas de seguridad y control de acceso por rol para el catálogo de la Wiki.
 * Valida que los usuarios con rol estándar ('user', 'revisor') no tengan acceso
 * a secciones ni páginas técnicas ('tecnico'), y que los superadministradores ('superadmin')
 * puedan inspeccionar la arquitectura completa sin restricciones.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import wikiRouter from '../../server/routes/wikiRouter.js';

/**
 * Helper para invocar handlers de Express de forma aislada y síncrona/asíncrona.
 */
function invokeRoute(method, pathUrl, reqMock = {}) {
  return new Promise((resolve) => {
    const layer = wikiRouter.stack.find(
      (s) => s.route && s.route.path === pathUrl && s.route.methods[method.toLowerCase()]
    );

    if (!layer) {
      throw new Error(`Ruta ${method} ${pathUrl} no encontrada en wikiRouter.`);
    }

    const resMock = {
      _status: 200,
      _body: null,
      status(code) {
        this._status = code;
        return this;
      },
      json(data) {
        this._body = data;
        resolve({ status: this._status, body: this._body });
        return this;
      }
    };

    const handler = layer.route.stack[0].handle;
    handler(reqMock, resMock);
  });
}

describe('Control de Acceso y Audiencia en la Wiki (/api/wiki)', () => {
  describe('GET /api/wiki/tree', () => {
    it('filtra ramas y páginas técnicas cuando el usuario es rol "user" o "revisor"', async () => {
      const resUser = await invokeRoute('GET', '/tree', {
        user: { id: 'u_123', role: 'user', username: 'alumno' }
      });

      assert.equal(resUser.status, 200);
      assert.ok(Array.isArray(resUser.body.tree));
      assert.equal(resUser.body.userRole, 'user');

      // Verificar que ninguna raíz o hijo del árbol tenga audience === 'tecnico'
      const verificarNoTecnico = (nodos) => {
        for (const nodo of nodos) {
          assert.notEqual(nodo.audience, 'tecnico', `Nodo ${nodo.id} técnico visible para rol user`);
          if (Array.isArray(nodo.children)) {
            verificarNoTecnico(nodo.children);
          }
        }
      };
      verificarNoTecnico(resUser.body.tree);

      // El índice de páginas planas tampoco debe exponer la página 'referencia-apis'
      assert.equal(resUser.body.pagesIndex['referencia-apis'], undefined);
    });

    it('incluye ramas y páginas técnicas cuando el usuario es "superadmin"', async () => {
      const resAdmin = await invokeRoute('GET', '/tree', {
        user: { id: 'u_admin', role: 'superadmin', username: 'admin' }
      });

      assert.equal(resAdmin.status, 200);
      assert.equal(resAdmin.body.userRole, 'superadmin');

      // Encontrar la rama de referencia técnica
      const ramaRef = resAdmin.body.tree.find((n) => n.id === 'referencia');
      assert.ok(ramaRef, 'Superadmin debe ver la rama de referencia técnica');

      // En el pagesIndex debe figurar referencia-apis
      assert.ok(resAdmin.body.pagesIndex['referencia-apis'], 'referencia-apis debe existir en pagesIndex de superadmin');
    });
  });

  describe('GET /api/wiki/page/:id', () => {
    it('filtra las secciones técnicas de una página cliente para rol regular', async () => {
      const res = await invokeRoute('GET', '/page/:id', {
        params: { id: 'modulo.business.introduccion' },
        user: { id: 'u_123', role: 'user', username: 'alumno' }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.id, 'modulo.business.introduccion');
      assert.ok(Array.isArray(res.body.sections));

      // Las secciones visibles deben ser únicamente de audiencia cliente
      const tieneTecnico = res.body.sections.some((s) => s.audience === 'tecnico');
      assert.equal(tieneTecnico, false, 'Usuario regular no debe ver secciones técnicas internas');
    });

    it('entrega las secciones técnicas de una página cliente al superadmin', async () => {
      const res = await invokeRoute('GET', '/page/:id', {
        params: { id: 'modulo.business.introduccion' },
        user: { id: 'u_admin', role: 'superadmin', username: 'admin' }
      });

      assert.equal(res.status, 200);
      const secTecnica = res.body.sections.find((s) => s.audience === 'tecnico');
      assert.ok(secTecnica, 'Superadmin debe tener acceso a la sección técnica con direcciones canónicas');
      assert.ok(secTecnica.markdown.includes('Direcciones canónicas'));
    });

    it('bloquea con HTTP 403 el acceso a páginas enteramente técnicas si no es superadmin', async () => {
      const res = await invokeRoute('GET', '/page/:id', {
        params: { id: 'referencia-apis' },
        user: { id: 'u_123', role: 'user', username: 'alumno' }
      });

      assert.equal(res.status, 403);
      assert.equal(res.body.code, 'SUPERADMIN_REQUIRED');
    });

    it('permite al superadmin acceder a la página técnica de referencia de APIs (HTTP 200)', async () => {
      const res = await invokeRoute('GET', '/page/:id', {
        params: { id: 'referencia-apis' },
        user: { id: 'u_admin', role: 'superadmin', username: 'admin' }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.id, 'referencia-apis');
      assert.ok(res.body.sections.length > 0);
    });

    it('rechaza con HTTP 400 identificadores maliciosos con path traversal', async () => {
      const res = await invokeRoute('GET', '/page/:id', {
        params: { id: '../../etc/passwd' },
        user: { id: 'u_admin', role: 'superadmin' }
      });

      assert.equal(res.status, 400);
      assert.match(res.body.error, /no válido/i);
    });

    it('responde con HTTP 404 si la página solicitada no existe', async () => {
      const res = await invokeRoute('GET', '/page/:id', {
        params: { id: 'pagina-completamente-inexistente-12345' },
        user: { id: 'u_admin', role: 'superadmin' }
      });

      assert.equal(res.status, 404);
      assert.match(res.body.error, /no encontrada/i);
    });

    it('bloquea con HTTP 403 el acceso a las nuevas guías de arquitectura a usuarios estándar', async () => {
      for (const id of ['referencia-alta-api', 'referencia-proveedor-llm', 'referencia-extension-modulos']) {
        const res = await invokeRoute('GET', '/page/:id', {
          params: { id },
          user: { id: 'u_123', role: 'user', username: 'alumno' }
        });
        assert.equal(res.status, 403, `Debe bloquear ${id} a rol regular`);
        assert.equal(res.body.code, 'SUPERADMIN_REQUIRED');
      }
    });

    it('permite a cualquier usuario con sesión consultar artículos archivados (HTTP 200)', async () => {
      const res = await invokeRoute('GET', '/page/:id', {
        params: { id: 'archivado.matematicas-financieras-wacc-van-tir' },
        user: { id: 'u_123', role: 'user', username: 'alumno' }
      });

      assert.equal(res.status, 200);
      assert.equal(res.body.kind, 'archivado');
      assert.ok(res.body.title.includes('WACC'));
      assert.ok(res.body.sections.length >= 2);
    });
  });
});
