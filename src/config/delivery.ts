/**
 * Delivery zones, couriers and the payment rule each courier comes with.
 * Fees are set in Admin → Settings. The zone keys (`inside_dhaka` / `outside_dhaka`)
 * are the database's stored values and column names; they now mean inside/outside
 * Chattogram city. Use the labels below for anything a person reads.
 */
import type { DeliveryZone } from "@/lib/types";

/** Only addresses in this district can choose the cheaper "inside city" rate. */
export const DELIVERY_CITY = "Chattogram";

export const ZONE_LABEL: Record<DeliveryZone, string> = {
  inside_dhaka: `Inside ${DELIVERY_CITY} city`,
  outside_dhaka: `Outside ${DELIVERY_CITY} city`,
};

export const COURIERS = [
  { id: "pathao", name: "Pathao", payment: "full_advance" },
  { id: "steadfast", name: "Steadfast", payment: "full_advance" },
  { id: "sa_paribahan", name: "S.A. Paribahan", payment: "delivery_fee_advance" },
  { id: "sundarban", name: "Sundarban Courier Service", payment: "delivery_fee_advance" },
] as const;

export type CourierId = (typeof COURIERS)[number]["id"];
/** Stored in `orders.payment_method`. Orders placed before Nov 2026 hold "cod". */
export type PaymentMethod = (typeof COURIERS)[number]["payment"];

export const COURIER_IDS = COURIERS.map((c) => c.id) as [CourierId, ...CourierId[]];

export function courierById(id: string) {
  return COURIERS.find((c) => c.id === id);
}

export const PAYMENT_LABEL: Record<string, string> = {
  full_advance: "Full advance payment",
  delivery_fee_advance: "Delivery charge in advance, rest cash on delivery",
  cod: "Cash on delivery",
};

export const PAYMENT_SHORT: Record<PaymentMethod, string> = {
  full_advance: "Full advance payment",
  delivery_fee_advance: "Delivery charge first, rest on delivery",
};

/** How much is paid before dispatch and how much the courier collects. */
export function paymentSplit(method: string, total: number, delivery: number) {
  if (method === "full_advance") return { advance: total, onDelivery: 0 };
  if (method === "delivery_fee_advance") return { advance: delivery, onDelivery: Math.max(0, total - delivery) };
  return { advance: 0, onDelivery: total };
}

/** The payment rule in one sentence, for FAQ, policy pages and checkout. */
export const PAYMENT_POLICY =
  "Pathao or Steadfast: full advance payment after we confirm your order. S.A. Paribahan or Sundarban Courier Service: pay only the delivery charge in advance, and pay the rest in cash on delivery.";
