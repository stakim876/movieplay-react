import { ApiError, normalizeApiError } from "@/core/api/errors";

type RequestOptions = RequestInit & {
  retry?: number;
  retryDelayMs?: number;
};

const DEFAULT_RETRY = 1;
const DEFAULT_DELAY = 400;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function httpClient<T = unknown>(
  url: string,
  options: RequestOptions = {}
): Promise<T> {
  const { retry = DEFAULT_RETRY, retryDelayMs = DEFAULT_DELAY, ...init } = options;
  let lastError: unknown;

  for (let attempt = 0; attempt <= retry; attempt++) {
    try {
      const res = await fetch(url, init);

      if (!res.ok) {
        throw new ApiError(`API 요청 실패 (${res.status})`, res.status, "HTTP_ERROR");
      }

      return (await res.json()) as T;
    } catch (err) {
      lastError = err;
      if (attempt < retry) {
        await sleep(retryDelayMs * (attempt + 1));
      }
    }
  }

  throw normalizeApiError(lastError);
}
