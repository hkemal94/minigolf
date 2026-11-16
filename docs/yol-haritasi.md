# Minigolf · Yol haritası

> **TASLAK · Kemal onaylamadı.** Sıra tasarım belgesindeki kararlardan
> (`docs/tasarim-belgesi.md`). Tarih ve süre yazılmadı (veri yok). Her adım küçük, tek PR'la gelir;
> her adımın sonunda Kemal'in telefonda açıp deneyebileceği bir şey olur. Kemal "şimdi" derse bir
> adım öne geçer.

## Neredeyiz

- 16 Kasım 2026 (PR #1, birleşti): iskelet. Dikey tek ekran: üstte ince şerit (oyunun adı
  yer tutucu, "Deneme sürümü"), ortada eğik yukarıdan bakan kamerayla boş, düz bir saha ve yer
  tutucu bir top. Fizik ve vuruş yok. Türkçe ve İngilizce yazı dosyaları, deneme bağlantısı için
  yayın iş akışı. Bilgisayarda telefon boyutunda denendi; gerçek telefonda denenmedi.
- 16 Kasım 2026 (öneri; `ajans/stadyum-plani`): kapsamlı tasarım belgesi, Stadyum turunun 18 delikli
  planı ve şeması (`docs/plan/`), altı ekran maketi (`?maket=…`; ana ekran, tur seçimi, delik, atış,
  skor kartı, tur sonu; görüntüleri `docs/ekranlar/`). Maketler öneri, oynanış değil. 3B Dirlik Stadı
  modeli maketlerde; kaynağı ve lisansı Kemal'e soruldu. Gerçek telefonda denenmedi.

## Sıradaki

1. **Kemal'in kararları:** delik planı ve maketler onaylanır ya da düzeltilir; tasarım belgesinin 7.
   bölümündeki sorular (tünel ve soyunma odasının yeri, köşe yapısı, 3B modelin lisansı, genel stat
   bölümleri, turun başı ve sonu, geri al, oyuncu, ayın turu).
2. **Tünel ve soyunma odası** modele eklenir (yerini Kemal seçtikten sonra; 3B iş).
3. **İlk delik denemesi:** plandaki 1. delik (orta yuvarlak); fizik kütüphanesi seçilir, tek parmak
   vuruş ve nişan çizgisi, geri al, delik sonu. Ölçüler DENEME. Maketteki ekranlar onaylanınca oyuna
   taşınır.
4. Sonraki delikler, delik delik; her biri Kemal denedikten sonra; hareketliler en son.

## Sona kalanlar

- Hareketli engeller (engeller içinde en son).
- Görsel dil: İllüstratör 2–3 deneme.
- Ayın turu ve pul (takvim ayı; geçen ayın turu sonradan bitirilebilir).
- Imperial uzun turu.
- Telefon uygulaması; reklam ve reklamsız paket yalnız orada.

## Bitenler

- İskelet (16 Kasım, PR #1 birleşti).
