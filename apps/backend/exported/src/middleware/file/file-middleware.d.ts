import type { Options as MulterOptions, StorageEngine } from "multer";
/**
 * Re-export multer's file types and storage engines for convenience
 *
 * @example Type usage
 * ```ts
 * import type { UploadedFile } from "@backend/middleware/file";
 *
 * function processFile(file: UploadedFile) {
 *   console.log(file.filename, file.size, file.path);
 * }
 * ```
 */
export type UploadedFile = Express.Multer.File;
/**
 * Storage engines for file uploads
 *
 * - `diskStorage`: Saves files to disk (default, memory-efficient)
 * - `memoryStorage`: Keeps files in memory (use for small files)
 *
 * @see {@link diskStorage} for disk storage configuration
 * @see {@link memoryStorage} for memory storage
 */
export { memoryStorage, diskStorage } from "multer";
export type { StorageEngine, MulterOptions };
/**
 * Hono middleware adapter for multer
 * Wraps multer to work with Hono's context system with both disk and memory storage support
 *
 * @param options - Multer configuration options
 * @returns Object with file upload methods (single, array, fields, any, none)
 *
 * @example Disk Storage (Default - Memory Efficient)
 * ```ts
 * import { fileUpload, diskStorage } from "@backend/middleware/file";
 *
 * app.post("/upload",
 *   fileUpload({
 *     storage: diskStorage({
 *       destination: "./uploads",
 *       filename: (file) => `${Date.now()}-${file.originalname}`,
 *     }),
 *     limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
 *   }).single("file"),
 *   async (c) => {
 *     const file = c.get("file");
 *     return c.json({
 *       path: file.path,
 *       size: file.size,
 *       filename: file.filename,
 *     });
 *   },
 * );
 * ```
 *
 * @example Memory Storage (For Small Files)
 * ```ts
 * import { fileUpload, memoryStorage } from "@backend/middleware/file";
 *
 * app.post("/upload-memory",
 *   fileUpload({
 *     storage: memoryStorage(),
 *     limits: { fileSize: 1 * 1024 * 1024 }, // 1MB
 *   }).single("avatar"),
 *   async (c) => {
 *     const file = c.get("file");
 *     // file.buffer contains the file data
 *     return c.json({ size: file.size });
 *   },
 * );
 * ```
 *
 * @example File Filtering
 * ```ts
 * app.post("/upload-image",
 *   fileUpload({
 *     storage: diskStorage({ destination: "./uploads" }),
 *     fileFilter: (req, file, cb) => {
 *       if (file.mimetype.startsWith("image/")) {
 *         cb(null, true); // Accept
 *       } else {
 *         cb(new Error("Only images allowed!"), false); // Reject
 *       }
 *     },
 *   }).single("image"),
 *   async (c) => {
 *     const file = c.get("file");
 *     return c.json({ file });
 *   },
 * );
 * ```
 */
export declare function fileUpload(options?: MulterOptions): {
    /**
     * Accept a single file with the given field name
     * The uploaded file will be available in Hono context as `c.get("file")`
     *
     * @param fieldName - The name of the file field in the multipart form
     * @returns Hono middleware
     *
     * @example
     * ```ts
     * app.post("/upload",
     *   fileUpload({ storage: diskStorage({ destination: "./uploads" }) }).single("document"),
     *   async (c) => {
     *     const file = c.get("file");
     *     const body = c.get("body");
     *     return c.json({
     *       message: "File uploaded",
     *       filename: file.filename,
     *       path: file.path,
     *       size: file.size,
     *       body,
     *     });
     *   },
     * );
     * ```
     */
    single: (fieldName: string) => import("hono").MiddlewareHandler<{
        Variables: {
            file: UploadedFile;
            body: Record<string, unknown>;
        };
    }, string, {}, Response>;
    /**
     * Accept multiple files with the same field name
     * The uploaded files will be available in Hono context as `c.get("files")` (array)
     *
     * @param fieldName - The name of the file field in the multipart form
     * @param maxCount - Maximum number of files to accept (optional)
     * @returns Hono middleware
     *
     * @example
     * ```ts
     * app.post("/upload-multiple",
     *   fileUpload({
     *     storage: diskStorage({ destination: "./uploads" }),
     *     limits: {
     *       fileSize: 10 * 1024 * 1024, // 10MB per file
     *       files: 5, // Max 5 files
     *     },
     *   }).array("photos", 5),
     *   async (c) => {
     *     const files = c.get("files"); // Array of uploaded files
     *     const body = c.get("body");
     *     return c.json({
     *       message: `${files.length} files uploaded`,
     *       files: files.map((f) => ({
     *         filename: f.filename,
     *         path: f.path,
     *         size: f.size,
     *       })),
     *       body,
     *     });
     *   },
     * );
     * ```
     */
    array: (fieldName: string, maxCount?: number) => import("hono").MiddlewareHandler<{
        Variables: {
            files: UploadedFile[];
            body: Record<string, unknown>;
        };
    }, string, {}, Response>;
    /**
     * Accept multiple files with different field names
     * The uploaded files will be available in Hono context as `c.get("files")` (object with field names as keys)
     *
     * @param fields - Array of field configurations with name and optional maxCount
     * @returns Hono middleware
     *
     * @example
     * ```ts
     * app.post("/upload-profile",
     *   fileUpload({
     *     storage: diskStorage({ destination: "./uploads" }),
     *   }).fields([
     *     { name: "avatar", maxCount: 1 },
     *     { name: "gallery", maxCount: 8 },
     *     { name: "documents", maxCount: 5 },
     *   ]),
     *   async (c) => {
     *     const files = c.get("files");
     *     const body = c.get("body");
     *     // files = {
     *     //   avatar: [File],
     *     //   gallery: [File, File, ...],
     *     //   documents: [File, File, ...]
     *     // }
     *     return c.json({
     *       avatar: files.avatar?.[0]?.filename,
     *       galleryCount: files.gallery?.length ?? 0,
     *       documentsCount: files.documents?.length ?? 0,
     *       body,
     *     });
     *   },
     * );
     * ```
     */
    fields: (fields: Array<{
        name: string;
        maxCount?: number;
    }>) => import("hono").MiddlewareHandler<{
        Variables: {
            files: Record<string, UploadedFile[]>;
            body: Record<string, unknown>;
        };
    }, string, {}, Response>;
    /**
     * Accept any files regardless of field names
     * All uploaded files will be available in Hono context as `c.get("files")` (array)
     *
     * ⚠️ Use with caution - this accepts files from any field name
     *
     * @returns Hono middleware
     *
     * @example
     * ```ts
     * app.post("/upload-any",
     *   fileUpload({
     *     storage: diskStorage({ destination: "./uploads" }),
     *     limits: {
     *       files: 10, // Limit total number of files
     *       fileSize: 5 * 1024 * 1024, // 5MB per file
     *     },
     *   }).any(),
     *   async (c) => {
     *     const files = c.get("files"); // All uploaded files
     *     const body = c.get("body");
     *     return c.json({
     *       message: `${files.length} files uploaded from any fields`,
     *       files: files.map((f) => ({
     *         fieldname: f.fieldname,
     *         filename: f.filename,
     *         size: f.size,
     *       })),
     *       body,
     *     });
     *   },
     * );
     * ```
     */
    any: () => import("hono").MiddlewareHandler<{
        Variables: {
            files: UploadedFile[];
            body: Record<string, unknown>;
        };
    }, string, {}, Response>;
    /**
     * Accept only text fields - no file uploads allowed
     * Use this when you want to parse multipart/form-data but reject any file uploads
     * Form data will be available in Hono context as `c.get("body")`
     *
     * @returns Hono middleware
     *
     * @example
     * ```ts
     * app.post("/submit-form",
     *   fileUpload().none(),
     *   async (c) => {
     *     const body = c.get("body");
     *     // body contains all text fields from the multipart form
     *     // If any file is uploaded, this will throw an error
     *     return c.json({
     *       message: "Form submitted successfully",
     *       data: body,
     *     });
     *   },
     * );
     * ```
     *
     * @example With validation
     * ```ts
     * app.post("/register",
     *   fileUpload().none(),
     *   async (c) => {
     *     const body = c.get("body");
     *     // Validate text fields only
     *     const { username, email, password } = body;
     *     // Process registration...
     *     return c.json({ message: "User registered" });
     *   },
     * );
     * ```
     */
    none: () => import("hono").MiddlewareHandler<{
        Variables: {
            body: Record<string, unknown>;
        };
    }, string, {}, Response>;
};
//# sourceMappingURL=file-middleware.d.ts.map