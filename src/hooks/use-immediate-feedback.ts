import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "settings:immediate-feedback";

export function useImmediateFeedback() {
  const [immediateFeedback, setImmediateFeedbackState] = useState<
    boolean | null
  >(null);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      setImmediateFeedbackState(raw === null ? true : raw === "true");
    });
  }, []);

  const setImmediateFeedback = useCallback((value: boolean) => {
    setImmediateFeedbackState(value);
    AsyncStorage.setItem(STORAGE_KEY, String(value));
  }, []);

  return { immediateFeedback, setImmediateFeedback };
}
