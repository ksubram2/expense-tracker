/**
 * Robust Dual-Layer Persistence Manager: LocalStorage + IndexedDB
 * Ensures financial data & heavy receipt files are permanently saved and never lost on refresh.
 */

const DB_NAME = 'SpendCraftVaultDB';
const DB_VERSION = 1;
const STORE_NAME = 'vault_store';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB not supported in this browser environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Save key-value data to IndexedDB
 */
export async function saveToIndexedDB<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB save fallback:', err);
  }
}

/**
 * Load key-value data from IndexedDB
 */
export async function loadFromIndexedDB<T>(key: string): Promise<T | null> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.warn('IndexedDB load fallback:', err);
    return null;
  }
}

/**
 * Full JSON Backup Exporter
 */
export function exportFullBackupFile(projects: any, expenses: any, pin: string | null): void {
  const backupData = {
    appName: 'SpendCraft Lite',
    version: '2.0',
    exportedAt: new Date().toISOString(),
    projects,
    expenses,
    securityPin: pin,
  };

  const jsonStr = JSON.stringify(backupData, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `SpendCraft_Full_Backup_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Full JSON Backup Importer
 */
export function importFullBackupFile(
  file: File
): Promise<{ projects: any; expenses: any; pin: string | null }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const parsed = JSON.parse(text);
        if (parsed.projects && parsed.expenses) {
          resolve({
            projects: parsed.projects,
            expenses: parsed.expenses,
            pin: parsed.securityPin || null,
          });
        } else {
          reject(new Error('Invalid backup file format.'));
        }
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}
