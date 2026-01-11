import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Footer } from "react-day-picker";
import Header from "@/components/Header";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from '@clerk/nextjs'
import { Toaster } from "sonner";




export const metadata: Metadata = {
  title: "K-Save",
  description: "K powered Finance Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={``}
        >
          <Header />
          <div className="w-full min-h-screen">
            {children}</div>
          <Toaster richColors />
          <Footer className=" bg-blue-50 text-center font-medium mx-auto py-12">
            &copy; 2023 K-Save
          </Footer>
        </body>
      </html>
    </ClerkProvider>
  );
}
