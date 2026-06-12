export class AppError extends Error {
  readonly statusCode: 400 | 422 | 500;

  constructor(message: string, statusCode: 400 | 422 | 500 = 500) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
  }
}
