import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { ApiError, Product, Purchase, User, apiRequest, formatMoney } from "./lib/api";

type Tokens = {
  accessToken: string;
  refreshToken: string;
};

type Route = "home" | "store" | "profile" | "settings" | "error";

const accessTokenKey = "pookie_desktop_access_token";
const refreshTokenKey = "pookie_desktop_refresh_token";

async function openExternalUrl(url: string) {
  try {
    const shell = await import("@tauri-apps/api/shell");
    await shell.open(url);
  } catch {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

function saveTokens(tokens: Tokens) {
  localStorage.setItem(accessTokenKey, tokens.accessToken);
  localStorage.setItem(refreshTokenKey, tokens.refreshToken);
}

function clearTokens() {
  localStorage.removeItem(accessTokenKey);
  localStorage.removeItem(refreshTokenKey);
}

function readTokens(): Tokens | null {
  const accessToken = localStorage.getItem(accessTokenKey);
  const refreshToken = localStorage.getItem(refreshTokenKey);
  if (!accessToken || !refreshToken) {
    return null;
  }
  return { accessToken, refreshToken };
}

export default function App() {
  const [booting, setBooting] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [route, setRoute] = useState<Route>("home");

  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState<string | null>(null);
  const [verifyToken, setVerifyToken] = useState("");

  const [products, setProducts] = useState<Product[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [storeBusyProductId, setStoreBusyProductId] = useState<string | null>(null);

  const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === "true";
  const successUrl = import.meta.env.VITE_CHECKOUT_SUCCESS_URL ?? "https://pookiestudios.in";
  const cancelUrl = import.meta.env.VITE_CHECKOUT_CANCEL_URL ?? "https://pookiestudios.in";

  const isAuthenticated = Boolean(tokens?.accessToken && user);

  const withAuth = useCallback(
    async <T,>(fn: (accessToken: string) => Promise<T>): Promise<T> => {
      if (!tokens?.accessToken) {
        throw new Error("Please log in.");
      }
      try {
        return await fn(tokens.accessToken);
      } catch (error) {
        if (!(error instanceof ApiError) || error.status !== 401 || !tokens.refreshToken) {
          throw error;
        }

        const refreshed = await apiRequest<Tokens>({
          method: "POST",
          path: "/auth/refresh",
          body: { refreshToken: tokens.refreshToken }
        });

        setTokens(refreshed);
        saveTokens(refreshed);

        return fn(refreshed.accessToken);
      }
    },
    [tokens]
  );

  const loadProfile = useCallback(async () => {
    const result = await withAuth((accessToken) =>
      apiRequest<{ user: User }>({
        path: "/auth/me",
        accessToken
      })
    );
    setUser(result.user);
  }, [withAuth]);

  const loadProducts = useCallback(async () => {
    const result = await apiRequest<{ products: Product[] }>({
      path: "/products"
    });
    setProducts(result.products);
  }, []);

  const loadHistory = useCallback(async () => {
    const result = await withAuth((accessToken) =>
      apiRequest<{ purchases: Purchase[] }>({
        path: "/payments/history",
        accessToken
      })
    );
    setPurchases(result.purchases);
  }, [withAuth]);

  const restorePurchases = useCallback(async () => {
    const result = await withAuth((accessToken) =>
      apiRequest<{ premiumUnlocked: boolean; purchases: Purchase[] }>({
        method: "POST",
        path: "/payments/restore",
        accessToken
      })
    );
    setPurchases(result.purchases);
    await loadProfile();
    setAuthMessage(result.premiumUnlocked ? "Premium restored." : "No completed purchases found.");
  }, [loadProfile, withAuth]);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const stored = readTokens();
        if (!stored) {
          return;
        }
        setTokens(stored);
        const me = await apiRequest<{ user: User }>({
          path: "/auth/me",
          accessToken: stored.accessToken
        });
        setUser(me.user);
      } catch {
        clearTokens();
        setTokens(null);
        setUser(null);
      } finally {
        setBooting(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }
    void loadProducts();
    void loadHistory();
  }, [isAuthenticated, loadHistory, loadProducts]);

  const onAuthSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage(null);

    try {
      if (authMode === "login") {
        const response = await apiRequest<{ user: User; accessToken: string; refreshToken: string }>({
          method: "POST",
          path: "/auth/login",
          body: { email, password }
        });
        const next = { accessToken: response.accessToken, refreshToken: response.refreshToken };
        setTokens(next);
        setUser(response.user);
        saveTokens(next);
      } else {
        const response = await apiRequest<{ message: string }>({
          method: "POST",
          path: "/auth/signup",
          body: { name, email, password }
        });
        setAuthMessage(response.message);
        setAuthMode("login");
      }
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setAuthBusy(false);
    }
  };

  const onVerifyEmail = async () => {
    if (!verifyToken) {
      setAuthMessage("Enter your verification token.");
      return;
    }
    setAuthBusy(true);
    setAuthMessage(null);
    try {
      const response = await apiRequest<{ user: User; accessToken: string; refreshToken: string; message: string }>({
        method: "POST",
        path: "/auth/verify-email",
        body: { token: verifyToken }
      });
      const next = { accessToken: response.accessToken, refreshToken: response.refreshToken };
      setTokens(next);
      setUser(response.user);
      saveTokens(next);
      setAuthMessage(response.message);
      setVerifyToken("");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Verification failed.");
    } finally {
      setAuthBusy(false);
    }
  };

  const onForgotPassword = async () => {
    if (!email) {
      setAuthMessage("Enter your email first.");
      return;
    }
    setAuthBusy(true);
    setAuthMessage(null);
    try {
      const response = await apiRequest<{ message: string }>({
        method: "POST",
        path: "/auth/forgot-password",
        body: { email }
      });
      setAuthMessage(response.message);
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Unable to send reset email.");
    } finally {
      setAuthBusy(false);
    }
  };

  const onLogout = async () => {
    try {
      if (tokens?.refreshToken) {
        await apiRequest({
          method: "POST",
          path: "/auth/logout",
          body: { refreshToken: tokens.refreshToken }
        });
      }
    } finally {
      clearTokens();
      setTokens(null);
      setUser(null);
      setRoute("home");
      setPurchases([]);
    }
  };

  const onBuyProduct = async (product: Product) => {
    setStoreBusyProductId(product.id);
    setAuthMessage(null);
    try {
      const session = await withAuth((accessToken) =>
        apiRequest<{ checkoutUrl: string | null }>({
          method: "POST",
          path: "/payments/checkout-session",
          accessToken,
          body: {
            productId: product.id,
            successUrl,
            cancelUrl
          }
        })
      );

      if (!session.checkoutUrl) {
        throw new Error("Stripe checkout URL was not returned.");
      }

      await openExternalUrl(session.checkoutUrl);
      setAuthMessage("Checkout opened in your browser. After payment, click Restore Purchases.");
    } catch (error) {
      setAuthMessage(error instanceof Error ? error.message : "Could not start checkout.");
    } finally {
      setStoreBusyProductId(null);
    }
  };

  const activeScreen = useMemo(() => {
    if (route === "error") {
      return (
        <div className="screen error-card">
          <h2>Something went wrong</h2>
          <p>{errorMessage ?? "Unexpected error state."}</p>
          <button className="btn primary" onClick={() => setRoute("home")}>
            Return Home
          </button>
        </div>
      );
    }

    if (route === "home") {
      return (
        <div className="screen">
          <h2>Home Dashboard</h2>
          <p className="muted">Studio news, premium updates, and your personal release queue.</p>
          <div className={`premium-card ${user?.premiumUnlocked ? "" : "locked"}`}>
            <div className="premium-content">
              <h3>Premium Lounge</h3>
              <p>Exclusive build drops, cozy wallpaper pack, soundtrack previews, and private changelog notes.</p>
            </div>
            {!user?.premiumUnlocked ? (
              <div className="premium-overlay">
                <p>Unlock premium to access this area.</p>
                <button className="btn primary" onClick={() => setRoute("store")}>
                  Unlock Premium
                </button>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (route === "store") {
      return (
        <div className="screen">
          <h2>Premium Store</h2>
          <p className="muted">Secure Stripe checkout for desktop via browser redirect.</p>
          <div className="product-grid">
            {products.map((product) => (
              <article key={product.id} className="product-card">
                <h3>{product.name}</h3>
                <p>{product.description}</p>
                <strong>{formatMoney(product.amountCents, product.currency)}</strong>
                <button className="btn primary" disabled={storeBusyProductId === product.id} onClick={() => void onBuyProduct(product)}>
                  {storeBusyProductId === product.id ? "Opening Checkout..." : "Buy Now"}
                </button>
              </article>
            ))}
          </div>
          <button className="btn secondary" onClick={() => void restorePurchases()}>
            Restore Purchases
          </button>
        </div>
      );
    }

    if (route === "profile") {
      return (
        <div className="screen">
          <h2>Profile</h2>
          <div className="profile-card">
            <p>
              <span>Email</span>
              {user?.email}
            </p>
            <p>
              <span>Email Status</span>
              {user?.emailVerified ? "Verified" : "Not verified"}
            </p>
            <p>
              <span>Premium</span>
              {user?.premiumUnlocked ? "Unlocked" : "Locked"}
            </p>
          </div>
          <h3>Purchase History</h3>
          <div className="history-list">
            {purchases.length === 0 ? <p className="muted">No purchases yet.</p> : null}
            {purchases.map((purchase) => (
              <article key={purchase.id} className="history-card">
                <strong>{purchase.product.name}</strong>
                <p>{new Date(purchase.createdAt).toLocaleString()}</p>
                <p>
                  {purchase.status.toUpperCase()} - {formatMoney(purchase.amountCents, purchase.currency)}
                </p>
              </article>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="screen">
        <h2>Settings</h2>
        <p className="muted">Desktop build information and support actions.</p>
        <div className="settings-card">
          <p>
            <span>App Version</span>1.0.0
          </p>
          <p>
            <span>Platform</span>Windows (Tauri)
          </p>
        </div>
        <div className="settings-actions">
          <button className="btn secondary" onClick={() => setRoute("error")}>
            Open Error Page
          </button>
          <button className="btn secondary" onClick={() => window.location.reload()}>
            Refresh App
          </button>
        </div>
      </div>
    );
  }, [errorMessage, onBuyProduct, products, purchases, restorePurchases, route, storeBusyProductId, user?.email, user?.emailVerified, user?.premiumUnlocked]);

  if (booting) {
    return (
      <main className="boot-screen">
        <h1>PookieStudios</h1>
        <p>Loading desktop studio...</p>
      </main>
    );
  }

  if (maintenanceMode) {
    return (
      <main className="boot-screen">
        <h1>Maintenance in progress</h1>
        <p>We are polishing a release. Please check back shortly.</p>
      </main>
    );
  }

  if (!isAuthenticated) {
    return (
      <main className="auth-screen">
        <section className="auth-card">
          <h1>PookieStudios</h1>
          <p>Sign in to access premium downloads and purchase history.</p>
          <form onSubmit={onAuthSubmit}>
            {authMode === "signup" ? (
              <label>
                Name
                <input value={name} onChange={(event) => setName(event.target.value)} />
              </label>
            ) : null}
            <label>
              Email
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
            </label>
            <button className="btn primary" type="submit" disabled={authBusy}>
              {authBusy ? "Please wait..." : authMode === "login" ? "Log In" : "Create Account"}
            </button>
          </form>
          <div className="auth-row">
            <button className="btn secondary" onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}>
              {authMode === "login" ? "Need an account?" : "Already have an account?"}
            </button>
            <button className="btn secondary" onClick={() => void onForgotPassword()} disabled={authBusy}>
              Forgot Password
            </button>
          </div>
          <div className="verify-box">
            <input
              placeholder="Verification token"
              value={verifyToken}
              onChange={(event) => setVerifyToken(event.target.value)}
            />
            <button className="btn secondary" onClick={() => void onVerifyEmail()} disabled={authBusy}>
              Verify Email
            </button>
          </div>
          <p className="muted small">Google and Apple OAuth are available in iOS/Android builds where native identity providers are configured.</p>
          {authMessage ? <p className="auth-message">{authMessage}</p> : null}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="side-nav">
        <h1>PookieStudios</h1>
        <nav>
          <button className={`nav-btn ${route === "home" ? "active" : ""}`} onClick={() => setRoute("home")}>
            Home
          </button>
          <button className={`nav-btn ${route === "store" ? "active" : ""}`} onClick={() => setRoute("store")}>
            Store
          </button>
          <button className={`nav-btn ${route === "profile" ? "active" : ""}`} onClick={() => setRoute("profile")}>
            Profile
          </button>
          <button className={`nav-btn ${route === "settings" ? "active" : ""}`} onClick={() => setRoute("settings")}>
            Settings
          </button>
        </nav>
        <button className="btn secondary" onClick={() => void onLogout()}>
          Logout
        </button>
      </aside>

      <section className="content-panel">
        {activeScreen}
        {authMessage ? <div className="toast">{authMessage}</div> : null}
      </section>
    </main>
  );
}
