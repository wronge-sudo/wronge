import { z } from "zod";
import { ALL_DISTRICTS } from "./bd";
import { normalizeBdPhone } from "./format";

const panelRef = z.object({
  id: z.string().max(64).optional(),
  slug: z.string().max(80),
  name: z.string().max(120),
  image: z.string().max(600),
  custom: z
    .object({
      url: z.string().url().max(600),
      publicId: z.string().max(300),
      zoom: z.number().min(1).max(3),
      x: z.number().min(-100).max(100),
      y: z.number().min(-100).max(100),
    })
    .optional(),
});

export const cartLineSchema = z.discriminatedUnion("type", [
  z.object({ key: z.string().max(64), type: z.literal("jacket"), size: z.string().max(8), qty: z.number().int().min(1).max(10) }),
  z.object({ key: z.string().max(64), type: z.literal("pack"), panels: z.array(panelRef).min(1).max(12), qty: z.number().int().min(1).max(10) }),
  z.object({ key: z.string().max(64), type: z.literal("bundle"), size: z.string().max(8), panels: z.array(panelRef).min(1).max(12), qty: z.number().int().min(1).max(10) }),
]);

export const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .refine((v) => normalizeBdPhone(v) !== null, "Enter a valid Bangladeshi mobile number (01XXXXXXXXX)"),
  email: z.string().trim().email("Enter a valid email").max(120).optional().or(z.literal("")),
  district: z.string().refine((v) => ALL_DISTRICTS.includes(v), "Choose your district"),
  area: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().min(8, "Please write your full address (house, road, area)").max(300),
  zone: z.enum(["inside_dhaka", "outside_dhaka"]),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  website: z.string().max(0).optional(), // honeypot — must stay empty
  lines: z.array(cartLineSchema).min(1, "Your bag is empty").max(20),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
