import type { Metadata } from "next";
import { Fraunces, Outfit, Geist } from "next/font/google";
import { Suspense } from "react";
import { CartProvider } from "@/src/shared/context/cart-provider";
import "./globals.css";
import { cn } from "@/src/lib/utils";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comal - Restaurante de comida mexicana",
  description: "Restaurante de comida mexicana",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={cn(
        "h-full",
        "antialiased",
        outfit.variable,
        fraunces.variable,
        "font-sans",
        geist.variable,
      )}
    >
      <body className="min-h-full flex flex-col font-sans max-w-md mx-auto outline-1 bg-gray-800">
        <Suspense fallback={null}>
          <CartProvider>{children}</CartProvider>
        </Suspense>
      </body>
    </html>
  );
}
