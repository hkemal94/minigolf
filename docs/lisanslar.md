# Lisanslar ve kaynaklar

Oyunda kullanılan hazır model, ses, simge, yazı tipi ve görseller. Her yeni kaynak eklenince
buraya yazılır; kaynağı Kemal'e sorulmadan eklenmez. Modeller yalnız ücretsiz ve ticari
kullanıma açık paketlerden.

| Ne | Nerede | Kaynak | Lisans |
|---|---|---|---|
| Poppins yazı tipi (400 ve 600) | bütün ekranlar | `@fontsource/poppins` paketi (https://fontsource.org/fonts/poppins) | SIL Open Font License 1.1 |
| 3B Dirlik Stadı modeli (`public/modeller/dirlik-stadi.glb`) | ekran maketleri ve oyunun kendisi (Stadyum turunun temeli) | Kems Ajans yaptı (Blender), Kemal 16 Kasım'da kullanımını onayladı; kaynak Kems-Ajans `assetler/3b/binalar/dirlik-stadi.glb` (19 Kasım güncellemeleri: saha işaretleri ve çim düzeyi modelde düzeltildi; kulüp binası açık tribün köşesine taşındı, sundurma ve taş duvarda sokak kapısı eklendi, Kems-Ajans PR #182, kaynak commit c95cf4f) | Kemal'in onayı (16 Kasım) |

## Dokular (oynanabilir prototip, `public/dokular/`)

Karar (Kemal, 19 Kasım 2026): doku kaynağı yalnız **Poly Haven** (polyhaven.com) ve **ambientCG** (ambientcg.com); ikisi de
CC0 (kamu malı; ticari kullanım serbest, ad yazma zorunluluğu yok). Hepsi 19 Kasım 2026'da 1K JPG olarak indirildi;
oyuna WebP olarak küçültülüp kondu (`scripts/dokulari-hazirla.py`). Her dokudan iki dosya var: renk ve kabartı (normal).

| Doku (dosya) | Nerede | Kaynak | Site | Lisans | İndirme tarihi | Oyundaki hâli |
|---|---|---|---|---|---|---|
| Grass 001 (`cim-renk.webp`, `cim-normal.webp`) | sahanın çimi | https://ambientcg.com/a/Grass001 | ambientCG | CC0 1.0 | 19 Kasım 2026 | renk 1024, kabartı 512 piksel; rengin kontrastı azaltıldı |
| Dirt Floor (`toprak-…`) | toprak zemin (saha çevresi, toprak yol) | https://polyhaven.com/a/dirt_floor | Poly Haven | CC0 1.0 | 19 Kasım 2026 | renk 1024, kabartı 512 |
| Concrete Floor 02 (`beton-…`) | beton (tribün basamakları, badana); bordürde yalnız kabartısı | https://polyhaven.com/a/concrete_floor_02 | Poly Haven | CC0 1.0 | 19 Kasım 2026 | renk 1024, kabartı 512; rengin kontrastı azaltıldı |
| Yellow Stone Wall (`tas-…`) | taş duvar | https://polyhaven.com/a/yellow_stone_wall | Poly Haven | CC0 1.0 | 19 Kasım 2026 | renk 512, kabartı 512 |
| Wood Planks (`ahsap-…`) | ahşap (modelde ahşap olan yerler) | https://polyhaven.com/a/wood_planks | Poly Haven | CC0 1.0 | 19 Kasım 2026 | renk 512, kabartı 512 |

On dosya, toplam 0,77 MB. Dokunun rengi modelin kendi rengine göre ayarlanır (çim şeritleri ve taş tonları modeldeki
gibi kalır). Golf topunun gamzeleri, kale filesinin ağı ve toptaki gök yansıması indirilmiş dosya değil; kodla
hesaplanır (`src/oyun/dokular.ts`).

Ortam (maçsız gün; PR #12, 19 Kasım 2026): kuşlar ve uzaktaki insanlar hazır model değil, kodla çizilen düşük çokgenli
biçimler (`src/oyun/Ortam.tsx`); insanların yüzü, üstlerinde yazı ya da logo yok. Rüzgâr (ağaç, çim, bayrak) modelin kendi
malzemesinde hesaplanır. Yıldız ve rozet simgeleri kodla çizilen basit çizgiler (`src/oyun/Oyun.tsx`). Bu adımda yeni dış
model, doku, simge, ses ya da yazı tipi eklenmedi.

Saha, bordür, top, tribün koltukları, duş odası (karosu dahil), köprü, antrenman hunisi, sulama başlığı, baraj
mankeni ve maketlerdeki simgeler kodla çiziliyor (eşyaların üstünde yazı, logo yok; ölçü kaynakları tasarım belgesi 4.8'de);
yeni dış model eklenmedi. Ses yok; hazır görsel yalnız yukarıdaki dokular. 3B stat modeli
oyunda kullanılabilir (Kemal, 16 Kasım); tünel ve soyunma odası modelde yok, eklenecek.

Yazılım kütüphaneleri (React, Three.js, React Three Fiber, Vite, TypeScript) MIT ve Apache 2.0
lisanslıdır; oyunun içinde görünmezler.
