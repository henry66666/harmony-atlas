import { useEffect, useState } from "react";
import type { Course, Step } from "./content";

export type CustomRoutine = Course & {
  custom: true;
  createdAt: number;
};

const KEY = "qiwell.customRoutines.v1";

function read(): CustomRoutine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CustomRoutine[]) : [];
  } catch {
    return [];
  }
}

function write(list: CustomRoutine[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("qiwell:routines"));
}

export function getCustomRoutines(): CustomRoutine[] {
  return read();
}

export function getCustomRoutine(id: string): CustomRoutine | undefined {
  return read().find((r) => r.id === id);
}

export function saveCustomRoutine(routine: {
  name: string;
  goal: string | null;
  steps: Step[];
}): CustomRoutine {
  const list = read();
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
  write([item, ...list]);
  return item;
}

export function useCustomRoutines(): CustomRoutine[] {
  const [list, setList] = useState<CustomRoutine[]>([]);
  useEffect(() => {
    const sync = () => setList(read());
    sync();
    window.addEventListener("qiwell:routines", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("qiwell:routines", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);
  return list;
}
