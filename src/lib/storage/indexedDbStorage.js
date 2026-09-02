/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Motor de Almacenamiento Local de Alta Capacidad con IndexedDB Nativo
 * Base de Datos: OpenBusinessPlanDB
 * 
 * Permite almacenar cientos de megabytes de proyectos, imágenes en alta resolución,
 * anexos y documentos RAG en el navegador, superando el límite estricto de 5 MB
 * de localStorage.
 * ─────────────────────────────────────────────────────────────────────────────
 */

const DB_NAME = 'OpenBusinessPlanDB';
const DB_VERSION = 1;

export const STORES = {
  PROJECTS: 'projects',
  META: 'project_meta',
  SETTINGS: 'settings'
};

/**
 * Comprueba si la API de IndexedDB está disponible en el entorno de ejecución.
 * @returns {boolean}
 */
export const isIndexedDBAvailable = () => {
  return typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';
};

/**
 * Inicializa y abre la conexión a la base de datos IndexedDB.
 * @returns {Promise<IDBDatabase>}
 */
export const initDB = () => {
  return new Promise((resolve, reject) => {
    if (!isIndexedDBAvailable()) {
      return reject(new Error('IndexedDB no está disponible en este entorno.'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Store de Proyectos completos (planData íntegro)
      if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
        db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
      }

      // 2. Store de Metadatos rápidos para listas y búsquedas
      if (!db.objectStoreNames.contains(STORES.META)) {
        const metaStore = db.createObjectStore(STORES.META, { keyPath: 'id' });
        metaStore.createIndex('updatedAt', 'updatedAt', { unique: false });
        metaStore.createIndex('projectType', 'projectType', { unique: false });
      }

      // 3. Store de Ajustes y configuraciones de sesión
      if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
        db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(new Error(`Error al abrir IndexedDB: ${event.target.error?.message || 'Fallo desconocido'}`));
    };
  });
};

/**
 * Guarda un proyecto completo en IndexedDB.
 *
 * @param {string} projectId - Identificador único del proyecto
 * @param {Object} planData - Objeto de datos completo del plan de negocio
 * @returns {Promise<boolean>}
 */
export const saveProjectToIDB = async (projectId, planData) => {
  if (!isIndexedDBAvailable() || !planData) return false;

  const validId = String(projectId || planData.config?.projectId || 'active_project').trim();
  const projectName = planData.config?.brandKit?.companyName || planData.semilla?.nombre_proyecto || validId;
  const projectType = planData.config?.projectType || 'business';

  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORES.PROJECTS, STORES.META], 'readwrite');
      const projectStore = transaction.objectStore(STORES.PROJECTS);
      const metaStore = transaction.objectStore(STORES.META);

      const record = {
        id: validId,
        data: planData,
        updatedAt: Date.now()
      };

      const metaRecord = {
        id: validId,
        name: projectName,
        projectType,
        anexosCount: Array.isArray(planData.config?.anexos) ? planData.config.anexos.length : 0,
        documentsCount: Array.isArray(planData.config?.documents) ? planData.config.documents.length : 0,
        updatedAt: Date.now()
      };

      projectStore.put(record);
      metaStore.put(metaRecord);

      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };

      transaction.onerror = (event) => {
        db.close();
        console.error('[IndexedDB] Error al guardar proyecto:', event.target.error);
        reject(event.target.error);
      };
    });
  } catch (err) {
    console.error('[IndexedDB] Excepción en saveProjectToIDB:', err);
    return false;
  }
};

/**
 * Carga un proyecto completo desde IndexedDB por su ID.
 *
 * @param {string} projectId - Identificador del proyecto a recuperar
 * @returns {Promise<Object|null>} - Retorna planData o null si no existe
 */
export const loadProjectFromIDB = async (projectId) => {
  if (!isIndexedDBAvailable()) return null;
  const validId = String(projectId || 'active_project').trim();

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.PROJECTS], 'readonly');
      const projectStore = transaction.objectStore(STORES.PROJECTS);
      const request = projectStore.get(validId);

      request.onsuccess = () => {
        db.close();
        if (request.result && request.result.data) {
          resolve(request.result.data);
        } else {
          resolve(null);
        }
      };

      request.onerror = (event) => {
        db.close();
        console.warn('[IndexedDB] Error al leer proyecto:', event.target.error);
        resolve(null);
      };
    });
  } catch (err) {
    console.warn('[IndexedDB] Excepción en loadProjectFromIDB:', err);
    return null;
  }
};

/**
 * Obtiene la lista de todos los proyectos almacenados localmente en IndexedDB.
 *
 * @returns {Promise<Array<Object>>}
 */
export const getAllProjectsFromIDB = async () => {
  if (!isIndexedDBAvailable()) return [];

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.META], 'readonly');
      const metaStore = transaction.objectStore(STORES.META);
      const request = metaStore.getAll();

      request.onsuccess = () => {
        db.close();
        resolve(request.result || []);
      };

      request.onerror = () => {
        db.close();
        resolve([]);
      };
    });
  } catch {
    return [];
  }
};

/**
 * Elimina un proyecto de IndexedDB.
 *
 * @param {string} projectId - Identificador del proyecto
 * @returns {Promise<boolean>}
 */
export const deleteProjectFromIDB = async (projectId) => {
  if (!isIndexedDBAvailable() || !projectId) return false;

  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORES.PROJECTS, STORES.META], 'readwrite');
      transaction.objectStore(STORES.PROJECTS).delete(projectId);
      transaction.objectStore(STORES.META).delete(projectId);

      transaction.oncomplete = () => {
        db.close();
        resolve(true);
      };

      transaction.onerror = () => {
        db.close();
        resolve(false);
      };
    });
  } catch {
    return false;
  }
};

/**
 * Migra de forma transparente los datos previos almacenados en localStorage
 * hacia IndexedDB para liberar el espacio de 5MB del navegador.
 *
 * @returns {Promise<boolean>}
 */
export const migrateFromLocalStorage = async () => {
  if (typeof window === 'undefined' || !isIndexedDBAvailable()) return false;

  try {
    const rawLegacyData = window.localStorage.getItem('openplan_v2_data');
    if (!rawLegacyData) return false;

    const parsedData = JSON.parse(rawLegacyData);
    if (!parsedData || typeof parsedData !== 'object') return false;

    const activeId = window.localStorage.getItem('openplan_active_project_id') || 'active_project';
    console.log('[IndexedDB] Migrando datos legacy de localStorage hacia IndexedDB...');

    const success = await saveProjectToIDB(activeId, parsedData);
    if (success) {
      // Guardar respaldo de verificación antes de purgar
      console.log('[IndexedDB] Migración completada exitosamente. Proyecto persistido en IndexedDB.');
      return true;
    }
    return false;
  } catch (err) {
    console.warn('[IndexedDB] No se pudo migrar datos de localStorage:', err);
    return false;
  }
};
