import { SUPPORT_HOTLINE } from "@/lib/faqs";

export const CONTACT_FACEBOOK_URL =
  process.env.NEXT_PUBLIC_CONTACT_FACEBOOK_URL ?? "https://www.facebook.com/dreamkitvn";

export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE ?? SUPPORT_HOTLINE;

export const CONTACT_ZALO_URL =
  process.env.NEXT_PUBLIC_CONTACT_ZALO_URL ??
  (CONTACT_PHONE ? `https://zalo.me/${CONTACT_PHONE}` : "");
