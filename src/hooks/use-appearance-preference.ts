import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Appearance, Platform } from "react-native";

const STORAGE_KEY = "settings:appearance";

export type AppearancePreference = "system" | "light" | "dark";

function isAppearancePreference(
  value: string | null,
): value is AppearancePreference {
  return value === "system" || value === "light" || value === "dark";
}

function applyAppearance(preference: AppearancePreference) {
  // react-native-web's Appearance has no setColorScheme, so the override is native-only.
  if (Platform.OS === "web") return;
  Appearance.setColorScheme(
    preference === "system" ? "unspecified" : preference,
  );
}

async function readAppearancePreference(): Promise<AppearancePreference> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return isAppearancePreference(raw) ? raw : "system";
}

/**
 * Reads the saved preference and applies it app-wide. Call once at startup, before
 * the first screen renders, so the app doesn't flash the system scheme first.
 */
export async function loadAppearancePreference() {
  applyAppearance(await readAppearancePreference());
}

export function useAppearancePreference() {
  const [appearance, setAppearanceState] =
    useState<AppearancePreference | null>(null);

  useEffect(() => {
    readAppearancePreference().then(setAppearanceState);
  }, []);

  const setAppearance = useCallback((value: AppearancePreference) => {
    setAppearanceState(value);
    applyAppearance(value);
    AsyncStorage.setItem(STORAGE_KEY, value);
  }, []);

  return { appearance, setAppearance };
}
