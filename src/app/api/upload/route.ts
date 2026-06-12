import { NextRequest, NextResponse } from 'next/server';
import { AppError } from '@/lib/errors/AppError';
import { validateUploadFile } from '@/lib/validators/fileValidator';
import { uploadDocumentService } from '@/services/document/UploadDocumentService';
import type { UploadApiResponse, ApiErrorResponse } from '@/types';

export async function POST(
  req: NextRequest,
): Promise<NextResponse<UploadApiResponse | ApiErrorResponse>> {
  try {
    const formData = await req.formData().catch(() => {
      throw new AppError('Invalid form data. Expected multipart/form-data.', 400);
    });

    const file = validateUploadFile(formData);
    const buffer = Buffer.from(await file.arrayBuffer());

    const result = await uploadDocumentService.execute({
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      buffer,
    });

    return NextResponse.json({ success: true, ...result }, { status: 201 });
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { success: false, error: err.message },
        { status: err.statusCode },
      );
    }
    console.error('[POST /api/upload] Unexpected error:', err);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred. Please try again.' },
      { status: 500 },
    );
  }
}
