import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Navbar } from "@/components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "PookieStudios — Coming 2027",
  description: "PookieStudios. Game studio. Coming 2027.",
  metadataBase: new URL("https://pookiestudios.in"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body>
          <div className="app-layout">
            <Navbar />
            {children}
            <footer className="footer">
              <p>© {new Date().getFullYear()} PookieStudios. All rights reserved.</p>
            </footer>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
