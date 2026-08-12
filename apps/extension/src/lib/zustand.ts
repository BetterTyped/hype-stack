/* eslint-disable @typescript-eslint/no-explicit-any */
import { createJSONStorage, PersistStorage } from "zustand/middleware";

export const getPersistStorage = (): PersistStorage<any> => {
  return createJSONStorage(() => ({
    getItem: (key) => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value),
    removeItem: (key) => localStorage.removeItem(key),
  })) as PersistStorage<any>;
};
