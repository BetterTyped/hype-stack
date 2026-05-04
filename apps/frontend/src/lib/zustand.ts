/* eslint-disable @typescript-eslint/no-explicit-any */
import { createJSONStorage, PersistStorage } from "zustand/middleware";

import { isElectronApp } from "@/lib/electron";

export const getPersistStorage = (): PersistStorage<any> => {
  if (isElectronApp) {
    return createJSONStorage(() => ({
      getItem: (key) => window.electron.store.get(key),
      setItem: (key, value) => window.electron.store.set(key, value),
      removeItem: (key) => window.electron.store.delete(key),
    })) as PersistStorage<any>;
  }

  return createJSONStorage(() => ({
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  })) as PersistStorage<any>;
};
