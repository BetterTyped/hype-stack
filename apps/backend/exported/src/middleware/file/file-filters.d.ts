type FileFilterCallback = (error: null, accept: boolean) => void;
/**
 * Create a multer fileFilter that only accepts files matching the given mime type prefixes.
 *
 * @example
 * ```ts
 * fileUpload({ fileFilter: acceptMimeTypes("image/") }).single("avatar")
 * fileUpload({ fileFilter: acceptMimeTypes("image/png", "image/jpeg") }).single("photo")
 * ```
 */
export declare const acceptMimeTypes: (...prefixes: string[]) => (_req: unknown, file: Express.Multer.File, cb: FileFilterCallback) => void;
/** Shorthand: only accept image/* uploads */
export declare const imageOnly: (_req: unknown, file: Express.Multer.File, cb: FileFilterCallback) => void;
export {};
//# sourceMappingURL=file-filters.d.ts.map