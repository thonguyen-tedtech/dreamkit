import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { CartProvider } from "@/components/cart/cart-provider";
import { StoreProvider } from "@/components/store/store-provider";
import { ToastProvider } from "@/components/ui/toast-provider";
import { FloatContact } from "@/components/contact/float-contact";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin", "vietnamese"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dreamkit — Thiết kế áo đấu",
  description:
    "Dreamkit thiết kế và sản xuất áo đấu bóng đá riêng cho từng đội bóng. Tự hào là sản phẩm được thiết kế & sản xuất tại Việt Nam.",
  openGraph: {
    title: "Dreamkit — Thiết kế áo đấu",
    description:
      "Thiết kế & sản xuất áo đấu bóng đá riêng cho từng đội bóng tại Việt Nam.",
    type: "website",
  },
  icons: {
    icon: [
      { url: "/images/favicon.ico" },
      { url: "/images/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/images/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/images/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/images/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/images/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <StoreProvider>
            <CartProvider>
              {children}
              <FloatContact />
            </CartProvider>
          </StoreProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
