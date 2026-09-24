export interface PresignedUploadOptions {
  bucket: string;
  objectKey: string;
  contentType?: string;
  expirySeconds?: number;
}

export interface IObjectStoragePort {
  /**
   * Generates a presigned PUT URL allowing clients (mobile/web) to upload files
   * directly to object storage without buffering streams on the backend.
   */
  getPresignedUploadUrl(options: PresignedUploadOptions): Promise<string>;

  /**
   * Resolves the public CDN/MinIO URL to access and download the uploaded object.
   */
  getPublicUrl(bucket: string, objectKey: string): string;

  /**
   * Auto-provisions the given bucket if it does not already exist,
   * optionally configuring anonymous read access for public asset distribution.
   */
  ensureBucketExists(bucket: string, isPublic?: boolean): Promise<void>;
}
