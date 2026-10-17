"use client";
import { useActionState, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { saveSettings, type AdminState } from "@/actions/admin";
import { cn, taka } from "@/lib/format";
import type { SizeChartRow, StoreSettings } from "@/lib/types";
import { adminInput } from "./ui";

function Field({ label, name, error, hint, prefix, ...rest }: { label: string; name: string; error?: string; hint?: string; prefix?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
      <span className="relative block">
        {prefix && <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm text-muted">{prefix}</span>}
        <input name={name} className={cn(adminInput, prefix && "pl-8 font-mono", error && "border-rose-500")} {...rest} />
      </span>
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-700">{error}</span> : hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-5 border-b border-line/70 py-7 first:pt-0 last:border-0 lg:grid-cols-[260px_1fr]">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveSettings, null);
  const [chart, setChart] = useState<SizeChartRow[]>(settings.size_chart ?? []);
  const [prices, setPrices] = useState({ jacket: settings.jacket_price, pack: settings.pack_price, discount: settings.bundle_discount });
  const fe = state?.fieldErrors ?? {};
  const v = (n: number | null) => (n === null || n === undefined ? "" : String(n));

  return (
    <form action={action} className="rounded-2xl border border-line/80 bg-white p-5 sm:p-7">
      <Section title="Prices" description="Whole taka. Changes show in the store right away.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Jacket price" name="jacket_price" prefix="৳" inputMode="numeric" defaultValue={settings.jacket_price} error={fe.jacket_price} hint="Includes the blank denim panel" onChange={(e) => setPrices((p) => ({ ...p, jacket: Number(e.target.value) || 0 }))} />
          <Field label="Old price (crossed out)" name="jacket_compare_at" prefix="৳" inputMode="numeric" defaultValue={v(settings.jacket_compare_at)} error={fe.jacket_compare_at} hint="Optional, for showing a sale" />
          <Field label="Panel pack price" name="pack_price" prefix="৳" inputMode="numeric" defaultValue={settings.pack_price} error={fe.pack_price} onChange={(e) => setPrices((p) => ({ ...p, pack: Number(e.target.value) || 0 }))} />
          <Field label="Panels per pack" name="pack_size" type="number" min={1} max={12} defaultValue={settings.pack_size} error={fe.pack_size} />
          <Field label="Set discount" name="bundle_discount" prefix="৳" inputMode="numeric" defaultValue={settings.bundle_discount} error={fe.bundle_discount} hint="Taken off when jacket + pack are bought together" onChange={(e) => setPrices((p) => ({ ...p, discount: Number(e.target.value) || 0 }))} />
          <Field label="Extra fee per custom panel" name="custom_panel_fee" prefix="৳" inputMode="numeric" defaultValue={settings.custom_panel_fee} error={fe.custom_panel_fee} hint="0 = no extra charge" />
        </div>
        <p className="rounded-xl bg-paper-2/60 px-4 py-3 text-sm">
          A full set (jacket + pack) costs <strong className="font-mono">{taka(Math.max(0, prices.jacket + prices.pack - prices.discount))}</strong> before delivery.
        </p>
      </Section>

      <Section title="Delivery" description="Cash on delivery charges.">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Inside Dhaka" name="delivery_inside_dhaka" prefix="৳" inputMode="numeric" defaultValue={settings.delivery_inside_dhaka} error={fe.delivery_inside_dhaka} />
          <Field label="Outside Dhaka" name="delivery_outside_dhaka" prefix="৳" inputMode="numeric" defaultValue={settings.delivery_outside_dhaka} error={fe.delivery_outside_dhaka} />
          <Field label="Free delivery from" name="free_delivery_min" prefix="৳" inputMode="numeric" defaultValue={v(settings.free_delivery_min)} error={fe.free_delivery_min} hint="Empty = never free" />
        </div>
      </Section>

      <Section title="Store" description="The announcement scrolls in the bar at the top of every page.">
        <label className="block">
          <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">Announcement</span>
          <textarea name="announcement" rows={2} defaultValue={settings.announcement ?? ""} className={cn(adminInput, "h-auto py-2.5")} />
          <span className="mt-1 block text-xs text-muted">Separate several messages with a | character.</span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-line p-4">
          <input type="checkbox" name="orders_enabled" defaultChecked={settings.orders_enabled} className="mt-0.5 size-4 accent-ink" />
          <span>
            <span className="block text-sm font-bold">Accept new orders</span>
            <span className="block text-xs text-muted">Untick to pause checkout (holidays, restocking). The store stays visible.</span>
          </span>
        </label>
      </Section>

      <Section title="Contact & social" description="Shown in the footer and on the Contact page.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Phone" name="support_phone" defaultValue={settings.support_phone ?? ""} error={fe.support_phone} placeholder="01XXXXXXXXX" />
          <Field label="WhatsApp" name="whatsapp" defaultValue={settings.whatsapp ?? ""} error={fe.whatsapp} placeholder="+8801XXXXXXXXX" />
          <Field label="Email" name="support_email" type="email" defaultValue={settings.support_email ?? ""} error={fe.support_email} />
          <div />
          <Field label="Facebook page URL" name="facebook_url" defaultValue={settings.facebook_url ?? ""} error={fe.facebook_url} placeholder="https://facebook.com/…" />
          <Field label="Instagram URL" name="instagram_url" defaultValue={settings.instagram_url ?? ""} error={fe.instagram_url} placeholder="https://instagram.com/…" />
        </div>
      </Section>

      <Section title="Size chart" description="Measurements in inches. The store also shows centimetres automatically.">
        <input type="hidden" name="size_chart" value={JSON.stringify(chart)} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-muted">
              <tr>
                <th className="pb-2 pr-2 font-bold">Size</th>
                <th className="pb-2 pr-2 font-bold">Chest</th>
                <th className="pb-2 pr-2 font-bold">Length</th>
                <th className="pb-2 pr-2 font-bold">Sleeve</th>
                <th className="pb-2 pr-2 font-bold">Fits</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {chart.map((row, i) => (
                <tr key={i}>
                  {(["size", "chest", "length", "sleeve", "fit"] as const).map((k) => (
                    <td key={k} className="pb-2 pr-2">
                      <input
                        value={row[k]}
                        onChange={(e) => setChart((c) => c.map((r, j) => (j === i ? { ...r, [k]: e.target.value } : r)))}
                        className={cn(adminInput, "h-9", k !== "fit" && "font-mono")}
                        aria-label={`${k} for row ${i + 1}`}
                      />
                    </td>
                  ))}
                  <td className="pb-2">
                    <button type="button" aria-label="Remove row" onClick={() => setChart((c) => c.filter((_, j) => j !== i))} className="rounded-full p-2 text-muted hover:bg-rose-50 hover:text-rose-700">
                      <Trash2 className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <button type="button" onClick={() => setChart((c) => [...c, { size: "", chest: "", length: "", sleeve: "", fit: "" }])} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-line px-3.5 text-xs font-semibold hover:border-ink">
          <Plus className="size-3.5" /> Add row
        </button>
        {fe.size_chart && <p className="text-xs font-semibold text-rose-700">{fe.size_chart}</p>}
      </Section>

      <div className="sticky bottom-0 -mx-5 -mb-5 flex flex-wrap items-center gap-3 rounded-b-2xl border-t border-line/70 bg-white/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:-mb-7 sm:px-7">
        <button type="submit" disabled={pending} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-xs font-bold uppercase tracking-wider text-paper disabled:opacity-50">
          {pending && <Loader2 className="size-4 animate-spin" />} Save settings
        </button>
        {state && <span className={cn("text-sm font-semibold", state.ok ? "text-emerald-700" : "text-rose-700")}>{state.message}</span>}
      </div>
    </form>
  );
}
