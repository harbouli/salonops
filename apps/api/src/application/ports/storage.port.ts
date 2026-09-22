import { GenerateUploadUrlDTO, GenerateUploadUrlResponseDTO } from '../dtos';

export interface IGenerateUploadUrlUseCase {
  /**
   * Generates a 15-minute presigned PUT URL for client transformation photos
   * or receipts, strictly validating file extensions, MIME types, and file sizes.
   */
  execute(dto: GenerateUploadUrlDTO): Promise<GenerateUploadUrlResponseDTO>;
}
