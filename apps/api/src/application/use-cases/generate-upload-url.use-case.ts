import { randomUUID } from 'node:crypto';
import { IObjectStoragePort } from '../../domain/ports/object-storage.port';
import {
  InvalidStorageBucketException,
  UnsupportedFileTypeException,
  FileTooLargeException,
} from '../../domain/exceptions/domain.exception';
import { IGenerateUploadUrlUseCase } from '../ports/storage.port';
import {
  GenerateUploadUrlDTO,
  GenerateUploadUrlResponseDTO,
  StorageBucket,
} from '../dtos';

const VALID_BUCKETS: StorageBucket[] = [
  'salonops-hair-photos',
  'salonops-receipts',
];

const ALLOWED_PHOTO_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]);

const ALLOWED_RECEIPT_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
]);

const ALLOWED_PHOTO_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic']);
const ALLOWED_RECEIPT_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);

const MAX_PHOTO_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
const MAX_RECEIPT_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const PRESIGNED_URL_EXPIRY_SECONDS = 15 * 60; // 15 minutes (900 seconds)

export class GenerateUploadUrlUseCase implements IGenerateUploadUrlUseCase {
  constructor(private readonly storagePort: IObjectStoragePort) {}

  public async execute(dto: GenerateUploadUrlDTO): Promise<GenerateUploadUrlResponseDTO> {
    const bucket: StorageBucket = dto.bucket ?? 'salonops-hair-photos';

    // 1. Validate bucket
    if (!VALID_BUCKETS.includes(bucket)) {
      throw new InvalidStorageBucketException(bucket);
    }

    // 2. Extract and validate file extension
    const extension = this.extractFileExtension(dto.fileName).toLowerCase();
    const normalizedMime = dto.mimeType.toLowerCase();

    if (bucket === 'salonops-hair-photos') {
      if (!ALLOWED_PHOTO_MIME_TYPES.has(normalizedMime) || !ALLOWED_PHOTO_EXTENSIONS.has(extension)) {
        throw new UnsupportedFileTypeException(
          `Format non supporté pour les photos de transformation: ${dto.mimeType} (${extension}). Seuls JPEG, PNG, WebP et HEIC sont acceptés.`
        );
      }

      if (dto.fileSize !== undefined && dto.fileSize > MAX_PHOTO_SIZE_BYTES) {
        throw new FileTooLargeException(15);
      }
    } else if (bucket === 'salonops-receipts') {
      if (!ALLOWED_RECEIPT_MIME_TYPES.has(normalizedMime) || !ALLOWED_RECEIPT_EXTENSIONS.has(extension)) {
        throw new UnsupportedFileTypeException(
          `Format non supporté pour les reçus: ${dto.mimeType} (${extension}). Seuls JPEG, PNG, WebP et PDF sont acceptés.`
        );
      }

      if (dto.fileSize !== undefined && dto.fileSize > MAX_RECEIPT_SIZE_BYTES) {
        throw new FileTooLargeException(10);
      }
    }

    // 3. Generate collision-safe and sanitized object key
    const sanitizedFileName = this.sanitizeFileName(dto.fileName);
    const datePartition = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const folder = dto.folder ? this.sanitizeFolder(dto.folder) : (bucket === 'salonops-hair-photos' ? 'hair-formulas' : 'receipts');
    const objectKey = `${folder}/${datePartition}/${randomUUID()}-${sanitizedFileName}`;

    // 4. Request presigned upload URL from object storage port (15-minute validity)
    const uploadUrl = await this.storagePort.getPresignedUploadUrl({
      bucket,
      objectKey,
      contentType: normalizedMime,
      expirySeconds: PRESIGNED_URL_EXPIRY_SECONDS,
    });

    // 5. Build permanent public asset URL
    const publicUrl = this.storagePort.getPublicUrl(bucket, objectKey);

    return {
      uploadUrl,
      publicUrl,
      bucket,
      objectKey,
      expiresInSeconds: PRESIGNED_URL_EXPIRY_SECONDS,
    };
  }

  private extractFileExtension(fileName: string): string {
    const dotIndex = fileName.lastIndexOf('.');
    if (dotIndex === -1 || dotIndex === fileName.length - 1) {
      return '';
    }
    return fileName.slice(dotIndex);
  }

  private sanitizeFileName(fileName: string): string {
    // Strip directories and disallowed characters
    const baseName = fileName.replace(/^.*[\\/]/, '');
    return baseName.replace(/[^a-zA-Z0-9._-]/g, '_');
  }

  private sanitizeFolder(folder: string): string {
    // Prevent path traversal
    return folder
      .replace(/\.\./g, '')
      .replace(/[^a-zA-Z0-9/_-]/g, '')
      .replace(/^\/+|\/+$/g, '');
  }
}
