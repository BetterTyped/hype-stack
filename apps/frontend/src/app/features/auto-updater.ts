import { updateElectronApp, UpdateSourceType } from "update-electron-app";

import { appConfig } from "@/config";

/**
 * Your app will check for updates at startup, then every ten minutes. This interval is configurable.
 * No need to wait for your app's ready event; the module figures that out.
 * If an update is found, it will automatically be downloaded in the background.
 * When an update is finished downloading, a dialog is displayed allowing the user to restart the app now or later.
 */
export const autoUpdater = () => {
  updateElectronApp({
    updateSource: {
      type: UpdateSourceType.ElectronPublicUpdateService,
      repo: `${appConfig.repository.owner}/${appConfig.repository.name}`,
    },
    updateInterval: "1 hour",
  });
};
