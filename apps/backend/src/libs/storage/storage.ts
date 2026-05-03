import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  CreateBucketCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { logger } from "@backend/libs/logger/logger";

let s3: S3Client;
const knownBuckets = new Set<string>();

export const initializeStorage = () => {
  s3 = new S3Client({
    endpoint: process.env.RUSTFS_ENDPOINT,
    region: "us-east-1",
    credentials: {
      accessKeyId: process.env.RUSTFS_ACCESS_KEY,
      secretAccessKey: process.env.RUSTFS_SECRET_KEY,
    },
    forcePathStyle: true,
  });

  logger.info(`Storage client initialized (endpoint: ${process.env.RUSTFS_ENDPOINT})`);
  return s3;
};

export const getStorageClient = () => {
  if (!s3) throw new Error("Storage client not initialized. Call initializeStorage() first.");
  return s3;
};

const autoCreateBucket = async (bucket: string) => {
  if (knownBuckets.has(bucket)) return;
  try {
    await s3.send(new CreateBucketCommand({ Bucket: bucket }));
    logger.info(`Created storage bucket: ${bucket}`);
  } catch (err: unknown) {
    const code = (err as { name?: string }).name;
    if (code !== "BucketAlreadyOwnedByYou" && code !== "BucketAlreadyExists") throw err;
  }
  knownBuckets.add(bucket);
};

export const uploadFile = async ({
  bucket,
  key,
  body,
  contentType,
}: {
  bucket: string;
  key: string;
  body: Buffer | Uint8Array;
  contentType: string;
}) => {
  await autoCreateBucket(bucket);
  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
    }),
  );

  return { bucket, key };
};

export const getFileUrl = async ({
  bucket,
  key,
  expiresIn = 3600,
}: {
  bucket: string;
  key: string;
  expiresIn?: number;
}) => {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn });
};

export const deleteFile = async ({ bucket, key }: { bucket: string; key: string }) => {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
};
