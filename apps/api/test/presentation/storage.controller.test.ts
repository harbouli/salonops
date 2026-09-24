import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { StorageController } from '../../src/presentation/controllers/storage.controller';
import { IGenerateUploadUrlUseCase } from '../../src/application/ports/storage.port';
import { GenerateUploadUrlDTO, GenerateUploadUrlResponseDTO } from '../../src/application/dtos';

describe('StorageController (Driving Inbound Adapter)', () => {
  it('should successfully parse valid request body and return 201 with presigned URL payload', async () => {
    let executedDto: GenerateUploadUrlDTO | null = null;

    const mockUseCase: IGenerateUploadUrlUseCase = {
      execute: async (dto: GenerateUploadUrlDTO): Promise<GenerateUploadUrlResponseDTO> => {
        executedDto = dto;
        return {
          uploadUrl: 'http://localhost:9000/salonops-hair-photos/photos/test.jpg?token=abc',
          publicUrl: 'http://localhost:9000/salonops-hair-photos/photos/test.jpg',
          bucket: 'salonops-hair-photos',
          objectKey: 'photos/test.jpg',
          expiresInSeconds: 900,
        };
      },
    };

    const controller = new StorageController(mockUseCase);

    let statusCalledWith: number | null = null;
    let jsonCalledWith: any = null;

    const mockReq = {
      body: {
        fileName: 'balayage.webp',
        mimeType: 'image/webp',
        fileSize: 1024 * 500,
      },
    } as any;

    const mockRes = {
      status: (code: number) => {
        statusCalledWith = code;
        return mockRes;
      },
      json: (data: any) => {
        jsonCalledWith = data;
        return mockRes;
      },
    } as any;

    let nextError: any = null;
    const mockNext = (err?: any) => {
      nextError = err;
    };

    await controller.getPresignedUrl(mockReq, mockRes, mockNext);

    assert.equal(nextError, null);
    assert.equal(statusCalledWith, 201);
    assert.ok(jsonCalledWith);
    assert.equal(jsonCalledWith.bucket, 'salonops-hair-photos');
    assert.equal(jsonCalledWith.expiresInSeconds, 900);
    assert.ok(jsonCalledWith.uploadUrl);

    assert.ok(executedDto);
    assert.equal((executedDto as GenerateUploadUrlDTO).fileName, 'balayage.webp');
  });

  it('should forward Zod validation errors to next middleware when body is invalid', async () => {
    const mockUseCase: IGenerateUploadUrlUseCase = {
      execute: async () => {
        throw new Error('Should not be reached');
      },
    };

    const controller = new StorageController(mockUseCase);

    const mockReq = {
      body: {
        fileName: '', // Invalid empty filename
        mimeType: 'image/jpeg',
      },
    } as any;

    const mockRes = {} as any;
    let nextError: any = null;
    const mockNext = (err?: any) => {
      nextError = err;
    };

    await controller.getPresignedUrl(mockReq, mockRes, mockNext);

    assert.ok(nextError);
    assert.equal(nextError.name, 'ZodError');
  });
});
