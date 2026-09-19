import fs from 'fs';
import path from 'path';

export const EXAMPLE_PROJECT_IDS = new Set(['br_jula_financiera_mx', 'brujula', 'ferreter_a_y_suministros_kino', 'ferreteria_kino', 'sove', 'vcv_cortes_finos_sa_de_cv']);
export const PRIVATE_ADMIN_IDS = new Set(['comercio_cu_ntico_internacional_tr_sapi_de_cv']);

const SAFE_SEGMENT = /^[a-z0-9][a-z0-9_-]{0,119}$/i;

export function assertSafeProjectSegment(value, label = 'identificador') {
  if (!SAFE_SEGMENT.test(String(value || ''))) throw new Error(`${label} inválido.`);
  return String(value);
}

export function userFolder(user) {
  return `user_${String(user?.username || '').replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
}

export function projectPaths(type, id, user) {
  assertSafeProjectSegment(type, 'tipo');
  assertSafeProjectSegment(id);
  const root = path.resolve('proyectos', type);
  const own = path.join(root, userFolder(user), id, `${id}.json`);
  const shared = path.join(root, id, `${id}.json`);
  return { root, own, shared };
}

export function resolveReadableProject(type, id, user) {
  const { own, shared } = projectPaths(type, id, user);
  if (fs.existsSync(own)) return { path: own, owner: user.username, kind: 'owned' };
  if (user?.role === 'superadmin' && fs.existsSync(shared)) return { path: shared, owner: 'admin', kind: 'shared' };
  if (EXAMPLE_PROJECT_IDS.has(id) && fs.existsSync(shared)) return { path: shared, owner: 'example', kind: 'example' };
  if (PRIVATE_ADMIN_IDS.has(id)) return null;
  return null;
}

export function resolveWritableProject(type, id, user) {
  const result = resolveReadableProject(type, id, user);
  if (!result) return null;
  if (user?.role === 'superadmin' || result.kind === 'owned') return result;
  return null;
}

export function resolveCloneSource(type, id, user) {
  const result = resolveReadableProject(type, id, user);
  if (!result || result.kind === 'owned') return null;
  return result;
}
