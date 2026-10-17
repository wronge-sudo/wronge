import { NextResponse, type NextRequest } from "next/server";
import { getAdminOrNull } from "@/lib/admin-auth";
import { applyOrderFilters } from "@/lib/admin-data";
import type { OrderItemRow } from "@/lib/types";

function csvCell(v: unknown) {
  let s = v === null || v === undefined ? "" : String(v);
  // Stop spreadsheet formula injection (=, +, -, @ at the start of a cell).
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
const toCsv = (rows: unknown[][]) => "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");

export async function GET(request: NextRequest) {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const { supabase } = admin;
  const sp = request.nextUrl.searchParams;
  const type = sp.get("type");
  const stamp = new Date(Date.now() + 6 * 3600_000).toISOString().slice(0, 10);

  if (type === "subscribers") {
    const { data } = await supabase.from("subscribers").select("email, created_at").order("created_at", { ascending: false }).limit(10000);
    const body = toCsv([["Email", "Subscribed at"], ...(data ?? []).map((s) => [s.email, s.created_at])]);
    return new NextResponse(body, {
      headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="wronge-subscribers-${stamp}.csv"` },
    });
  }

  let query = supabase
    .from("orders")
    .select("*, order_items(title, size, quantity, line_total, panels)")
    .order("created_at", { ascending: false })
    .limit(5000);
  query = applyOrderFilters(query, {
    status: sp.get("status") ?? undefined,
    q: sp.get("q") ?? undefined,
    from: sp.get("from") ?? undefined,
    to: sp.get("to") ?? undefined,
  });
  const { data, error } = await query;
  if (error) return NextResponse.json({ error: "Export failed" }, { status: 500 });

  const header = ["Order", "Date", "Status", "Customer", "Phone", "Email", "District", "Area", "Address", "Zone", "Items", "Subtotal", "Discount", "Delivery", "Total", "Payment", "Courier", "Tracking", "Customer note", "Admin note"];
  const rows = (data ?? []).map((o) => [
    o.order_number,
    new Date(o.created_at).toLocaleString("en-GB", { timeZone: "Asia/Dhaka" }),
    o.status,
    o.customer_name,
    o.phone,
    o.email,
    o.district,
    o.area,
    o.address,
    o.delivery_zone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka",
    (o.order_items as Pick<OrderItemRow, "title" | "size" | "quantity" | "panels">[])
      .map((i) => `${i.title}${i.size ? ` (${i.size})` : ""} x${i.quantity}${i.panels.length ? ` [${i.panels.map((p) => p.name).join(" / ")}]` : ""}`)
      .join("; "),
    o.subtotal,
    o.discount,
    o.delivery_fee,
    o.total,
    o.payment_status,
    o.courier,
    o.tracking_code,
    o.note,
    o.admin_note,
  ]);
  return new NextResponse(toCsv([header, ...rows]), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="wronge-orders-${stamp}.csv"` },
  });
}
