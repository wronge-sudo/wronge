const bdt = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });

/** 5000 → "৳5,000" */
export function taka(amount: number): string {
  return `৳${bdt.format(Math.round(amount))}`;
}

export function formatDate(iso: string, withTime = false): string {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit", hour12: true } : {}),
  });
}

/** Normalises Bangladeshi mobile numbers to 01XXXXXXXXX. Returns null if invalid. */
export function normalizeBdPhone(input: string): string | null {
  const digits = input.replace(/[^\d]/g, "");
  const local = digits.startsWith("880") ? digits.slice(2) : digits.startsWith("88") ? digits.slice(2) : digits;
  return /^01[3-9]\d{8}$/.test(local) ? local : null;
}

export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export const STATUS_LABEL: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  returned: "Returned",
};
