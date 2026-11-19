# Lisanslar ve kaynaklar

Oyunda kullanılan hazır model, ses, simge, yazı tipi ve görseller. Her yeni kaynak eklenince
buraya yazılır; kaynağı Kemal'e sorulmadan eklenmez. Modeller yalnız ücretsiz ve ticari
kullanıma açık paketlerden.

| Ne | Nerede | Kaynak | Lisans |
|---|---|---|---|
| Poppins yazı tipi (400 ve 600) | bütün ekranlar | `@fontsource/poppins` paketi (https://fontsource.org/fonts/poppins) | SIL Open Font License 1.1 |
| 3B Dirlik Stadı modeli (`public/modeller/dirlik-stadi.glb`) | ekran maketleri ve oyunun kendisi (Stadyum turunun temeli) | Kems Ajans yaptı (Blender), Kemal 16 Kasım'da kullanımını onayladı; kaynak Kems-Ajans `assetler/3b/binalar/dirlik-stadi.glb` (19 Kasım güncellemeleri: saha işaretleri ve çim düzeyi modelde düzeltildi; kulüp binası açık tribün köşesine taşındı, sundurma ve taş duvarda sokak kapısı eklendi, Kems-Ajans PR #182, kaynak commit c95cf4f) | Kemal'in onayı (16 Kasım) |

Saha, bordür, top, tribün koltukları, duş odası (karosu dahil), köprü, antrenman hunisi, sulama başlığı, baraj
mankeni ve maketlerdeki simgeler kodla çiziliyor (eşyaların üstünde yazı, logo yok; ölçü kaynakları tasarım belgesi 4.8'de);
yeni dış model eklenmedi. Ses ve hazır görsel henüz yok. 3B stat modeli
oyunda kullanılabilir (Kemal, 16 Kasım); tünel ve soyunma odası modelde yok, eklenecek.

Yazılım kütüphaneleri (React, Three.js, React Three Fiber, Vite, TypeScript) MIT ve Apache 2.0
lisanslıdır; oyunun içinde görünmezler.
