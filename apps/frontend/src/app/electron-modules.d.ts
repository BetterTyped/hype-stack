declare module "update-electron-app" {
  export enum UpdateSourceType {
    ElectronPublicUpdateService = "ElectronPublicUpdateService",
    StaticStorage = "StaticStorage",
  }
  export function updateElectronApp(options?: {
    updateSource?: { type: UpdateSourceType; repo?: string; baseUrl?: string };
    updateInterval?: string;
    logger?: unknown;
    notifyUser?: boolean;
  }): void;
}

declare module "electron-store" {
  class Store {
    get(key: string): unknown;
    set(key: string, value: unknown): void;
    delete(key: string): void;
    has(key: string): boolean;
    clear(): void;
  }
  export default Store;
}
