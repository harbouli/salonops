import * as Minio from 'minio';
import {
  IObjectStoragePort,
  PresignedUploadOptions,
} from '../../domain/ports/object-storage.port';

export interface MinioStorageConfig {
  endPoint?: string;
  port?: number;
  useSSL?: boolean;
  accessKey?: string;
  secretKey?: string;
  publicUrl?: string;
}

export class MinioStorageAdapter implements IObjectStoragePort {
  private readonly client: Minio.Client;
  private readonly publicBaseUrl: string;

  constructor(config?: MinioStorageConfig) {
    const endPoint = config?.endPoint || process.env.MINIO_ENDPOINT || 'localhost';
    const port = config?.port || (process.env.MINIO_PORT ? parseInt(process.env.MINIO_PORT, 10) : 9000);
    const useSSL = config?.useSSL ?? (process.env.MINIO_USE_SSL === 'true');
    const accessKey = config?.accessKey || process.env.MINIO_ACCESS_KEY || process.env.MINIO_ROOT_USER || 'minioadmin';
    const secretKey = config?.secretKey || process.env.MINIO_SECRET_KEY || process.env.MINIO_ROOT_PASSWORD || 'minioadmin';

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });

    const protocol = useSSL ? 'https' : 'http';
    this.publicBaseUrl = config?.publicUrl || process.env.MINIO_PUBLIC_URL || `${protocol}://${endPoint}:${port}`;

    // Auto-provision standard Moroccan salon buckets asynchronously
    this.autoProvisionStandardBuckets().catch((err) => {
      console.warn('[MinioStorageAdapter] Bucket auto-provisioning deferred (MinIO might be booting or offline):', err.message);
    });
  }

  public async getPresignedUploadUrl(options: PresignedUploadOptions): Promise<string> {
    const expiry = options.expirySeconds ?? 900; // 15 minutes default
    await this.ensureBucketExists(options.bucket);
    return this.client.presignedPutObject(options.bucket, options.objectKey, expiry);
  }

  public getPublicUrl(bucket: string, objectKey: string): string {
    return `${this.publicBaseUrl}/${bucket}/${objectKey}`;
  }

  public async ensureBucketExists(bucket: string, isPublic: boolean = false): Promise<void> {
    try {
      const exists = await this.client.bucketExists(bucket);
      if (!exists) {
        await this.client.makeBucket(bucket);
        console.log(`[MinioStorageAdapter] Created bucket: ${bucket}`);

        if (isPublic) {
          const publicReadPolicy = {
            Version: '2012-10-17',
            Statement: [
              {
                Effect: 'Allow',
                Principal: '*',
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucket}/*`],
              },
            ],
          };
          await this.client.setBucketPolicy(bucket, JSON.stringify(publicReadPolicy));
          console.log(`[MinioStorageAdapter] Configured public read policy for bucket: ${bucket}`);
        }
      }
    } catch (err: any) {
      // If bucket already exists or ownership belongs to us, continue smoothly
      if (err?.code !== 'BucketAlreadyOwnedByYou' && err?.code !== 'BucketAlreadyExists') {
        throw err;
      }
    }
  }

  private async autoProvisionStandardBuckets(): Promise<void> {
    // 1. Hair transformation photos bucket (public read for before/after photos)
    await this.ensureBucketExists('salonops-hair-photos', true);
    // 2. Salon receipts bucket (private storage)
    await this.ensureBucketExists('salonops-receipts', false);
  }
}

/**
 * In-Memory Fallback Adapter for local testing and offline execution without MinIO Docker.
 */
export class MemoryStorageAdapter implements IObjectStoragePort {
  private readonly buckets: Set<string> = new Set(['salonops-hair-photos', 'salonops-receipts']);
  private readonly baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:9000') {
    this.baseUrl = baseUrl;
  }

  public async getPresignedUploadUrl(options: PresignedUploadOptions): Promise<string> {
    this.buckets.add(options.bucket);
    const expiry = options.expirySeconds ?? 900;
    const token = Buffer.from(`${options.bucket}:${options.objectKey}:${Date.now() + expiry * 1000}`).toString('base64url');
    return `${this.baseUrl}/${options.bucket}/${options.objectKey}?uploadToken=${token}&expiresIn=${expiry}`;
  }

  public getPublicUrl(bucket: string, objectKey: string): string {
    return `${this.baseUrl}/${bucket}/${objectKey}`;
  }

  public async ensureBucketExists(bucket: string, _isPublic?: boolean): Promise<void> {
    this.buckets.add(bucket);
  }
}
