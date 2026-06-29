export class ApiError extends Error {
  status: number;
  code: string;

  constructor(message: string, status = 0, code = "API_ERROR") {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export function normalizeApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (err instanceof Error) return new ApiError(err.message);
  return new ApiError("알 수 없는 오류가 발생했습니다.");
}
