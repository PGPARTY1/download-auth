"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

/**
 * Navbar account: SignedIn → Clerk UserButton (circle, dropdown: Account + Logout).
 * SignedOut → Login button.
 */
export function AccountButton() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="redirect">
          <button type="button" className="account-login">
            Login
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton
          afterSignOutUrl="/download"
          appearance={{
            elements: {
              avatarBox: "account-user-button",
            },
          }}
        />
      </SignedIn>
    </>
  );
}
