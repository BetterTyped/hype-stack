/*
 * React Native Testing Library types its matchers (toHaveTextContent, toBeOnTheScreen, ...) onto
 * the global `jest.Matchers` namespace. Vitest 4 extended its own `Assertion` from that namespace,
 * so the matchers were typed for free. Vitest 5 dropped that bridge, and without it every
 * `expect(el).toHaveTextContent(...)` fails typecheck even though it passes at runtime.
 *
 * The import loads RNTL's global declaration; the augmentation re-attaches it to vitest.
 */
import "@testing-library/react-native";

declare module "vitest" {
  interface Assertion<R, T> extends jest.Matchers<R, T> {}
}
