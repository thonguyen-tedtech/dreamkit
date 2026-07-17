import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { AuthModalProvider } from "@/components/auth/auth-modal-provider";
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
    icon: "https://dreamkit.vn/wp-content/uploads/2024/11/cropped-Untitled-3-192x192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen antialiased">
        <ToastProvider>
          <AuthModalProvider>
            <StoreProvider>
              <CartProvider>
                {children}
                <FloatContact />
              </CartProvider>
            </StoreProvider>
          </AuthModalProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
