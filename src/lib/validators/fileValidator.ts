import { AppError } from '@/lib/errors/AppError';

const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const ALLOWED_MIME_TYPE = 'application/pdf';

export function validateUploadFile(formData: FormData): File {
  const field = formData.get('file');

  if (!field || !(field instanceof File)) {
    throw new AppError('No file provided. Include a "file" field in the form data.', 400);
  }

  if (field.type !== ALLOWED_MIME_TYPE) {
    throw new AppError(
      `Invalid file type "${field.type}". Only PDF files are accepted.`,
      400,
    );
  }

  if (field.size > MAX_FILE_SIZE_BYTES) {
    throw new AppError(
      `File too large (${(field.size / 1024 / 1024).toFixed(1)} MB). Maximum allowed size is 20 MB.`,
      400,
    );
  }

  return field;
}
