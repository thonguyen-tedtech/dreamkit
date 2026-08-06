import { z } from "zod";

/**
 * Size/color/quantity are controlled selectors (buttons, stepper) in the pre-order
 * form UI, not free text, so only the free-text contact fields need zod validation
 * here — mirrors `components/schemas/checkout.schema.ts`.
 */
export const preOrderFormSchema = z.object({
  name: z
    .string()
    .min(1, "Vui lòng nhập họ và tên")
    .max(100, "Họ và tên tối đa 100 ký tự"),
  phone: z
    .string()
    .min(1, "Vui lòng nhập số điện thoại")
    .max(30, "Số điện thoại tối đa 30 ký tự"),
  address: z
    .string()
    .min(1, "Vui lòng nhập địa chỉ giao hàng")
    .max(500, "Địa chỉ tối đa 500 ký tự"),
  note: z.string().max(2000, "Ghi chú tối đa 2000 ký tự"),
});

export type PreOrderFormType = z.infer<typeof preOrderFormSchema>;
