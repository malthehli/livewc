import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import { Toaster } from "sonner";
import { AuthProvider } from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Majlis prediction",
  description: "The ultimate prediction game for friends and family.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} font-sans antialiased text-zinc-900 bg-white dark:bg-zinc-950 dark:text-white`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster position="bottom-center" richColors theme="system" />
      </body>
    </html>
  );
}
