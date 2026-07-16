/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AstrologyData } from "./astrology";

export interface CachedHoroscopeRecord {
  id: string; // composite key: horoscope_date_time_lat_long
  name: string;
  date: string;
  time: string;
  location: string;
  latitude: number;
  longitude: number;
  timezone: number;
  timestamp: number;
  data: AstrologyData;
}

const DB_NAME = "JHoraAICacheDB";
const STORE_NAME = "horoscopes";
const DB_VERSION = 1;

/**
 * Initializes the IndexedDB database and returns a Promise resolving to the IDBDatabase instance.
 */
export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      reject(new Error("IndexedDB is not supported in this environment."));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB open error:", request.error);
      reject(request.error || new Error("Failed to open IndexedDB"));
    };

    request.onsuccess = (event) => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("timestamp", "timestamp", { unique: false });
        store.createIndex("name", "name", { unique: false });
      }
    };
  });
}

/**
 * Generates a unique composite key for a horoscope based on its coordinates and birth parameters.
 */
export function generateCompositeKey(
  date: string,
  time: string,
  latitude: number,
  longitude: number
): string {
  // Normalize coordinates to 4 decimal places to prevent slight floating point mismatches
  const latStr = Number(latitude).toFixed(4);
  const lngStr = Number(longitude).toFixed(4);
  return `horoscope_${date}_${time}_${latStr}_${lngStr}`;
}

/**
 * Saves a horoscope calculation in IndexedDB.
 */
export async function saveCachedHoroscope(
  name: string,
  date: string,
  time: string,
  location: string,
  latitude: number,
  longitude: number,
  timezone: number,
  data: AstrologyData
): Promise<string> {
  const db = await initDB();
  const id = generateCompositeKey(date, time, latitude, longitude);
  
  const record: CachedHoroscopeRecord = {
    id,
    name,
    date,
    time,
    location,
    latitude,
    longitude,
    timezone,
    timestamp: Date.now(),
    data
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(record);

    request.onsuccess = () => {
      resolve(id);
    };

    request.onerror = () => {
      console.error("Failed to save horoscope to IndexedDB:", request.error);
      reject(request.error || new Error("Save operation failed"));
    };
  });
}

/**
 * Retrieves a single cached horoscope based on inputs.
 */
export async function getCachedHoroscope(
  date: string,
  time: string,
  latitude: number,
  longitude: number
): Promise<CachedHoroscopeRecord | null> {
  const db = await initDB();
  const id = generateCompositeKey(date, time, latitude, longitude);

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result || null);
    };

    request.onerror = () => {
      console.error("Failed to retrieve horoscope from IndexedDB:", request.error);
      reject(request.error || new Error("Retrieve operation failed"));
    };
  });
}

/**
 * Retrieves all cached horoscope records sorted by calculation timestamp (descending).
 */
export async function getAllCachedHoroscopes(): Promise<CachedHoroscopeRecord[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index("timestamp");
    const records: CachedHoroscopeRecord[] = [];

    // Open cursor sorted by key (timestamp index values)
    // To sort descending, we can use "prev" direction
    const request = index.openCursor(null, "prev");

    request.onsuccess = (event) => {
      const cursor = request.result;
      if (cursor) {
        records.push(cursor.value as CachedHoroscopeRecord);
        cursor.continue();
      } else {
        resolve(records);
      }
    };

    request.onerror = () => {
      console.error("Failed to retrieve all cached horoscopes:", request.error);
      reject(request.error || new Error("Get all operation failed"));
    };
  });
}

/**
 * Deletes a cached horoscope record by ID.
 */
export async function deleteCachedHoroscope(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error("Failed to delete cached horoscope:", request.error);
      reject(request.error || new Error("Delete operation failed"));
    };
  });
}

/**
 * Clears all cached records in the horoscope store.
 */
export async function clearAllCachedHoroscopes(): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      console.error("Failed to clear horoscope cache:", request.error);
      reject(request.error || new Error("Clear operation failed"));
    };
  });
}
