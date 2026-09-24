import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { MemoryStorageAdapter } from '../../src/infrastructure/storage/minio-storage.adapter';

describe('MinIO & Storage Infrastructure Adapters', () => {
  it('MemoryStorageAdapter should generate valid presigned upload and public URLs', async () => {
    const adapter = new MemoryStorageAdapter('http://localhost:9000');

    const uploadUrl = await adapter.getPresignedUploadUrl({
      bucket: 'salonops-hair-photos',
      objectKey: 'hair-formulas/2026-09-22/photo-123.jpg',
      contentType: 'image/jpeg',
      expirySeconds: 900,
    });

    assert.ok(uploadUrl.startsWith('http://localhost:9000/salonops-hair-photos/hair-formulas/2026-09-22/photo-123.jpg'));
    assert.ok(uploadUrl.includes('uploadToken='));
    assert.ok(uploadUrl.includes('expiresIn=900'));

    const publicUrl = adapter.getPublicUrl('salonops-hair-photos', 'hair-formulas/2026-09-22/photo-123.jpg');
    assert.equal(publicUrl, 'http://localhost:9000/salonops-hair-photos/hair-formulas/2026-09-22/photo-123.jpg');
  });

  it('Acceptance Criterion: Domain layer has 0 MinIO/AWS SDK imports', () => {
    const portFilePath = resolve(__dirname, '../../src/domain/ports/object-storage.port.ts');
    const portContent = readFileSync(portFilePath, 'utf-8');

    assert.ok(!portContent.includes('minio'), 'Domain port must not import minio');
    assert.ok(!portContent.includes('@aws-sdk'), 'Domain port must not import @aws-sdk');
    assert.ok(!portContent.includes('aws-sdk'), 'Domain port must not import aws-sdk');
  });
});
