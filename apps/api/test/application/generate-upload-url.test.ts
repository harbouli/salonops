import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { GenerateUploadUrlUseCase } from '../../src/application/use-cases/generate-upload-url.use-case';
import { IObjectStoragePort, PresignedUploadOptions } from '../../src/domain/ports/object-storage.port';
import {
  UnsupportedFileTypeException,
  FileTooLargeException,
  InvalidStorageBucketException,
} from '../../src/domain/exceptions/domain.exception';

describe('GenerateUploadUrlUseCase (Hexagonal Storage Orchestration)', () => {
  function createMockStoragePort(): {
    port: IObjectStoragePort;
    getLastOptions: () => PresignedUploadOptions | null;
  } {
    let lastOptions: PresignedUploadOptions | null = null;

    const port: IObjectStoragePort = {
      getPresignedUploadUrl: async (options: PresignedUploadOptions): Promise<string> => {
        lastOptions = options;
        return `https://s3.salonops.ma/${options.bucket}/${options.objectKey}?X-Amz-Signature=mock-token&X-Amz-Expires=${options.expirySeconds}`;
      },
      getPublicUrl: (bucket: string, objectKey: string): string => {
        return `https://cdn.salonops.ma/${bucket}/${objectKey}`;
      },
      ensureBucketExists: async (_bucket: string): Promise<void> => {},
    };

    return {
      port,
      getLastOptions: () => lastOptions,
    };
  }

  it('should successfully generate 15-minute presigned PUT URL for client hair transformation photos', async () => {
    const { port, getLastOptions } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    const result = await useCase.execute({
      fileName: 'balayage-before.jpg',
      mimeType: 'image/jpeg',
      fileSize: 4 * 1024 * 1024, // 4 MB
    });

    assert.equal(result.bucket, 'salonops-hair-photos');
    assert.equal(result.expiresInSeconds, 900); // 15 minutes
    assert.ok(result.uploadUrl.includes('X-Amz-Expires=900'));
    assert.ok(result.objectKey.startsWith('hair-formulas/'));
    assert.ok(result.objectKey.includes('balayage-before.jpg'));
    assert.equal(result.publicUrl, `https://cdn.salonops.ma/salonops-hair-photos/${result.objectKey}`);

    const options = getLastOptions();
    assert.ok(options);
    assert.equal(options.bucket, 'salonops-hair-photos');
    assert.equal(options.contentType, 'image/jpeg');
    assert.equal(options.expirySeconds, 900);
  });

  it('should route receipts to salonops-receipts bucket with 10MB limit and PDF support', async () => {
    const { port, getLastOptions } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    const result = await useCase.execute({
      bucket: 'salonops-receipts',
      fileName: 'facture-caisse-491.pdf',
      mimeType: 'application/pdf',
      fileSize: 2 * 1024 * 1024, // 2 MB
    });

    assert.equal(result.bucket, 'salonops-receipts');
    assert.equal(result.expiresInSeconds, 900);
    assert.ok(result.objectKey.startsWith('receipts/'));
    assert.ok(result.objectKey.includes('facture-caisse-491.pdf'));

    const options = getLastOptions();
    assert.ok(options);
    assert.equal(options.bucket, 'salonops-receipts');
    assert.equal(options.contentType, 'application/pdf');
  });

  it('should reject non-image file extensions for transformation photos', async () => {
    const { port } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    await assert.rejects(
      async () => {
        await useCase.execute({
          fileName: 'malicious-script.sh',
          mimeType: 'text/x-shellscript',
        });
      },
      UnsupportedFileTypeException
    );
  });

  it('should reject PDF uploads for hair transformation photos bucket', async () => {
    const { port } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    await assert.rejects(
      async () => {
        await useCase.execute({
          bucket: 'salonops-hair-photos',
          fileName: 'document.pdf',
          mimeType: 'application/pdf',
        });
      },
      UnsupportedFileTypeException
    );
  });

  it('should reject photo files exceeding 15MB limit', async () => {
    const { port } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    await assert.rejects(
      async () => {
        await useCase.execute({
          bucket: 'salonops-hair-photos',
          fileName: 'huge-raw-photo.png',
          mimeType: 'image/png',
          fileSize: 16 * 1024 * 1024, // 16 MB > 15 MB limit
        });
      },
      FileTooLargeException
    );
  });

  it('should reject receipt files exceeding 10MB limit', async () => {
    const { port } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    await assert.rejects(
      async () => {
        await useCase.execute({
          bucket: 'salonops-receipts',
          fileName: 'heavy-scan.pdf',
          mimeType: 'application/pdf',
          fileSize: 11 * 1024 * 1024, // 11 MB > 10 MB limit
        });
      },
      FileTooLargeException
    );
  });

  it('should reject unauthorized bucket targets', async () => {
    const { port } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    await assert.rejects(
      async () => {
        await useCase.execute({
          bucket: 'unauthorized-admin-backup' as any,
          fileName: 'photo.jpg',
          mimeType: 'image/jpeg',
        });
      },
      InvalidStorageBucketException
    );
  });

  it('should sanitize path traversal characters in folder and filename', async () => {
    const { port, getLastOptions } = createMockStoragePort();
    const useCase = new GenerateUploadUrlUseCase(port);

    const result = await useCase.execute({
      folder: '../../uploads/client-123',
      fileName: '../../../etc/passwd.jpg',
      mimeType: 'image/jpeg',
    });

    assert.ok(!result.objectKey.includes('..'));
    assert.ok(result.objectKey.startsWith('uploads/client-123/'));
    assert.ok(result.objectKey.endsWith('passwd.jpg'));

    const options = getLastOptions();
    assert.ok(options);
    assert.ok(!options.objectKey.includes('..'));
  });

});
