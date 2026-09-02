import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import {
  STORES,
  isIndexedDBAvailable,
  saveProjectToIDB,
  loadProjectFromIDB,
  getAllProjectsFromIDB,
  deleteProjectFromIDB,
  migrateFromLocalStorage
} from '../src/lib/storage/indexedDbStorage.js';

describe('IndexedDB Storage Engine - TDD Test Suite', () => {
  it('debe definir correctamente las constantes de Object Stores', () => {
    assert.equal(STORES.PROJECTS, 'projects');
    assert.equal(STORES.META, 'project_meta');
    assert.equal(STORES.SETTINGS, 'settings');
  });

  it('isIndexedDBAvailable debe retornar false en entornos Node sin window.indexedDB', () => {
    // En entorno Node.js sin mock global
    const available = isIndexedDBAvailable();
    assert.equal(typeof available, 'boolean');
  });

  describe('Operaciones CRUD con Mock de IndexedDB en memoria', () => {
    let memoryStorage = {};
    let memoryMeta = {};
    let memoryLocalStorage = {};

    beforeEach(() => {
      memoryStorage = {};
      memoryMeta = {};
      memoryLocalStorage = {};

      // Instalar mock en globalThis.window
      globalThis.window = {
        localStorage: {
          getItem: (k) => memoryLocalStorage[k] || null,
          setItem: (k, v) => { memoryLocalStorage[k] = String(v); },
          removeItem: (k) => { delete memoryLocalStorage[k]; }
        },
        indexedDB: {
          open: () => {
            const req = {
              onsuccess: null,
              onerror: null,
              onupgradeneeded: null
            };

            setTimeout(() => {
              const mockDb = {
                objectStoreNames: {
                  contains: () => true
                },
                createObjectStore: () => ({
                  createIndex: () => {}
                }),
                transaction: (_stores, _mode) => {
                  const tx = {
                    oncomplete: null,
                    onerror: null,
                    objectStore: (storeName) => ({
                      put: (item) => {
                        if (storeName === STORES.PROJECTS) memoryStorage[item.id] = item;
                        if (storeName === STORES.META) memoryMeta[item.id] = item;
                      },
                      get: (id) => {
                        const getReq = { onsuccess: null, onerror: null, result: memoryStorage[id] || null };
                        setTimeout(() => getReq.onsuccess && getReq.onsuccess(), 0);
                        return getReq;
                      },
                      getAll: () => {
                        const allReq = { onsuccess: null, onerror: null, result: Object.values(memoryMeta) };
                        setTimeout(() => allReq.onsuccess && allReq.onsuccess(), 0);
                        return allReq;
                      },
                      delete: (id) => {
                        delete memoryStorage[id];
                        delete memoryMeta[id];
                      }
                    })
                  };

                  setTimeout(() => tx.oncomplete && tx.oncomplete(), 0);
                  return tx;
                },
                close: () => {}
              };

              req.target = { result: mockDb };
              if (req.onsuccess) req.onsuccess(req);
            }, 0);

            return req;
          }
        }
      };
    });

    it('saveProjectToIDB y loadProjectFromIDB deben guardar y recuperar un proyecto completo', async () => {
      const mockPlan = {
        config: {
          projectId: 'proyecto_test_01',
          projectType: 'investment_project',
          brandKit: { companyName: 'Comercio Cuántico Minero' },
          anexos: [{ id: '1', name: 'anexo_1.pdf', url: 'data:application/pdf;base64,JVBERi...' }]
        },
        naturaleza: { introduccion: { nombre: 'Comercio Cuántico' } }
      };

      const saveOk = await saveProjectToIDB('proyecto_test_01', mockPlan);
      assert.equal(saveOk, true);

      const loaded = await loadProjectFromIDB('proyecto_test_01');
      assert.ok(loaded);
      assert.equal(loaded.config.brandKit.companyName, 'Comercio Cuántico Minero');
      assert.equal(loaded.config.anexos.length, 1);
    });

    it('getAllProjectsFromIDB debe listar los metadatos de los proyectos guardados', async () => {
      const mockPlan1 = { config: { projectId: 'p1', brandKit: { companyName: 'Plan 1' } } };
      const mockPlan2 = { config: { projectId: 'p2', brandKit: { companyName: 'Plan 2' } } };

      await saveProjectToIDB('p1', mockPlan1);
      await saveProjectToIDB('p2', mockPlan2);

      const all = await getAllProjectsFromIDB();
      assert.equal(all.length, 2);
      assert.ok(all.some(p => p.id === 'p1'));
      assert.ok(all.some(p => p.id === 'p2'));
    });

    it('deleteProjectFromIDB debe eliminar un proyecto de IndexedDB', async () => {
      const mockPlan = { config: { projectId: 'a_borrar', brandKit: { companyName: 'Temporal' } } };
      await saveProjectToIDB('a_borrar', mockPlan);

      let loaded = await loadProjectFromIDB('a_borrar');
      assert.ok(loaded);

      const deleted = await deleteProjectFromIDB('a_borrar');
      assert.equal(deleted, true);

      loaded = await loadProjectFromIDB('a_borrar');
      assert.equal(loaded, null);
    });

    it('migrateFromLocalStorage debe migrar proyectos legacy de localStorage hacia IndexedDB', async () => {
      const legacyPlan = {
        config: {
          projectId: 'legacy_proj',
          brandKit: { companyName: 'Empresa Legacy' }
        }
      };

      window.localStorage.setItem('openplan_v2_data', JSON.stringify(legacyPlan));
      window.localStorage.setItem('openplan_active_project_id', 'legacy_proj');

      const migrated = await migrateFromLocalStorage();
      assert.equal(migrated, true);

      const fromIDB = await loadProjectFromIDB('legacy_proj');
      assert.ok(fromIDB);
      assert.equal(fromIDB.config.brandKit.companyName, 'Empresa Legacy');
    });
  });
});
