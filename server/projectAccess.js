import fs from 'fs';
import path from 'path';

/**
 * @file projectAccess.js
 * @description Control de acceso centralizado a proyectos según roles y aislamiento por usuario.
 * 
 * Roles soportados:
 * - Superadmin: Acceso total de lectura, edición, exportación, archivo y restauración de cualquier proyecto.
 *   Exclusividad para proyectos confidenciales como Comercio Cuántico TR.
 * - Revisor: Consulta proyectos y agrega notas/comentarios. Prohibida la edición o administración.
 * - Usuario: Acceso confinado exclusivamente a sus proyectos propios y lectura/clonación de proyectos ejemplo.
 * 
 * [SECDD] Aislamiento multi-tenant y prevención de cruce de proyectos o Directory Traversal.
 * [DDD] Entidades: ProjectLocation { path, owner, kind: 'owned' | 'shared' | 'example' | 'administered' | 'review' }
 */

export const EXAMPLE_PROJECT_IDS = new Set([
  'br_jula_financiera_mx',
  'brujula',
  'ferreter_a_y_suministros_kino',
  'ferreteria_kino',
  'sove',
  'vcv_cortes_finos_sa_de_cv'
]);

export const PRIVATE_ADMIN_IDS = new Set([
  'comercio_cu_ntico_internacional_tr_sapi_de_cv'
]);

const SAFE_SEGMENT = /^[a-z0-9][a-z0-9_-]{0,119}$/i;

/**
 * Valida que un segmento de ruta sea alfanumérico seguro para evitar Directory Traversal.
 * @param {string} value
 * @param {string} [label='identificador']
 * @returns {string}
 */
export function assertSafeProjectSegment(value, label = 'identificador') {
  if (!SAFE_SEGMENT.test(String(value || ''))) {
    throw new Error(`${label} inválido.`);
  }
  return String(value);
}

/**
 * Determina el nombre de carpeta para un usuario, garantizando retrocompatibilidad con carpetas existentes.
 * @param {Object} user
 * @returns {string}
 */
export function userFolder(user) {
  if (!user) return 'user_anon';
  const raw = user.username || user.id || 'anon';
  return `user_${String(raw).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
}

/**
 * Retorna las rutas candidatas estándar para un proyecto.
 * @param {string} type Tipo de proyecto ('negocios', 'social', etc.)
 * @param {string} id ID del proyecto
 * @param {Object} user Usuario solicitante
 * @returns {{ root: string, own: string, shared: string }}
 */
export function projectPaths(type, id, user) {
  assertSafeProjectSegment(type, 'tipo');
  assertSafeProjectSegment(id, 'id_proyecto');
  const root = path.resolve('proyectos', type);
  const own = path.join(root, userFolder(user), id, `${id}.json`);
  const shared = path.join(root, id, `${id}.json`);
  return { root, own, shared };
}

/**
 * Resuelve la ubicación y permisos de lectura de un proyecto.
 * @param {string} type Tipo de proyecto
 * @param {string} id ID del proyecto
 * @param {Object} user Usuario autenticado
 * @returns {{ path: string, owner: string, kind: string }|null}
 */
export function resolveReadableProject(type, id, user) {
  assertSafeProjectSegment(type, 'tipo');
  assertSafeProjectSegment(id, 'id_proyecto');

  const root = path.resolve('proyectos', type);
  if (!fs.existsSync(root)) return null;

  const isSuperadmin = user?.role === 'superadmin';
  const isRevisor = user?.role === 'revisor';
  const isPrivate = PRIVATE_ADMIN_IDS.has(id);

  // Comercio Cuántico TR y proyectos privados son de acceso EXCLUSIVO para superadmin
  if (isPrivate && !isSuperadmin) {
    return null;
  }

  // 1. Verificar si es proyecto propio del usuario
  const ownPath = path.join(root, userFolder(user), id, `${id}.json`);
  if (fs.existsSync(ownPath)) {
    return { path: ownPath, owner: user.username, kind: 'owned' };
  }

  // Si existe carpeta alternativa por user.id (migración)
  if (user?.id) {
    const ownByIdPath = path.join(root, `user_${String(user.id).replace(/[^a-z0-9]/gi, '_').toLowerCase()}`, id, `${id}.json`);
    if (fs.existsSync(ownByIdPath)) {
      return { path: ownByIdPath, owner: user.username, kind: 'owned' };
    }
  }

  // 2. Verificar proyecto compartido en la raíz
  const sharedPath = path.join(root, id, `${id}.json`);
  if (fs.existsSync(sharedPath)) {
    if (isSuperadmin) {
      return { path: sharedPath, owner: 'admin', kind: 'shared' };
    }
    if (EXAMPLE_PROJECT_IDS.has(id) || !isPrivate) {
      return { path: sharedPath, owner: 'ejemplo', kind: 'example' };
    }
  }

  // 3. Si el usuario es Superadmin o Revisor, buscar en todas las carpetas de usuarios
  if (isSuperadmin || isRevisor) {
    try {
      const entries = fs.readdirSync(root, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('user_')) {
          const candidate = path.join(root, entry.name, id, `${id}.json`);
          if (fs.existsSync(candidate)) {
            const ownerName = entry.name.replace(/^user_/, '');
            return {
              path: candidate,
              owner: ownerName,
              kind: isSuperadmin ? 'administered' : 'review'
            };
          }
        }
      }
    } catch {
      // Ignorar errores de lectura en directorios
    }
  }

  // 4. Si el usuario es colaborador registrado en el proyecto de otro usuario
  if (user?.username) {
    try {
      const entries = fs.readdirSync(root, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('user_') && entry.name !== userFolder(user)) {
          const candidate = path.join(root, entry.name, id, `${id}.json`);
          if (fs.existsSync(candidate)) {
            try {
              const projectJson = JSON.parse(fs.readFileSync(candidate, 'utf8'));
              const collabs = (projectJson.config?.collaborators || projectJson.collaborators || []);
              if (Array.isArray(collabs)) {
                const targetUname = String(user.username || '').toLowerCase();
                const targetEmail = String(user.email || '').toLowerCase();
                const isMatch = collabs.some(c => {
                  const normalized = String(c || '').toLowerCase();
                  return normalized === targetUname || (targetEmail && normalized === targetEmail);
                });
                if (isMatch) {
                  const ownerName = entry.name.replace(/^user_/, '');
                  return {
                    path: candidate,
                    owner: ownerName,
                    kind: 'collaborator'
                  };
                }
              }
            } catch {
              // Ignorar errores de parseo
            }
          }
        }
      }
    } catch {
      // Ignorar errores de lectura en directorios
    }
  }

  return null;
}

/**
 * Resuelve la ubicación y permisos de escritura/mutación de un proyecto.
 * @param {string} type
 * @param {string} id
 * @param {Object} user
 * @returns {{ path: string, owner: string, kind: string }|null}
 */
export function resolveWritableProject(type, id, user) {
  // Los revisores tienen prohibida de forma estricta la escritura o mutación
  if (user?.role === 'revisor') {
    return null;
  }

  const result = resolveReadableProject(type, id, user);
  if (!result) return null;

  // El superadmin puede escribir en cualquier proyecto legible
  if (user?.role === 'superadmin') {
    return result;
  }

  // El usuario regular puede modificar proyectos propios o donde es colaborador autorizado
  if (result.kind === 'owned' || result.kind === 'collaborator') {
    return result;
  }

  return null;
}

/**
 * Resuelve la fuente válida para clonar o duplicar un proyecto.
 * @param {string} type
 * @param {string} id
 * @param {Object} user
 * @returns {{ path: string, owner: string, kind: string }|null}
 */
export function resolveCloneSource(type, id, user) {
  const result = resolveReadableProject(type, id, user);
  if (!result) return null;

  // Un usuario puede clonar ejemplos, proyectos compartidos o duplicar sus propios proyectos
  if (result.kind === 'owned' || result.kind === 'example' || result.kind === 'shared') {
    return result;
  }

  // Superadmin puede clonar cualquier proyecto accesible
  if (user?.role === 'superadmin') {
    return result;
  }

  return null;
}

/**
 * Transfiere la titularidad de un proyecto de un usuario a otro de forma atómica.
 * Exclusivo para gestión docente y superadministración.
 * Preserva al dueño anterior como colaborador para evitar pérdida de trabajo en equipo.
 * 
 * @param {Object} params
 * @param {string} params.type Tipo de proyecto ('negocios'|'social')
 * @param {string} params.id ID del proyecto
 * @param {Object} params.targetUser Usuario destino que será el nuevo propietario
 * @param {Object} params.currentUser Usuario autenticado que realiza la acción (debe ser superadmin)
 * @returns {{ success: boolean, newPath: string, previousOwner: string, newOwner: string }}
 */
export function transferProjectOwnership({ type, id, targetUser, currentUser }) {
  assertSafeProjectSegment(type, 'tipo');
  assertSafeProjectSegment(id, 'id_proyecto');

  if (currentUser?.role !== 'superadmin') {
    throw new Error('Solo un administrador o profesor puede reasignar la titularidad del proyecto.');
  }

  if (!targetUser || (!targetUser.username && !targetUser.id)) {
    throw new Error('Usuario destinatario inválido para reasignación.');
  }

  const project = resolveReadableProject(type, id, currentUser);
  if (!project) {
    throw new Error(`Proyecto ${id} no encontrado.`);
  }

  const previousOwner = project.owner;
  const targetFolder = userFolder(targetUser);
  const root = path.resolve('proyectos', type);
  const targetProjectDir = path.join(root, targetFolder, id);
  const targetJsonPath = path.join(targetProjectDir, `${id}.json`);

  const currentProjectDir = path.dirname(project.path);

  // Si ya pertenece a ese usuario, no es necesario mover directorios
  if (path.resolve(currentProjectDir) === path.resolve(targetProjectDir)) {
    return {
      success: true,
      newPath: project.path,
      previousOwner,
      newOwner: targetUser.username || targetUser.id
    };
  }

  // Crear directorio destino si no existe
  if (!fs.existsSync(targetProjectDir)) {
    fs.mkdirSync(targetProjectDir, { recursive: true });
  }

  // Leer y actualizar el contenido del proyecto
  const raw = fs.readFileSync(project.path, 'utf8');
  const data = JSON.parse(raw);
  data.config = data.config || {};
  const prevOwnerUsername = data.config.userOwner || previousOwner;
  const newOwnerUsername = targetUser.username || targetUser.id;

  data.config.userOwner = newOwnerUsername;
  data.config.fechaActualizacion = new Date().toISOString();

  // Asegurar que el dueño anterior permanezca como colaborador si no era admin
  data.config.collaborators = Array.isArray(data.config.collaborators) ? data.config.collaborators : [];
  if (prevOwnerUsername && prevOwnerUsername !== 'admin' && prevOwnerUsername !== newOwnerUsername) {
    const collabsLower = data.config.collaborators.map(c => String(c).toLowerCase());
    if (!collabsLower.includes(prevOwnerUsername.toLowerCase())) {
      data.config.collaborators.push(prevOwnerUsername);
    }
  }
  // Remover al nuevo dueño de la lista de colaboradores si estaba en ella
  data.config.collaborators = data.config.collaborators.filter(c => String(c).toLowerCase() !== newOwnerUsername.toLowerCase());

  // Agregar registro en el historial de revisiones
  data.config.reviewHistory = Array.isArray(data.config.reviewHistory) ? data.config.reviewHistory : [];
  data.config.reviewHistory.push({
    timestamp: new Date().toISOString(),
    event: 'OWNERSHIP_TRANSFERRED',
    from: prevOwnerUsername,
    to: newOwnerUsername,
    by: currentUser.username,
    role: currentUser.role
  });

  // Guardar archivo JSON actualizado en el destino
  fs.writeFileSync(targetJsonPath, JSON.stringify(data, null, 2), 'utf8');

  // Copiar archivos adicionales (documentos, md, etc.) si existen
  try {
    const entries = fs.readdirSync(currentProjectDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name !== `${id}.json`) {
        const srcPath = path.join(currentProjectDir, entry.name);
        const destPath = path.join(targetProjectDir, entry.name);
        if (entry.isDirectory()) {
          fs.cpSync(srcPath, destPath, { recursive: true });
        } else {
          fs.copyFileSync(srcPath, destPath);
        }
      }
    }
  } catch (copyErr) {
    console.warn('[ProjectAccess] Advertencia al migrar anexos de proyecto:', copyErr.message);
  }

  // Eliminar directorio anterior de forma segura una vez verificado el nuevo
  if (fs.existsSync(targetJsonPath)) {
    try {
      fs.rmSync(currentProjectDir, { recursive: true, force: true });
    } catch (rmErr) {
      console.warn('[ProjectAccess] No se pudo eliminar directorio origen tras migrar:', rmErr.message);
    }
  }

  return {
    success: true,
    newPath: targetJsonPath,
    previousOwner: prevOwnerUsername,
    newOwner: newOwnerUsername
  };
}
