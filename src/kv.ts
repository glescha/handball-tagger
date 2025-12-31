// src/kv.ts
const DB_NAME = "hb_db";
const DB_VERSION = 2;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;

      // matches store (keyPath = matchId)
      if (!db.objectStoreNames.contains("matches")) {
        db.createObjectStore("matches", { keyPath: "matchId" });
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("indexedDB open failed"));
  });

  return dbPromise;
}

function txDone(tx: IDBTransaction) {
  return new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IDB tx error"));
    tx.onabort = () => reject(tx.error ?? new Error("IDB tx abort"));
  });
}

export async function kvPut(storeName: string, value: any): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).put(value);
  await txDone(tx);
}

export async function kvGet<T>(storeName: string, key: IDBValidKey): Promise<T | undefined> {
  const db = await openDB();
  const tx = db.transaction(storeName, "readonly");
  const req = tx.objectStore(storeName).get(key);

  const value = await new Promise<any>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error ?? new Error("IDB get failed"));
  });

  await txDone(tx);
  return value as T | undefined;
}

export async function kvGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openDB();
  const tx = db.transaction(storeName, "readonly");
  const req = tx.objectStore(storeName).getAll();

  const value = await new Promise<any[]>((resolve, reject) => {
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error ?? new Error("IDB getAll failed"));
  });

  await txDone(tx);
  return (value ?? []) as T[];
}

export async function kvDel(storeName: string, key: IDBValidKey): Promise<void> {
  const db = await openDB();
  const tx = db.transaction(storeName, "readwrite");
  tx.objectStore(storeName).delete(key);
  await txDone(tx);
}
