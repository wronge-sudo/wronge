"use client";
import { useState, useTransition } from "react";
import { Loader2, Minus, Plus, Trash2 } from "lucide-react";
import { saveSizes, setPanelStock, type AdminState } from "@/actions/admin";
import { cn } from "@/lib/format";
import type { SizeRow } from "@/lib/types";
import { adminInput } from "./ui";

export function SizesEditor({ initial }: { initial: SizeRow[] }) {
  const [rows, setRows] = useState(initial.map((r) => ({ ...r })));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<AdminState>(null);
  const [newSize, setNewSize] = useState("");
  const dirty = JSON.stringify(rows) !== JSON.stringify(initial);
  const total = rows.filter((r) => r.is_active).reduce((s, r) => s + (Number(r.stock) || 0), 0);

  const update = (i: number, patch: Partial<SizeRow>) => setRows((rs) => rs.map((r, j) => (j === i ? { ...r, ...patch } : r)));

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {rows.map((r, i) => (
          <div key={r.size} className={cn("rounded-2xl border p-4", r.is_active ? "border-line bg-white" : "border-dashed border-line bg-paper-2/40 opacity-70")}>
            <div className="flex items-center justify-between">
              <span className="font-mono text-xl font-bold">{r.size}</span>
              <button type="button" aria-label={`Remove size ${r.size}`} onClick={() => setRows((rs) => rs.filter((_, j) => j !== i))} className="rounded-full p-1 text-muted hover:bg-rose-50 hover:text-rose-700">
                <Trash2 className="size-3.5" />
              </button>
            </div>
            <div className="mt-3 flex items-center gap-1">
              <button type="button" aria-label="Less" onClick={() => update(i, { stock: Math.max(0, r.stock - 1) })} className="grid size-9 place-items-center rounded-lg border border-line hover:border-ink">
                <Minus className="size-3.5" />
              </button>
              <input
                inputMode="numeric"
                value={r.stock}
                onChange={(e) => update(i, { stock: Number(e.target.value.replace(/\D/g, "")) || 0 })}
                className={cn(adminInput, "h-9 text-center font-mono font-bold")}
                aria-label={`Stock for ${r.size}`}
              />
              <button type="button" aria-label="More" onClick={() => update(i, { stock: r.stock + 1 })} className="grid size-9 place-items-center rounded-lg border border-line hover:border-ink">
                <Plus className="size-3.5" />
              </button>
            </div>
            {r.stock <= 3 && r.is_active && <p className="mt-2 text-xs font-semibold text-rose-700">{r.stock === 0 ? "Sold out" : "Low stock"}</p>}
            <label className="mt-3 flex items-center gap-2 text-xs font-semibold">
              <input type="checkbox" checked={r.is_active} onChange={(e) => update(i, { is_active: e.target.checked })} className="accent-ink" /> Show in store
            </label>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          <input value={newSize} onChange={(e) => setNewSize(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8))} placeholder="New size, e.g. 3XL" className={cn(adminInput, "w-44 font-mono")} />
          <button
            type="button"
            disabled={!newSize || rows.some((r) => r.size === newSize)}
            onClick={() => {
              setRows((rs) => [...rs, { size: newSize, stock: 0, is_active: true, sort_order: (rs.at(-1)?.sort_order ?? 0) + 1 }]);
              setNewSize("");
            }}
            className="h-11 rounded-xl border border-line bg-white px-4 text-xs font-bold uppercase tracking-wider hover:border-ink disabled:opacity-40"
          >
            Add size
          </button>
        </div>
        <span className="text-sm text-muted">Total jackets in stock: <strong className="font-mono text-ink">{total}</strong></span>
        <button
          type="button"
          disabled={!dirty || pending}
          onClick={() =>
            start(async () => {
              const res = await saveSizes(JSON.stringify(rows.map((r, i) => ({ size: r.size, stock: r.stock, is_active: r.is_active, sort_order: i + 1 }))));
              setMsg(res);
            })
          }
          className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-xs font-bold uppercase tracking-wider text-paper disabled:opacity-40"
        >
          {pending && <Loader2 className="size-4 animate-spin" />} Save jacket stock
        </button>
      </div>
      {msg && <p className={cn("mt-3 text-sm font-semibold", msg.ok ? "text-emerald-700" : "text-rose-700")}>{msg.message}</p>}
    </div>
  );
}

export function PanelStockInput({ id, stock }: { id: string; stock: number | null }) {
  const [value, setValue] = useState(stock === null ? "" : String(stock));
  const [pending, start] = useTransition();
  const [state, setState] = useState<"idle" | "saved" | "error">("idle");
  const initial = stock === null ? "" : String(stock);

  return (
    <form
      className="flex items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await setPanelStock(id, value);
          setState(res?.ok ? "saved" : "error");
        });
      }}
    >
      <input
        value={value}
        onChange={(e) => {
          setValue(e.target.value.replace(/\D/g, ""));
          setState("idle");
        }}
        inputMode="numeric"
        placeholder="∞"
        className={cn(adminInput, "h-9 w-20 text-center font-mono", state === "error" && "border-rose-500")}
      />
      <button type="submit" disabled={pending || value === initial} className="h-9 rounded-lg bg-ink px-3 text-xs font-bold text-paper disabled:opacity-30">
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : state === "saved" ? "✓" : "Save"}
      </button>
    </form>
  );
}
