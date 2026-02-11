import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { AppShell } from "@/components/AppShell";
import { SignInPage } from "@/components/SignInPage";
import { SupabaseProvider } from "@/contexts/SupabaseContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpsMap - Operations Mapping Tool",
  description: "Map your business operations with function charts and workflows",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <SupabaseProvider>
            <SignedOut>
              <SignInPage />
            </SignedOut>
            <SignedIn>
              <AppShell>{children}</AppShell>
            </SignedIn>
          </SupabaseProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
