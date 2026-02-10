export type User = {
  id: string;
  email: string;
  name: string | null;
  emailVerified: boolean;
  premiumUnlocked: boolean;
};

export type Product = {
  id: string;
  sku: string;
  name: string;
  description: string;
  amountCents: number;
  currency: string;
  isActive: boolean;
};

export type Purchase = {
  id: string;
  status: string;
  amountCents: number;
  currency: string;
  platform: string;
  createdAt: string;
  product: Product;
};

type RequestOptions = {
  method?: "GET" | "POST";
  path: string;
  body?: unknown;
  accessToken?: string | null;
};

function normalizeApiBaseUrl(raw: string) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
}

const baseUrl = normalizeApiBaseUrl(
  import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? "http://localhost:4100"
);

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseJson(response: Response) {
  const text = await response.text();
  if (!text) {
    return {};
  }
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text };
  }
}

export async function apiRequest<T = Record<string, unknown>>(options: RequestOptions): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${options.path}`, {
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
      `Unable to reach API at ${baseUrl}. Start backend server and verify VITE_API_BASE_URL. (${message})`
    );
  }

  const data = await parseJson(response);

  if (!response.ok) {
    const message =
      (typeof data.error === "string" && data.error) ||
      (typeof data.message === "string" && data.message) ||
      `Request failed with ${response.status}`;
    throw new ApiError(response.status, message);
  }

  return data as T;
}

export function formatMoney(amountCents: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase()
  }).format(amountCents / 100);
}
