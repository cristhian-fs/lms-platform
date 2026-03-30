import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { env } from "@lms-platform/env/server";

const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

function getS3Client(): S3Client {
  if (!env.R2_ENDPOINT || !env.R2_ACCESS_KEY_ID || !env.R2_SECRET_ACCESS_KEY) {
    throw new Error("R2 credentials are not configured (R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
  }
  return new S3Client({
    region: "auto",
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
  });
}

export async function uploadFile(
  file: File,
  bucket: string,
  path: string,
): Promise<{ url: string }> {
  if (!env.R2_BUCKET_NAME || !env.R2_PUBLIC_URL) {
    throw new Error("R2 storage is not configured (R2_BUCKET_NAME, R2_PUBLIC_URL)");
  }
  if (file.size > MAX_SIZE_BYTES) {
    throw new Error("File too large. Maximum size is 8 MB.");
  }

  const s3 = getS3Client();
  const key = `${bucket}/${path}`;
  const body = Buffer.from(await file.arrayBuffer());

  await s3.send(
    new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      Body: body,
      ContentType: file.type || "application/octet-stream",
    }),
  );

  return { url: `${env.R2_PUBLIC_URL}/${key}` };
}
