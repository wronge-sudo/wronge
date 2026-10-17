"use client";
import Image from "next/image";
import { useActionState, useRef, useState, useTransition } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { deletePanel, savePanel, togglePanelFlag, type AdminState } from "@/actions/admin";
import { cn } from "@/lib/format";
import type { Panel } from "@/lib/types";
import { uploadImage } from "@/lib/upload";
import { adminInput } from "./ui";

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);

function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-muted">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs font-semibold text-rose-700">{error}</span> : hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

export function PanelForm({ panel, categories, uploadsEnabled }: { panel: Panel | null; categories: string[]; uploadsEnabled: boolean }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(savePanel.bind(null, panel?.id ?? null), null);
  const [name, setName] = useState(panel?.name ?? "");
  const [slug, setSlug] = useState(panel?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(panel));
  const [image, setImage] = useState({ url: panel?.image_url ?? "", publicId: panel?.image_public_id ?? "" });
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const fe = state?.fieldErrors ?? {};

  async function onFile(file?: File) {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const r = await uploadImage(file, "panel");
      setImage({ url: r.url, publicId: r.publicId });
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-line bg-paper-2">
          {image.url ? (
            <Image src={image.url} alt="Panel preview" fill sizes="320px" className="object-cover" />
          ) : (
            <div className="grid h-full place-items-center p-6 text-center text-sm text-muted">No image yet. Upload a portrait (3:4) image, at least 1200 × 1600 px.</div>
          )}
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-white/70">
              <Loader2 className="size-7 animate-spin" />
            </div>
          )}
        </div>
        <input type="hidden" name="image_url" value={image.url} />
        <input type="hidden" name="image_public_id" value={image.publicId} />
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        <button
          type="button"
          disabled={!uploadsEnabled || uploading}
          onClick={() => fileRef.current?.click()}
          className="mt-3 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-line bg-white text-sm font-semibold hover:border-ink disabled:opacity-50"
        >
          <ImagePlus className="size-4" /> {image.url ? "Replace image" : "Upload image"}
        </button>
        {!uploadsEnabled && <p className="mt-2 text-xs text-rose-700">Cloudinary isn&apos;t connected, so uploads are off.</p>}
        {(uploadError || fe.image_url) && <p className="mt-2 text-xs font-semibold text-rose-700">{uploadError ?? fe.image_url}</p>}
      </div>

      <div className="space-y-4 rounded-2xl border border-line/80 bg-white p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={fe.name}>
            <input
              name="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!slugTouched) setSlug(slugify(e.target.value));
              }}
              required
              className={adminInput}
            />
          </Field>
          <Field label="URL slug" error={fe.slug} hint={`wronge.com/panels/${slug || "…"}`}>
            <input
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              required
              className={cn(adminInput, "font-mono")}
            />
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Category" error={fe.category}>
            <input name="category" list="panel-categories" defaultValue={panel?.category ?? ""} required className={adminInput} />
            <datalist id="panel-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Field>
          <Field label="Artist" error={fe.artist}>
            <input name="artist" defaultValue={panel?.artist ?? "Wronge Studio"} className={adminInput} />
          </Field>
          <Field label="Badge" error={fe.badge} hint="e.g. New, Trending (optional)">
            <input name="badge" defaultValue={panel?.badge ?? ""} className={adminInput} />
          </Field>
        </div>
        <Field label="Description" error={fe.description}>
          <textarea name="description" rows={3} defaultValue={panel?.description ?? ""} className={cn(adminInput, "h-auto py-2.5")} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Stock" error={fe.stock} hint="Leave empty for unlimited (printed on demand)">
            <input name="stock" inputMode="numeric" defaultValue={panel?.stock ?? ""} className={cn(adminInput, "font-mono")} />
          </Field>
          <Field label="Sort order" error={fe.sort_order} hint="Lower numbers show first">
            <input name="sort_order" type="number" min={0} defaultValue={panel?.sort_order ?? 100} className={cn(adminInput, "font-mono")} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-6 pt-1">
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="is_active" defaultChecked={panel?.is_active ?? true} className="size-4 accent-ink" /> Visible in store
          </label>
          <label className="flex items-center gap-2 text-sm font-semibold">
            <input type="checkbox" name="is_featured" defaultChecked={panel?.is_featured ?? false} className="size-4 accent-ink" /> Featured on home page
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-line/70 pt-4">
          <button type="submit" disabled={pending || uploading} className="inline-flex h-11 items-center gap-2 rounded-xl bg-ink px-6 text-xs font-bold uppercase tracking-wider text-paper disabled:opacity-50">
            {pending && <Loader2 className="size-4 animate-spin" />} {panel ? "Save changes" : "Create panel"}
          </button>
          {state && <span className={cn("text-sm font-semibold", state.ok ? "text-emerald-700" : "text-rose-700")}>{state.message}</span>}
          {panel && (
            <button
              type="button"
              disabled={deleting}
              onClick={() => {
                if (!window.confirm(`Delete "${panel.name}" for good? Old orders keep their copy. To just hide it, untick "Visible in store" instead.`)) return;
                startDelete(async () => {
                  await deletePanel(panel.id);
                });
              }}
              className="ml-auto inline-flex h-11 items-center gap-2 rounded-xl px-4 text-xs font-bold uppercase tracking-wider text-rose-700 hover:bg-rose-50"
            >
              <Trash2 className="size-4" /> Delete
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export function PanelFlagToggle({ id, field, value, label }: { id: string; field: "is_active" | "is_featured"; value: boolean; label: string }) {
  const [pending, start] = useTransition();
  const [optimistic, setOptimistic] = useState(value);
  return (
    <button
      type="button"
      role="switch"
      aria-checked={optimistic}
      aria-label={label}
      disabled={pending}
      onClick={() => {
        const next = !optimistic;
        setOptimistic(next);
        start(async () => {
          const res = await togglePanelFlag(id, field, next);
          if (!res?.ok) setOptimistic(!next);
        });
      }}
      className={cn("relative h-6 w-11 rounded-full transition", optimistic ? "bg-ink" : "bg-line", pending && "opacity-60")}
    >
      <span className={cn("absolute top-0.5 size-5 rounded-full bg-white shadow transition-all", optimistic ? "left-[22px] bg-acid" : "left-0.5")} />
    </button>
  );
}
