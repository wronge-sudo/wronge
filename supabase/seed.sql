-- ════════════════════════════════════════════════════════════════════
--  WRONGE — starter data. Run AFTER schema.sql. Safe to re-run.
--  Panel images point to /public/seed until "npm run images:upload"
--  moves them to Cloudinary and updates these rows automatically.
-- ════════════════════════════════════════════════════════════════════

insert into public.store_settings (id, jacket_price, pack_price, pack_size, bundle_discount,
  delivery_inside_dhaka, delivery_outside_dhaka, announcement, size_chart)
values (1, 5000, 1000, 3, 0, 80, 150, 'Cash on delivery all over Bangladesh',
  '[
    {"size":"XS","chest":"21","length":"24.5","sleeve":"23","fit":"Cropped & close"},
    {"size":"S","chest":"22","length":"25","sleeve":"23.5","fit":"Relaxed"},
    {"size":"M","chest":"23","length":"25.5","sleeve":"24","fit":"Relaxed, boxy"},
    {"size":"L","chest":"24","length":"26","sleeve":"24.5","fit":"Boxy"},
    {"size":"XL","chest":"25","length":"26.5","sleeve":"25","fit":"Roomy layering"},
    {"size":"XXL","chest":"26","length":"27","sleeve":"25.5","fit":"Extra roomy"}
  ]'::jsonb)
on conflict (id) do nothing;

insert into public.jacket_sizes (size, sort_order, stock, is_active) values
  ('XS', 1, 10, true),
  ('S',  2, 20, true),
  ('M',  3, 25, true),
  ('L',  4, 25, true),
  ('XL', 5, 20, true),
  ('XXL',6, 10, true)
on conflict (size) do nothing;

insert into public.panels (slug, name, category, badge, is_featured, sort_order, description, image_url) values
  ('have-we-been-cursed','Have We Been Cursed?','Night & Moon','NEW',true,1,'A black cat and a crow share a branch under a sour yellow moon. Painterly, moody, a little bit ominous.','/seed/panels/have-we-been-cursed.webp'),
  ('sakura-moon','Sakura Moon','Night & Moon','TRENDING',true,2,'Cherry blossoms spill across a harvest moon above old clay rooftops. Textured, warm and quietly loud.','/seed/panels/sakura-moon.webp'),
  ('lighthouse-lullaby','Lighthouse Lullaby','Night & Moon',null,false,3,'A lighthouse keeps watch under a sky full of stars, framed in a folk-art border.','/seed/panels/lighthouse-lullaby.webp'),
  ('solitude','Solitude','Art & Grunge','TRENDING',true,4,'Editorial collage: a stippled skull growing flowers. In solitude we meet ourselves.','/seed/panels/solitude.webp'),
  ('creation-in-bloom','Creation in Bloom','Art & Grunge',null,false,5,'Two reaching hands meet over a field of almond blossom. Two classics, one panel.','/seed/panels/creation-in-bloom.webp'),
  ('curzon-hall','Curzon Hall','Campus Pride','NEW',true,6,'Dhaka''s red-brick landmark in a sun-washed retro poster style.','/seed/panels/curzon-hall.webp'),
  ('jahangirnagar','Jahangirnagar','Campus Pride',null,false,7,'A loud, colourful love letter to JU — monuments, buses and Bangla type.','/seed/panels/jahangirnagar.webp'),
  ('diu-campus','DIU Campus','Campus Pride',null,false,8,'A green-toned architectural poster of the Daffodil campus.','/seed/panels/diu-campus.webp'),
  ('keep-it-classic','Keep It Classic','Retro & Pop',null,true,9,'A hand drops the needle on a worn vinyl. Distressed, red and timeless.','/seed/panels/keep-it-classic.webp'),
  ('city-of-stars','City of Stars','Retro & Pop',null,false,10,'Two dancers, one street lamp and a row of piano keys under a deep blue sky.','/seed/panels/city-of-stars.webp'),
  ('rouge-bloom','Rouge Bloom','Floral',null,true,11,'Fine-line roses inside an ornate crimson frame — tattoo-flash energy.','/seed/panels/rouge-bloom.webp'),
  ('sunflower-print','Sunflower Print','Floral',null,false,12,'A bold linocut sunflower in yellow and cobalt, with real block-print texture.','/seed/panels/sunflower-print.webp'),
  ('wild-roses','Wild Roses','Floral',null,false,13,'Deep red roses and soft leaves on raw linen. Quiet and romantic.','/seed/panels/wild-roses.webp'),
  ('campfire-night','Campfire Night','Nature & Cosmos',null,true,14,'A tent wrapped in flame under smoky clouds and a dark pine forest.','/seed/panels/campfire-night.webp'),
  ('orbit','Orbit','Nature & Cosmos','NEW',false,15,'Hand-etched planets drifting on black. Minimal from far, detailed up close.','/seed/panels/orbit.webp')
on conflict (slug) do nothing;
