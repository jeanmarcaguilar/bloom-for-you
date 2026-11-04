import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "Bloom for You",
  robots: { index: false, follow: false },
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body className="min-h-screen font-sans antialiased">{children}</body></html>;
}
