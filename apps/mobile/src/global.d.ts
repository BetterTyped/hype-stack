/**
 * Metro turns static image imports into an asset reference that `<Image source>`
 * understands. React Native ships no ambient declaration for them, so we add one.
 */
declare module "*.png" {
  import type { ImageSourcePropType } from "react-native";

  const source: ImageSourcePropType;
  export default source;
}

declare module "*.jpg" {
  import type { ImageSourcePropType } from "react-native";

  const source: ImageSourcePropType;
  export default source;
}
