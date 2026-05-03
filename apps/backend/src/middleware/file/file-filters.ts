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
export const acceptMimeTypes = (...prefixes: string[]) => {
  return (_req: unknown, file: Express.Multer.File, cb: FileFilterCallback) => {
    const allowed = prefixes.some((p) => file.mimetype.startsWith(p));
    if (allowed) return cb(null, true);
    cb(new Error(`Invalid file type "${file.mimetype}". Allowed: ${prefixes.join(", ")}`) as unknown as null, false);
  };
};

/** Shorthand: only accept image/* uploads */
export const imageOnly = acceptMimeTypes("image/");
