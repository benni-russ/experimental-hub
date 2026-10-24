/** Erwarteter Fehler mit HTTP-Status; der Fehlerhandler macht daraus { error: { code, message } }. */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
  }
}

export const notFound = (message: string): ApiError => new ApiError(404, 'NOT_FOUND', message);
