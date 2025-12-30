import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "TaskFlow AI - Smart Task Management",
  description: "A futuristic, AI-powered task management dashboard to help you stay organized and productive.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`min-h-screen font-sans antialiased ${inter.variable}`}>
        {children}
      </body>
    </html>
  );
}
