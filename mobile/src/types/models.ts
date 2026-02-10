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

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
