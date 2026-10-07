import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FALD Zone Size Calculator",
  description: "Calculate and visualize full array local dimming (FALD) zone sizes for displays.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <div className="header-inner">
            <div className="brand">
              <svg viewBox="0 0 30 30" fill="none" aria-hidden="true">
                <rect x="1" y="1" width="28" height="28" rx="3" fill="#191919" />
                <path d="M10 1V29M20 1V29M1 10H29M1 20H29" stroke="white" strokeWidth="1" />
                <rect x="11" y="11" width="8" height="8" fill="white" />
              </svg>
              <h1>fald<span>zones</span></h1>
            </div>
            <span className="header-caption">Full-array local dimming calculator</span>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <span>&copy; {new Date().getFullYear()} FALD Zones</span>
          <span>Display geometry, made visible.</span>
        </footer>
      </body>
    </html>
  );
}
