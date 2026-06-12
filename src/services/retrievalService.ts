import { embeddingService, type IEmbeddingService } from '@/services/embeddingService';
import {
  vectorSearchRepository,
  type IVectorSearchRepository,
} from '@/repositories/VectorSearchRepository';
import type { RetrievedChunk } from '@/types';

const DEFAULT_LIMIT = 5;

export interface IRetrievalService {
  retrieveRelevantChunks(query: string, limit?: number): Promise<RetrievedChunk[]>;
}

export class RetrievalService implements IRetrievalService {
  constructor(
    private readonly embeddings: IEmbeddingService,
    private readonly vectorSearch: IVectorSearchRepository,
  ) {}

  async retrieveRelevantChunks(query: string, limit = DEFAULT_LIMIT): Promise<RetrievedChunk[]> {
    const queryEmbedding = await this.embeddings.generateEmbedding(query);
    return this.vectorSearch.similaritySearch(queryEmbedding, limit);
  }
}

export const retrievalService = new RetrievalService(
  embeddingService,
  vectorSearchRepository,
);
