import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "day-counter:used-dates";

function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

async function loadUsedDates(): Promise<Set<string>> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return new Set();
  try {
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

async function recordUsedDate(): Promise<Set<string>> {
  const dates = await loadUsedDates();
  const today = getLocalDateString();
  if (!dates.has(today)) {
    dates.add(today);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...dates]));
  }
  return dates;
}

export function useDayCounter() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    loadUsedDates().then((dates) => setCount(dates.size));
  }, []);

  const recordSession = useCallback(() => {
    recordUsedDate().then((dates) => setCount(dates.size));
  }, []);

  return { count, recordSession };
}
