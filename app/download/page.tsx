import { auth } from "@clerk/nextjs/server";
import { DownloadContent } from "./DownloadContent";

/**
 * Download page: vault. Locked when logged out; disabled downloads when logged in.
 */
export default async function DownloadPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <main className="vault-main">
      <DownloadContent isSignedIn={isSignedIn} />
    </main>
  );
}
