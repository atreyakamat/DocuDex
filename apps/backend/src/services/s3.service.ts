import { S3Client, DeleteObjectCommand, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const s3Config: any = {
  region: config.aws.region,
};

// Use credentials only if explicitly provided in env (e.g., local dev with minio or specific IAM user)
// In production on AWS, it will automatically use IAM roles
if (config.aws.accessKeyId && config.aws.secretAccessKey) {
  s3Config.credentials = {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  };
}

if (config.aws.endpoint) {
  s3Config.endpoint = config.aws.endpoint;
  s3Config.forcePathStyle = true; // Required for minio/localstack
}

export const s3Client = new S3Client(s3Config);

/**
 * Uploads a buffer to S3
 */
export async function uploadS3Object(key: string, body: Buffer, mimeType: string): Promise<void> {
  if (!config.aws.s3Bucket) {
    throw new Error('AWS_S3_BUCKET is not configured.');
  }

  try {
    const command = new PutObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
      Body: body,
      ContentType: mimeType,
    });
    await s3Client.send(command);
  } catch (error) {
    logger.error(`Error uploading ${key} to S3:`, error);
    throw error;
  }
}

/**
 * Deletes an object from S3
 */
export async function deleteS3Object(key: string): Promise<void> {
  if (!config.aws.s3Bucket) {
    logger.warn('AWS_S3_BUCKET is not configured. Skipping S3 deletion.');
    return;
  }
  
  try {
    const command = new DeleteObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
    });
    await s3Client.send(command);
    logger.info(`Successfully deleted ${key} from S3.`);
  } catch (error) {
    logger.error(`Error deleting ${key} from S3:`, error);
    throw error;
  }
}

/**
 * Generates a presigned URL to securely download/view a document
 */
export async function getPresignedUrl(key: string, expiresIn: number = 3600): Promise<string> {
  if (!config.aws.s3Bucket) {
    throw new Error('AWS_S3_BUCKET is not configured.');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: config.aws.s3Bucket,
      Key: key,
    });
    const url = await getSignedUrl(s3Client, command, { expiresIn });
    return url;
  } catch (error) {
    logger.error(`Error generating presigned URL for ${key}:`, error);
    throw error;
  }
}
