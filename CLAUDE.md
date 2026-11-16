# CLAUDE.md — Minigolf (çalışma adı)

Bu depoda çalışan her oturum önce bu dosyayı, sonra `docs/tasarim-belgesi.md`
ve `docs/yol-haritasi.md`'yi okur. Tasarım belgesi oyunun tek kaynağıdır.

Oyunun çalışma adı: depo adı "minigolf", KKM'deki başlığı "Mini Golf Düzada".
Yayın adı [Kemal].

## Kim için

Kemal. Kodlama deneyimi yok. Açıklamalar Türkçe, sade, teknik terimsiz;
kodu değil ekranda ne değiştiğini anlat. Kod içindeki adlar ve yorumlar Türkçe.

## Kim yazar

Kems Ajans'ın oyun departmanı (Oyun Tasarımcısı, Oyun Geliştiricisi). Her değişiklik
**ayrı dalda** (`ajans/<kısa-konu>`) ve öneri PR'ı ile gelir; ana dala Kemal
birleştirir. Ana dala yazılmaz, zorla gönderilmez. PR açıklaması Türkçe: ekranda ne
değişti, telefonda nasıl denenir, Kemal'in yapacağı bir şey var mı. Denenmeyen iş
"denenmedi" diye yazılır; her PR'a telefon boyutunda ekran görüntüsü eklenir.

## Kesin kurallar

- Kurgu metni, ad, slogan, logo yazılmaz; oyun, tur, delik, karakter adları Kemal'in.
  Gerekirse `[Kemal]` diye boş bırakılır; yer tutucu yazı `[YER TUTUCU: …]` diye işaretlenir.
- Uydurma sayı yok. Delik ölçüsü, vuruş sınırı, süre, fiyat, reklam sıklığı gibi değerler
  Kemal onaylayınca girer. Denemek için konan onaysız değer kodda `DENEME` diye işaretlenir.
- Düzada bilgisi yalnız KKM'deki `docs/03-duzada-kunyesi.md`'den alınır; orada yazmayan
  bilgi uydurulmaz. Yazım Kemsköy (ö), Düzada (ü). Tek istisna oyunun adı: The Imperial Kemskoy.
- Başka minigolf oyununun görseli, adı, sahası, deliği kopyalanmaz; yalnız oyun türü örnektir.
- Ekrandaki her yazı `src/metinler/tr.json`'dan gelir, İngilizcesi `src/metinler/en.json`'da;
  koda gömülmez. Yeni yazı iki dosyaya birden eklenir (eksik ya da fazla anahtar olursa derleme
  hata verir).
- Ekran dikey, tek elle oynanır. Ekranlar dolu ve kompakt: boş delik kalmaz, ekrana yayılmaz.
- Renkler marka kitinden: lacivert `#0E1C4F`, krem `#F3EFE8`, kiremit `#F26B6F` (az). Yazı tipi Poppins.
- Web sürümü yalnız deneme: reklam ve satın alma yok.
- Her yeni model, ses, simge, yazı tipi, görsel `docs/lisanslar.md`'ye yazılır; kaynağı
  Kemal'e sorulmadan eklenmez. Modeller yalnız ücretsiz ve ticari kullanıma açık paketlerden.
- `npm run build` her iş sonunda hatasız geçer.
- Her PR `docs/yol-haritasi.md`'yi günceller.
- Kararı verilmemiş konu: sor, seçme. Açık sorular tasarım belgesinin 7. bölümünde.

## Teknik

Vite + React + TypeScript; 3B için Three.js ve React Three Fiber (Dondurmacı Kızlar'daki gibi).
Fizik kütüphanesi henüz yok; Oyun Geliştiricisi ilk delik denemesinde seçer.
`npm install`, sonra `npm run dev` (deneme), `npm run build` (derleme). Ana dala birleşince oyun
https://hkemal94.github.io/minigolf/ adresinde açılır (`.github/workflows/yayinla.yml`).

- `src/sahne/`: 3B saha, kamera, ışık, renkler.
- `src/metinler/`: Türkçe ve İngilizce yazılar.
- `docs/`: tasarım belgesi, yol haritası, lisanslar, ekran görüntüleri.
