"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ImagePlus, Loader2, RotateCcw } from "lucide-react";
import { cn, taka } from "@/lib/format";
import { usePack } from "@/store/pack";
import { useMounted } from "@/lib/use-mounted";
import { ACCEPTED, MAX_UPLOAD_MB, uploadImage, type UploadResult } from "@/lib/upload";
import { JacketBack } from "./jacket-back";
import { useStoreData } from "./store-data";

const MIN_GOOD_HEIGHT = 1400;

export function CustomStudio({ uploadsEnabled }: { uploadsEnabled: boolean }) {
  const mounted = useMounted();
  const { settings } = useStoreData();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState<UploadResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dims, setDims] = useState<{ w: number; h: number } | null>(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [rights, setRights] = useState(false);
  const [done, setDone] = useState(false);
  const picked = usePack((s) => s.panels);
  const add = usePack((s) => s.add);

  useEffect(() => () => void (localUrl && URL.revokeObjectURL(localUrl)), [localUrl]);

  const full = mounted && picked.length >= settings.pack_size;
  const image = uploaded?.url ?? localUrl;
  const lowRes = dims && dims.h < MIN_GOOD_HEIGHT;

  async function onFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setDone(false);
    if (!ACCEPTED.includes(file.type)) return setError("Please choose a JPG, PNG or WEBP image.");
    if (file.size > MAX_UPLOAD_MB * 1024 * 1024) return setError(`Images must be under ${MAX_UPLOAD_MB} MB.`);
    const url = URL.createObjectURL(file);
    setLocalUrl(url);
    setUploaded(null);
    setZoom(1);
    setX(0);
    setY(0);
    const img = new window.Image();
    img.onload = () => setDims({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = url;
    if (!uploadsEnabled) return;
    setBusy(true);
    try {
      setUploaded(await uploadImage(file, "custom"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  function addToPack() {
    if (!uploaded || !rights) return;
    const ok = add(
      {
        slug: `custom-${uploaded.publicId.split("/").pop()}`.toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 70),
        name: "Custom panel",
        image: uploaded.url,
        custom: { url: uploaded.url, publicId: uploaded.publicId, zoom, x, y },
      },
      settings.pack_size,
    );
    if (!ok) return setError(`Your pack already has ${settings.pack_size} panels. Remove one first.`);
    setDone(true);
  }

  const slider = (label: string, value: number, set: (n: number) => void, min: number, max: number, step: number) => (
    <label className="block">
      <span className="flex justify-between font-mono text-xs uppercase tracking-wider">
        <span>{label}</span>
        <span className="text-muted">{label === "Zoom" ? `${value.toFixed(2)}×` : value}</span>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => set(Number(e.target.value))} className="mt-2 w-full accent-ink" disabled={!image} />
    </label>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-6">
        <div className="lg:sticky lg:top-28">
          <JacketBack panel={image ? { image, name: "Your custom panel", custom: { zoom, x, y } } : null} showLabel eager />
        </div>
      </div>

      <div className="space-y-8 lg:col-span-6">
        {!uploadsEnabled && (
          <div className="flex gap-3 rounded-2xl border border-signal/30 bg-signal/10 p-4 text-sm">
            <AlertTriangle className="size-5 shrink-0 text-signal" />
            <p>Custom uploads are switched off for now. You can still preview your art here. To order a custom panel, message us.</p>
          </div>
        )}

        <div>
          <p className="eyebrow mb-3">1 · Upload your art</p>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              onFile(e.dataTransfer.files?.[0]);
            }}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-ink/30 bg-paper-2 px-6 py-10 text-center transition hover:border-ink"
          >
            {busy ? <Loader2 className="size-7 animate-spin" /> : uploaded ? <Check className="size-7" /> : <ImagePlus className="size-7" />}
            <span className="font-bold uppercase tracking-tight">{busy ? "Uploading…" : image ? "Choose a different image" : "Tap to upload, or drop an image here"}</span>
            <span className="text-xs text-muted">JPG, PNG or WEBP, up to {MAX_UPLOAD_MB} MB. Tall (portrait) images work best.</span>
          </button>
          <input ref={inputRef} type="file" accept={ACCEPTED.join(",")} className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
          {lowRes && (
            <p className="mt-3 flex items-start gap-2 text-xs text-signal">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
              This image is {dims!.w}×{dims!.h}px, so it may print a little soft. For a crisp print, use at least {MIN_GOOD_HEIGHT}px tall.
            </p>
          )}
          {error && <p className="mt-3 text-sm font-semibold text-signal" role="alert">{error}</p>}
        </div>

        <div className={cn("space-y-5", !image && "pointer-events-none opacity-40")}>
          <div className="flex items-center justify-between">
            <p className="eyebrow">2 · Position it</p>
            <button type="button" onClick={() => { setZoom(1); setX(0); setY(0); }} className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-muted hover:text-ink">
              <RotateCcw className="size-3.5" /> Reset
            </button>
          </div>
          {slider("Zoom", zoom, setZoom, 1, 3, 0.01)}
          {slider("Left / right", x, setX, -40, 40, 1)}
          {slider("Up / down", y, setY, -40, 40, 1)}
        </div>

        <div className={cn(!uploaded && "pointer-events-none opacity-40")}>
          <p className="eyebrow mb-3">3 · Add it to your pack</p>
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" checked={rights} onChange={(e) => setRights(e.target.checked)} className="mt-1 size-4 accent-ink" />
            <span className="text-muted">
              I own this image or have permission to print it. It doesn&apos;t contain anything hateful, explicit or someone else&apos;s trademark.
            </span>
          </label>
          {done ? (
            <div className="mt-5 rounded-2xl bg-acid p-5">
              <p className="font-bold">Added to your pack ✓</p>
              <p className="mt-1 text-sm text-ink/75">
                {picked.length < settings.pack_size ? `Pick ${settings.pack_size - picked.length} more panel(s) to complete the pack.` : "Your pack is complete."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link href="/build" className="inline-flex h-11 items-center rounded-full bg-ink px-5 text-xs font-bold uppercase tracking-wider text-paper">Build my set →</Link>
                <Link href="/panels" className="inline-flex h-11 items-center rounded-full border-2 border-ink px-5 text-xs font-bold uppercase tracking-wider">Pick more panels</Link>
              </div>
            </div>
          ) : (
            <button
              type="button"
              disabled={!uploaded || !rights || busy || full}
              onClick={addToPack}
              className="mt-5 h-14 w-full rounded-full bg-acid text-sm font-bold uppercase tracking-wider text-ink shadow-[0_2px_0_0_rgb(11_11_11)] transition hover:bg-ink hover:text-acid disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
            >
              {full ? "Your pack is full" : `Add to pack${settings.custom_panel_fee ? ` (+${taka(settings.custom_panel_fee)})` : ""}`}
            </button>
          )}
          <p className="mt-3 text-xs text-muted">
            A custom panel takes one of the {settings.pack_size} slots in a {taka(settings.pack_price)} pack. We check every design before printing and
            will call you if anything needs fixing.
          </p>
        </div>
      </div>
    </div>
  );
}
