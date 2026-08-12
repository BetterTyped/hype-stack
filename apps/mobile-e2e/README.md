# @hype-stack/mobile-e2e

Maestro flows for the Expo app in `apps/mobile`.

## Prerequisites

1. Install the Maestro CLI (it is not an npm package):

   ```sh
   curl -fsSL "https://get.maestro.mobile.dev" | bash
   ```

2. Start an iOS Simulator or Android emulator.

3. Build and install a dev client of the app - Maestro drives a real binary, so
   Expo Go and the Metro web target are not enough:

   ```sh
   pnpm --filter @hype-stack/mobile native:prebuild
   pnpm --filter @hype-stack/mobile ios     # or: android
   ```

## Running

```sh
pnpm --filter @hype-stack/mobile-e2e e2e
```

Flows live in `flows/` and target the `com.hypestack.app` bundle identifier
declared in `apps/mobile/app.json`. Elements are matched by the `testID` props
set in the app, so keep those stable when editing screens.
