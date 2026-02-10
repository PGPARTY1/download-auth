import { config } from "./config";

export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

type RequestOptions = {
  method?: "GET" | "POST";
  path: string;
  body?: unknown;
  accessToken?: string | null;
};

async function parseResponse(response: Response) {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

export async function apiRequest<T>(options: RequestOptions): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${config.apiBaseUrl}${options.path}`, {
      method: options.method ?? "GET",
      headers: {
        "Content-Type": "application/json",
        ...(options.accessToken ? { Authorization: `Bearer ${options.accessToken}` } : {})
      },
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (error) {
    const message =
      error instanceof Error && error.message ? error.message : "Network request failed.";
    throw new ApiError(
      0,
      `Unable to reach API at ${config.apiBaseUrl}. Start backend server and verify API URL. (${message})`
    );
  }

  const data = await parseResponse(response);
  if (!response.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      "Request failed";
    throw new ApiError(response.status, message);
  }

  return data as T;
}
