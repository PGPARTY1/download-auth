"use client";

import Link from "next/link";
import { AccountButton } from "./AccountButton";

/**
 * Navbar: logo, Download link, account (UserButton or Login).
 */
export function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          PookieStudios
        </Link>
        <nav className="navbar-links">
          <Link href="/download" className="navbar-link">
            Download
          </Link>
          <AccountButton />
        </nav>
      </div>
    </header>
  );
}
