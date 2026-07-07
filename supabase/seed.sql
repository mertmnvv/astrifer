insert into templates (slug, name, category, description, default_message, sort_order) values
  ('dogum', 'Doğum', 'dogum', 'Bir hayatın başladığı anın gökyüzü.', 'Sen doğduğunda gökyüzü tam olarak böyleydi.', 1),
  ('yildonumu', 'Yıldönümü', 'yildonumu', 'Birlikte geçirdiğiniz o özel anın haritası.', 'O gece gökyüzü buydu.', 2),
  ('teklif', 'Evlilik Teklifi', 'teklif', 'Evet dediği anın gökyüzü.', 'Bana evet dediğin an, gökyüzü buydu.', 3),
  ('mezuniyet', 'Mezuniyet', 'mezuniyet', 'Bir başarının kutlandığı anın haritası.', 'Bu anın gökyüzü, senin başarının izi.', 4),
  ('anma', 'Anma', 'anma', 'Anılmaya değer bir anın gökyüzü.', 'Seni sonsuza dek bu gökyüzünde taşıyoruz.', 5)
on conflict (slug) do nothing;
