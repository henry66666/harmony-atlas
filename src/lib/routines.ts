import { useEffect, useState } from "react";
import type { Course, Step } from "./content";

export type CustomRoutine = Course & {
  custom: true;
  createdAt: number;
};

const DB_NAME = "qiwell";
const DB_VERSION = 1;
const STORE = "routines";
const LEGACY_KEY = "qiwell.customRoutines.v1";

let cache: CustomRoutine[] = [];
let hydrated = false;
let hydratePromise: Promise<void> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(): Promise<CustomRoutine[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve((req.result as CustomRoutine[]) ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function idbPut(item: CustomRoutine): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function idbDelete(id: string): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function migrateLegacy(): Promise<CustomRoutine[]> {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw) as CustomRoutine[];
    for (const item of arr) {
      try {
        await idbPut(item);
      } catch {
        // ignore individual failures
      }
    }
    window.localStorage.removeItem(LEGACY_KEY);
    return arr;
  } catch {
    try {
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {}
    return [];
  }
}

function sortDesc(list: CustomRoutine[]): CustomRoutine[] {
  return [...list].sort((a, b) => b.createdAt - a.createdAt);
}

export function hydrateRoutines(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (hydrated) return Promise.resolve();
  if (hydratePromise) return hydratePromise;
  hydratePromise = (async () => {
    try {
      await migrateLegacy();
      const all = await idbGetAll();
      cache = sortDesc(all);
    } catch {
      cache = [];
    } finally {
      hydrated = true;
      notify();
    }
  })();
  return hydratePromise;
}

if (typeof window !== "undefined") {
  void hydrateRoutines();
}

export function getCustomRoutines(): CustomRoutine[] {
  return cache;
}

export function getCustomRoutine(id: string): CustomRoutine | undefined {
  return cache.find((r) => r.id === id);
}

export async function deleteCustomRoutine(id: string): Promise<boolean> {
  await hydrateRoutines();
  const exists = cache.some((r) => r.id === id);
  if (!exists) return false;
  cache = cache.filter((r) => r.id !== id);
  notify();
  try {
    await idbDelete(id);
  } catch {
    // best effort; cache is already updated
  }
  return true;
}

export async function saveCustomRoutine(routine: {
  name: string;
  goal: string | null;
  steps: Step[];
}): Promise<CustomRoutine> {
  await hydrateRoutines();
  const totalSeconds = routine.steps.reduce((s, m) => s + (m.seconds || 0), 0);
  const minutes = Math.max(1, Math.round(totalSeconds / 60));
  const id = `custom-${Date.now()}`;
  const item: CustomRoutine = {
    id,
    title: routine.name,
    subtitle: "My routine",
    category: "tuina",
    level: "Gentle",
    minutes,
    goal: routine.goal ?? "Custom",
    bestFor: routine.goal ?? "Personal practice",
    accent: "sage",
    steps: routine.steps,
    custom: true,
    createdAt: Date.now(),
  };
  cache = sortDesc([item, ...cache]);
  notify();
  await idbPut(item);
  return item;
}

function useRoutinesSubscription() {
  const [, setVersion] = useState(0);
  useEffect(() => {
    const l = () => setVersion((v) => v + 1);
    listeners.add(l);
    void hydrateRoutines();
    return () => {
      listeners.delete(l);
    };
  }, []);
}

export function useCustomRoutines(): CustomRoutine[] {
  useRoutinesSubscription();
  return cache;
}

export function useCustomRoutine(id: string): CustomRoutine | undefined {
  useRoutinesSubscription();
  return cache.find((r) => r.id === id);
}
