import { chunkText } from '@/lib/chunking/textChunker';
import { type IEmbeddingService, embeddingService } from '@/services/embeddingService';
import {
  type IDocumentRepository,
  documentRepository,
} from '@/repositories/DocumentRepository';
import {
  type IChunksRepository,
  type InsertChunkInput,
  chunksRepository,
} from '@/repositories/ChunksRepository';

export interface IDocumentProcessor {
  process(documentId: string, text: string): Promise<void>;
}

export class DocumentProcessorService implements IDocumentProcessor {
  constructor(
    private readonly documents: IDocumentRepository,
    private readonly chunks: IChunksRepository,
    private readonly embeddings: IEmbeddingService,
  ) {}

  async process(documentId: string, text: string): Promise<void> {
    try {
      const textChunks = chunkText(text);
      console.log(
        `[DocumentProcessor] document=${documentId} chunks=${textChunks.length}`,
      );

      const chunksToInsert: InsertChunkInput[] = [];

      for (let i = 0; i < textChunks.length; i++) {
        const chunk = textChunks[i];
        console.log(
          `[DocumentProcessor] embedding ${i + 1}/${textChunks.length} (~${chunk.estimatedTokens} tokens)`,
        );
        const embedding = await this.embeddings.generateEmbedding(chunk.content);
        chunksToInsert.push({
          document_id: documentId,
          chunk_index: i,
          content: chunk.content,
          embedding,
          metadata: { estimated_tokens: chunk.estimatedTokens },
        });
      }

      await this.chunks.insertMany(chunksToInsert);
      await this.documents.updateStatus(documentId, 'processed');

      console.log(`[DocumentProcessor] document=${documentId} status=processed`);
    } catch (err) {
      console.error(
        `[DocumentProcessor] document=${documentId} failed:`,
        err instanceof Error ? err.message : err,
      );
      // Best-effort status update — don't let a secondary failure mask the root cause
      await this.documents.updateStatus(documentId, 'failed').catch((updateErr) => {
        console.error(
          `[DocumentProcessor] document=${documentId} also failed to set status=failed:`,
          updateErr instanceof Error ? updateErr.message : updateErr,
        );
      });
      throw err;
    }
  }
}

export const documentProcessorService = new DocumentProcessorService(
  documentRepository,
  chunksRepository,
  embeddingService,
);
