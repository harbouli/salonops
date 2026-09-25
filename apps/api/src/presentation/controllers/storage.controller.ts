import { Request, Response, NextFunction } from 'express';
import { IGenerateUploadUrlUseCase } from '../../application/ports/storage.port';
import { generatePresignedUrlSchema } from '../validation/schemas';

export class StorageController {
  constructor(private readonly generateUploadUrlUseCase: IGenerateUploadUrlUseCase) {}

  public getPresignedUrl = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validated = generatePresignedUrlSchema.parse(req.body);
      const result = await this.generateUploadUrlUseCase.execute(validated);
      res.status(201).json(result);
    } catch (err) {
      next(err);
    }
  };
}
