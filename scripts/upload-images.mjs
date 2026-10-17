#!/usr/bin/env node
/**
 * Uploads the site's starter images to Cloudinary and switches the site to use them.
 *
 *   npm run images:upload
 *
 * - Uploads everything in public/seed and public/brand (except CSS-only textures)
 * - Writes src/config/cloudinary-map.json  (asset() then returns Cloudinary URLs)
 * - Updates the panels table so each seeded panel points at its Cloudinary image
 *
 * Needs in .env.local: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY,
 * CLOUDINARY_API_SECRET, and (for the panels update) NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SECRET_KEY. Safe to run again: images are overwritten in place.
 */
import { createHash } from "node:crypto";
import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
config({ path: path.join(root, ".env.local") });

const CLOUD = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const KEY = process.env.CLOUDINARY_API_KEY;
const SECRET = process.env.CLOUDINARY_API_SECRET;
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_SECRET = process.env.SUPABASE_SECRET_KEY;

if (!CLOUD || !KEY || !SECRET) {
  console.error("✖ Missing Cloudinary settings in .env.local (cloud name, API key and API secret).");
  process.exit(1);
}

const SKIP = new Set(["noise.png", "texture-dark.webp", "texture-light.webp"]);
const IMAGE = /\.(png|jpe?g|webp|svg)$/i;

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (IMAGE.test(entry.name) && !SKIP.has(entry.name)) out.push(full);
  }
  return out;
}

function sign(params) {
  const str = Object.keys(params)
    .sort()
    .map((k) => `${k}=${params[k]}`)
    .join("&");
  return createHash("sha1").update(str + SECRET).digest("hex");
}

async function upload(file) {
  const rel = "/" + path.relative(path.join(root, "public"), file).split(path.sep).join("/"); // "/seed/panels/orbit.webp"
  const isPanel = rel.startsWith("/seed/panels/");
  const base = path.basename(file).replace(IMAGE, "");
  const folder = isPanel ? "wronge/panels" : `wronge/site${path.posix.dirname(rel)}`;
  const params = { folder, overwrite: "true", public_id: base, timestamp: Math.floor(Date.now() / 1000) };

  const form = new FormData();
  form.append("file", new Blob([await readFile(file)]), path.basename(file));
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append("api_key", KEY);
  form.append("signature", sign(params));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, { method: "POST", body: form });
  const data = await res.json();
  if (!res.ok) throw new Error(`${rel}: ${data?.error?.message ?? res.status}`);
  return { rel, isPanel, slug: base, url: data.secure_url, publicId: data.public_id };
}

const files = [...(await walk(path.join(root, "public", "seed"))), ...(await walk(path.join(root, "public", "brand")))];
console.log(`Uploading ${files.length} images to Cloudinary (${CLOUD})…`);

const results = [];
for (const f of files) {
  try {
    const r = await upload(f);
    results.push(r);
    console.log(`  ✔ ${r.rel}`);
  } catch (e) {
    console.error(`  ✖ ${e.message}`);
  }
}

const map = Object.fromEntries(results.map((r) => [r.rel, r.url]));
await writeFile(path.join(root, "src", "config", "cloudinary-map.json"), JSON.stringify(map, null, 2) + "\n");
console.log(`\nWrote src/config/cloudinary-map.json (${results.length} images).`);

if (!SB_URL || !SB_SECRET) {
  console.log("Supabase secret key not set, so the panels table was not updated. Add it and run again.");
  process.exit(0);
}

let updated = 0;
for (const r of results.filter((x) => x.isPanel)) {
  const res = await fetch(`${SB_URL}/rest/v1/panels?image_url=eq.${encodeURIComponent(r.rel)}`, {
    method: "PATCH",
    headers: {
      apikey: SB_SECRET,
      Authorization: `Bearer ${SB_SECRET}`,
      "Content-Type": "application/json",
      Prefer: "return=representation",
    },
    body: JSON.stringify({ image_url: r.url, image_public_id: r.publicId }),
  });
  if (!res.ok) {
    console.error(`  ✖ panels update for ${r.slug}: ${res.status} ${await res.text()}`);
    continue;
  }
  updated += (await res.json()).length;
}
console.log(`Updated ${updated} panel rows to use Cloudinary images.`);
console.log("\nDone. Restart the dev server (or redeploy) to see the Cloudinary images.");
