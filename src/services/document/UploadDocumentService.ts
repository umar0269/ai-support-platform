import { extractPdfText } from '@/lib/pdf/extractor';
import {
  type IStorageRepository,
  storageRepository,
} from '@/repositories/StorageRepository';
import {
  type IDocumentRepository,
  type CreateDocumentInput,
  documentRepository,
} from '@/repositories/DocumentRepository';
import {
  type IDocumentProcessor,
  documentProcessorService,
} from '@/services/documentProcessor';

export interface UploadDocumentInput {
  filename: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
}

export interface UploadDocumentResult {
  documentId: string;
  title: string;
  extractedTextLength: number;
}

export class UploadDocumentService {
  constructor(
    private readonly storage: IStorageRepository,
    private readonly documents: IDocumentRepository,
    private readonly processor: IDocumentProcessor,
  ) {}

  async execute(input: UploadDocumentInput): Promise<UploadDocumentResult> {
    // 1. Extract text first — cheapest validation gate before any writes
    const { text, pageCount } = await extractPdfText(input.buffer);

    // 2. Persist the file to object storage
    const storagePath = this.buildStoragePath(input.filename);
    await this.storage.uploadFile(input.buffer, storagePath, input.mimeType);

    // 3. Create the document record (status starts as 'processing')
    const documentInput: CreateDocumentInput = {
      title: this.deriveTitle(input.filename),
      source: 'pdf',
      file_path: storagePath,
      status: 'processing',
      metadata: {
        file_size: input.sizeBytes,
        page_count: pageCount,
        mime_type: input.mimeType,
        original_filename: input.filename,
      },
    };
    const document = await this.documents.create(documentInput);

    // 4. Run the processing pipeline synchronously.
    //    The processor is responsible for updating status to 'processed' or 'failed'.
    //    NOTE: for very large documents this will be slow. In production, replace
    //    with a background job queue (e.g. BullMQ, Inngest).
    await this.processor.process(document.id, text);

    return {
      documentId: document.id,
      title: document.title,
      extractedTextLength: text.length,
    };
  }

  private buildStoragePath(filename: string): string {
    const safeFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `uploads/${Date.now()}_${safeFilename}`;
  }

  private deriveTitle(filename: string): string {
    return filename.replace(/\.pdf$/i, '').replace(/[_-]/g, ' ').trim() || 'Untitled Document';
  }
}

export const uploadDocumentService = new UploadDocumentService(
  storageRepository,
  documentRepository,
  documentProcessorService,
);
