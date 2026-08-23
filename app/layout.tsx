import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arc Companion",
  description: "Your Arc journey, brought to life.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
