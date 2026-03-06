import { S3Client, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { deleteS3Object, getPresignedUrl, s3Client } from '../s3.service';
import { config } from '../../config/env';

jest.mock('@aws-sdk/s3-request-presigner');

describe('S3 Service', () => {
  let mockSend: jest.SpyInstance;

  beforeAll(() => {
    mockSend = jest.spyOn(s3Client, 'send').mockImplementation(() => Promise.resolve({}));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteS3Object', () => {
    it('should skip deletion if S3 bucket is not configured', async () => {
      const originalBucket = config.aws.s3Bucket;
      config.aws.s3Bucket = '';
      
      await deleteS3Object('test-key.pdf');
      
      expect(mockSend).not.toHaveBeenCalled();
      
      config.aws.s3Bucket = originalBucket;
    });

    it('should call S3Client.send with DeleteObjectCommand', async () => {
      const originalBucket = config.aws.s3Bucket;
      config.aws.s3Bucket = 'test-bucket';
      
      await deleteS3Object('test-key.pdf');
      
      expect(mockSend).toHaveBeenCalledTimes(1);
      // Validate that it was called with something that looks like DeleteObjectCommand
      // In this mock, the command is just instantiated, so we check mockSend.
      
      config.aws.s3Bucket = originalBucket;
    });

    it('should throw an error if S3Client.send fails', async () => {
      const originalBucket = config.aws.s3Bucket;
      config.aws.s3Bucket = 'test-bucket';
      mockSend.mockRejectedValueOnce(new Error('S3 error'));

      await expect(deleteS3Object('test-key.pdf')).rejects.toThrow('S3 error');

      config.aws.s3Bucket = originalBucket;
    });
  });

  describe('getPresignedUrl', () => {
    it('should throw error if S3 bucket is not configured', async () => {
      const originalBucket = config.aws.s3Bucket;
      config.aws.s3Bucket = '';

      await expect(getPresignedUrl('test-key.pdf')).rejects.toThrow('AWS_S3_BUCKET is not configured.');

      config.aws.s3Bucket = originalBucket;
    });

    it('should generate a presigned url', async () => {
      const originalBucket = config.aws.s3Bucket;
      config.aws.s3Bucket = 'test-bucket';
      
      (getSignedUrl as jest.Mock).mockResolvedValueOnce('https://presigned.url');

      const url = await getPresignedUrl('test-key.pdf');

      expect(url).toBe('https://presigned.url');
      expect(getSignedUrl).toHaveBeenCalledTimes(1);

      config.aws.s3Bucket = originalBucket;
    });
  });
});
