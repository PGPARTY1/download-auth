"use client";

import { SignInButton } from "@clerk/nextjs";

/**
 * Download page: vault. Locked when logged out; disabled downloads (Coming 2027) when logged in.
 * Buttons present but inactive. Subtle pulse/glow on disabled state.
 */
const DOWNLOADS = [
  { title: "Game Build", platform: "Windows", size: "—" },
  { title: "Game Build", platform: "macOS", size: "—" },
  { title: "Game Build", platform: "Linux", size: "—" },
];

type Props = {
  isSignedIn: boolean;
};

export function DownloadContent({ isSignedIn }: Props) {
  if (!isSignedIn) {
    return (
      <div className="vault vault-locked">
        <div className="vault-lock-visual" aria-hidden>
          <span className="vault-lock-icon" />
          <div className="vault-lock-glow" />
        </div>
        <h2 className="vault-lock-title">Downloads</h2>
        <p className="vault-lock-text">Login to access downloads</p>
        <SignInButton mode="redirect">
          <button type="button" className="vault-lock-btn">
            Login
          </button>
        </SignInButton>
      </div>
    );
  }

  return (
    <div className="vault vault-unlocked">
      <p className="vault-coming">Coming 2027</p>
      <p className="vault-coming-text">Downloads will be available at release.</p>

      <section className="vault-downloads" aria-label="Downloads">
        <h2 className="vault-downloads-title">Downloads</h2>
        <ul className="vault-download-list">
          {DOWNLOADS.map((item, i) => (
            <li key={i} className="vault-download-item">
              <span className="vault-download-name">{item.title}</span>
              <span className="vault-download-meta">{item.platform}</span>
              <span className="vault-download-meta">{item.size}</span>
              <span className="vault-download-disabled" aria-disabled="true">
                <span className="vault-download-disabled-pulse">Coming 2027</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="vault-plans" aria-label="Plans">
        <h2 className="vault-plans-title">Plans</h2>
        <p className="vault-plans-badge">Available at release (2027)</p>
        <div className="vault-plans-grid">
          <article className="vault-panel">
            <div className="vault-panel-border" aria-hidden />
            <div className="vault-panel-glow" aria-hidden />
            <h3 className="vault-panel-name">BASE</h3>
            <p className="vault-panel-tagline">Best for players who want story & graphics</p>
            <p className="vault-panel-price">₹669 / $9.99</p>
            <p className="vault-panel-note">One-time payment (future)</p>
            <ul className="vault-panel-features">
              <li>Core game content & story</li>
              <li>Single-player experience</li>
              <li>Future updates</li>
            </ul>
            <p className="vault-panel-coming">
              <span className="vault-panel-coming-pulse">Coming 2027</span>
            </p>
          </article>
          <article className="vault-panel">
            <div className="vault-panel-border" aria-hidden />
            <div className="vault-panel-glow" aria-hidden />
            <h3 className="vault-panel-name">FULL</h3>
            <p className="vault-panel-tagline">Best for players who want a little extra</p>
            <p className="vault-panel-price">₹849 / $14.99</p>
            <p className="vault-panel-note">One-time payment (future)</p>
            <ul className="vault-panel-features">
              <li>Everything in BASE</li>
              <li>Multiplayer</li>
              <li>DLCs</li>
              <li>Early access perks</li>
            </ul>
            <p className="vault-panel-coming">
              <span className="vault-panel-coming-pulse">Coming 2027</span>
            </p>
          </article>
        </div>
      </section>
    </div>
  );
}
