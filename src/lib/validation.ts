import { z } from "zod";
import { COURIER_IDS } from "@/config/delivery";
import { SIZES } from "@/config/site";
import { ALL_DISTRICTS } from "./bd";
import { normalizeBdPhone } from "./format";

export const cartLineSchema = z.object({
  key: z.string().max(64),
  type: z.literal("package"),
  size: z.enum(SIZES, "That size isn't available"),
  qty: z.number().int().min(1).max(10),
});

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
  courier: z.enum(COURIER_IDS, "Choose a courier"),
  note: z.string().trim().max(300).optional().or(z.literal("")),
  website: z.string().max(0).optional(), // honeypot — must stay empty
  lines: z.array(cartLineSchema).min(1, "Your bag is empty").max(20),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;
