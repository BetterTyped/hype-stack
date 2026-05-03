import { S3Client } from "@aws-sdk/client-s3";
export declare const initializeStorage: () => S3Client;
export declare const getStorageClient: () => S3Client;
export declare const uploadFile: ({ bucket, key, body, contentType, }: {
    bucket: string;
    key: string;
    body: Buffer | Uint8Array;
    contentType: string;
}) => Promise<{
    bucket: string;
    key: string;
}>;
export declare const getFileUrl: ({ bucket, key, expiresIn, }: {
    bucket: string;
    key: string;
    expiresIn?: number;
}) => Promise<string>;
export declare const deleteFile: ({ bucket, key }: {
    bucket: string;
    key: string;
}) => Promise<void>;
//# sourceMappingURL=storage.d.ts.map