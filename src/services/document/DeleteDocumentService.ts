import { AppError } from '@/lib/errors/AppError';
import {
  documentRepository,
  type IDocumentRepository,
} from '@/repositories/DocumentRepository';
import {
  storageRepository,
  type IStorageRepository,
} from '@/repositories/StorageRepository';

export class DeleteDocumentService {
  constructor(
    private readonly documents: IDocumentRepository,
    private readonly storage: IStorageRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const document = await this.documents.findById(id);
    if (!document) {
      throw new AppError('Document not found.', 400);
    }

    if (document.file_path) {
      await this.storage.deleteFile(document.file_path).catch((err) => {
        // Log but continue — the DB record is authoritative
        console.warn(
          `[DeleteDocument] Storage cleanup failed for ${document.file_path}: ${err instanceof Error ? err.message : err}`,
        );
      });
    }

    await this.documents.deleteById(id);
  }
}

export const deleteDocumentService = new DeleteDocumentService(
  documentRepository,
  storageRepository,
);
