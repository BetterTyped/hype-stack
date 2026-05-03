# File Upload Middleware for Hono

A Hono-compatible wrapper around [multer](https://www.npmjs.com/package/multer) that provides performant file upload
handling with both disk and memory storage options.

## Features

✅ **Performance-optimized**: Uses disk storage by default (like multer) to avoid memory issues  
✅ **Memory storage option**: Can switch to memory storage for small files  
✅ **Full multer API support**: `single()`, `array()`, `fields()`, `any()`, `none()`  
✅ **Type-safe**: Full TypeScript support with proper types  
✅ **File filtering**: Accept/reject files based on custom logic  
✅ **Size limits**: Configure maximum file sizes, field sizes, etc.  
✅ **Battle-tested**: Built on top of multer's proven implementation

## Installation

```bash
npm install multer @types/multer
```

## Usage

### Basic Example (Disk Storage - Default)

By default, files are saved to disk temporarily, which is memory-efficient:

```typescript
import { Hono } from "hono";
import { fileUpload, diskStorage } from "@backend/middleware/file";

const app = new Hono();

// Single file upload with disk storage (default)
app.post(
  "/upload",
  fileUpload({
    storage: diskStorage({
      destination: "./uploads",
      filename: (file) => {
        return `${Date.now()}-${file.originalname}`;
      },
    }),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB max file size
    },
  }).single("file"),
  async (c) => {
    const file = c.get("file");
    const body = c.get("body");

    return c.json({
      message: "File uploaded successfully",
      file: {
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
      },
      body,
    });
  },
);
```

### Memory Storage (for small files)

For small files or when you need the file buffer in memory:

```typescript
import { fileUpload, memoryStorage } from "@backend/middleware/file";

app.post(
  "/upload-memory",
  fileUpload({
    storage: memoryStorage(),
    limits: {
      fileSize: 1 * 1024 * 1024, // 1MB max
    },
  }).single("avatar"),
  async (c) => {
    const file = c.get("file");

    // File is in memory as a buffer
    console.log(file.buffer); // Buffer
    console.log(file.size); // File size in bytes

    return c.json({ message: "File uploaded to memory", size: file.size });
  },
);
```

### Multiple Files

#### Array (Multiple files, same field name)

```typescript
app.post(
  "/upload-multiple",
  fileUpload({
    storage: diskStorage({ destination: "./uploads" }),
    limits: {
      files: 5, // Max 5 files
      fileSize: 10 * 1024 * 1024, // 10MB per file
    },
  }).array("photos", 5),
  async (c) => {
    const files = c.get("files"); // Array of files

    return c.json({
      message: `${files.length} files uploaded`,
      files: files.map((f) => ({
        filename: f.filename,
        size: f.size,
        path: f.path,
      })),
    });
  },
);
```

#### Fields (Multiple files, different field names)

```typescript
app.post(
  "/upload-profile",
  fileUpload({
    storage: diskStorage({ destination: "./uploads" }),
  }).fields([
    { name: "avatar", maxCount: 1 },
    { name: "gallery", maxCount: 8 },
  ]),
  async (c) => {
    const files = c.get("files"); // { avatar: [File], gallery: [File, File, ...] }

    return c.json({
      avatar: files.avatar?.[0]?.filename,
      gallery: files.gallery?.map((f) => f.filename),
    });
  },
);
```

### File Filtering

Accept or reject files based on custom logic:

```typescript
app.post(
  "/upload-image",
  fileUpload({
    storage: diskStorage({ destination: "./uploads" }),
    fileFilter: (req, file, cb) => {
      // Only accept images
      if (file.mimetype.startsWith("image/")) {
        cb(null, true);
      } else {
        cb(new Error("Only images are allowed!"));
      }
    },
  }).single("image"),
  async (c) => {
    const file = c.get("file");
    return c.json({ message: "Image uploaded", file });
  },
);
```

### Configuration Options

All multer options are supported:

```typescript
fileUpload({
  storage: diskStorage({
    destination: "./uploads", // Where to save files
    filename: (file) => `${Date.now()}-${file.originalname}`, // Custom filename
  }),

  limits: {
    fieldNameSize: 100, // Max field name size (bytes)
    fieldSize: 1024 * 1024, // Max field value size (1MB)
    fields: Infinity, // Max number of non-file fields
    fileSize: 10 * 1024 * 1024, // Max file size (10MB)
    files: 10, // Max number of files
    parts: Infinity, // Max number of parts (fields + files)
    headerPairs: 2000, // Max number of header key-value pairs
  },

  fileFilter: (req, file, cb) => {
    // Custom file validation
    if (file.mimetype.startsWith("image/")) {
      cb(null, true); // Accept file
    } else {
      cb(new Error("Invalid file type"), false); // Reject file
    }
  },

  preservePath: false, // Keep full file path instead of just basename
});
```

## API Methods

### `.single(fieldName)`

Accept a single file with the specified field name.

```typescript
fileUpload().single("avatar");
// Context: c.get("file") -> UploadedFile
```

### `.array(fieldName, maxCount?)`

Accept an array of files, all with the same field name.

```typescript
fileUpload().array("photos", 5);
// Context: c.get("files") -> UploadedFile[]
```

### `.fields(fields)`

Accept multiple files with different field names.

```typescript
fileUpload().fields([
  { name: "avatar", maxCount: 1 },
  { name: "gallery", maxCount: 8 },
]);
// Context: c.get("files") -> { [fieldname: string]: UploadedFile[] }
```

### `.any()`

Accept any files (no field name restrictions).

```typescript
fileUpload().any();
// Context: c.get("files") -> UploadedFile[]
```

### `.none()`

Accept only text fields (no files).

```typescript
fileUpload().none();
// Context: c.get("body") -> Record<string, unknown>
```

## File Object Structure

### Disk Storage

```typescript
{
  fieldname: string; // Field name specified in the form
  originalname: string; // Name of the file on the user's computer
  encoding: string; // Encoding type of the file
  mimetype: string; // Mime type of the file
  destination: string; // The folder to which the file has been saved
  filename: string; // The name of the file within the destination
  path: string; // The full path to the uploaded file
  size: number; // Size of the file in bytes
}
```

### Memory Storage

```typescript
{
  fieldname: string; // Field name specified in the form
  originalname: string; // Name of the file on the user's computer
  encoding: string; // Encoding type of the file
  mimetype: string; // Mime type of the file
  buffer: Buffer; // A Buffer containing the entire file
  size: number; // Size of the file in bytes
}
```

## Performance Considerations

### Use Disk Storage (Default)

- ✅ Memory efficient
- ✅ Handles large files well
- ✅ Suitable for production
- ⚠️ Requires disk space
- ⚠️ Slower than memory for small files

### Use Memory Storage

- ✅ Fast for small files
- ✅ No disk I/O
- ⚠️ Can cause memory issues with large files
- ⚠️ Not suitable for production with large/many files

**Recommendation**: Use disk storage by default, only switch to memory storage for small files (< 1MB) or when you
specifically need the buffer in memory.

## Error Handling

Multer errors are automatically converted to Hono's `HTTPException`:

```typescript
app.post(
  "/upload",
  fileUpload({
    limits: { fileSize: 1024 * 1024 }, // 1MB
  }).single("file"),
  async (c) => {
    const file = c.get("file");
    return c.json({ file });
  },
);

// If file is too large, automatically returns:
// HTTP 400: { message: "File too large" }
```

## Integration with MinIO/S3

After receiving the file with disk storage, you can upload it to MinIO/S3:

```typescript
import { fileUpload, diskStorage } from "@backend/middleware/file";
import { createReadStream } from "fs";
import { unlink } from "fs/promises";

app.post(
  "/upload",
  fileUpload({
    storage: diskStorage({ destination: "./temp" }),
  }).single("file"),
  async (c) => {
    const file = c.get("file");
    const minio = c.var.minio;

    try {
      // Upload to MinIO
      await minio.putObject("my-bucket", file.originalname, createReadStream(file.path), file.size);

      // Clean up temporary file
      await unlink(file.path);

      return c.json({ message: "File uploaded to MinIO" });
    } catch (err) {
      // Clean up on error
      await unlink(file.path);
      throw err;
    }
  },
);
```

## Why Multer?

- ✅ **Battle-tested**: Used by millions of projects
- ✅ **Performance**: Highly optimized with busboy under the hood
- ✅ **Features**: Complete feature set for file uploads
- ✅ **Maintenance**: Actively maintained
- ✅ **Documentation**: Extensive documentation and examples

This middleware provides a thin wrapper to make multer work seamlessly with Hono while preserving all its functionality
and performance characteristics.
