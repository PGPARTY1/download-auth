"use client";

import { SignInButton, SignUpButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

/**
 * Navbar account: SignedIn → Clerk UserButton (circle, dropdown: Account + Logout).
 * SignedOut → Sign In and Sign Up buttons.
 */
export function AccountButton() {
  return (
    <>
      <SignedOut>
        <SignInButton mode="redirect">
          <button type="button" className="account-login">
            Sign In
          </button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <button type="button" className="account-signup">
            Sign Up
          </button>
        </SignUpButton>
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
