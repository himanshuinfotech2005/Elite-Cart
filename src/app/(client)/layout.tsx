import type { Metadata } from "next";

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { ClerkProvider } from "@clerk/nextjs";
import "../globals.css";



export const metadata: Metadata = {
  title: {
    template: "%s - EliteCart online store",
    default: "EliteCart online store"
  },
  description: "EliteCart online store, your one stop shop for all your need",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>

            <Footer />
          </div>       
    </ClerkProvider>

  );
}
