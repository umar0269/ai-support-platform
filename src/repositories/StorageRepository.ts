import { getSupabaseAdmin } from '@/lib/supabase/server';
import { AppError } from '@/lib/errors/AppError';

const STORAGE_BUCKET = 'documents';

export interface IStorageRepository {
  uploadFile(buffer: Buffer, path: string, mimeType: string): Promise<string>;
}

export class StorageRepository implements IStorageRepository {
  async uploadFile(buffer: Buffer, path: string, mimeType: string): Promise<string> {
    const { error } = await getSupabaseAdmin()
      .storage
      .from(STORAGE_BUCKET)
      .upload(path, buffer, { contentType: mimeType, upsert: false });

    if (error) {
      throw new AppError(`Failed to store the file: ${error.message}`, 500);
    }

    return path;
  }
}

export const storageRepository = new StorageRepository();
