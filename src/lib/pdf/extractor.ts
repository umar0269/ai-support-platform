import { PDFParse } from 'pdf-parse';
import { AppError } from '@/lib/errors/AppError';

export interface PdfExtractResult {
  text: string;
  pageCount: number;
}

/**
 * Extracts plain text and page count from a PDF buffer.
 *
 * NOTE: A single PDFParse instance transfers the buffer to the pdfjs worker
 * on the first method call, so getText() and getInfo() must NOT be called
 * concurrently (no Promise.all) on the same instance.
 */
export async function extractPdfText(buffer: Buffer): Promise<PdfExtractResult> {
  let parser: PDFParse | undefined;

  try {
    parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    return { text: result.text.trim(), pageCount: result.total };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError(
      'Failed to extract text from the PDF. The file may be corrupted or password-protected.',
      400,
    );
  } finally {
    await parser?.destroy();
  }
}
