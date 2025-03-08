import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { FooterComponent } from "@/components/footer";
import { UserProvider } from "@/userContext/userContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Office Management System",
  description: "The Office everything for you at your fingertips",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <UserProvider>
          {children}
        </UserProvider>
      </body>
    </html>
  );
}
