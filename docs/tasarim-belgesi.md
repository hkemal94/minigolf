# Minigolf · Tasarım belgesi

> **TASLAK.** Bu belge oyunun tek kaynağıdır. "Karar" başlığı altındakiler Kemal'in verdiği
> kararlardır; "Öneri (Kemal onaylamadı)" yazan her şey seçenektir, karar değildir. Karar
> değişirse önce bu belge, sonra kod değişir.

**Proje:** Minigolf (Kems Company). Çalışma adı: depo "minigolf", KKM'de "Mini Golf Düzada".
Yayın adı: [Kemal]
**Depo:** `hkemal94/minigolf`
**Yol haritası:** `docs/yol-haritasi.md`
**Yazan:** Oyun Tasarımcısı (fikir belgesi, 15 Kasım 2026); depoya Oyun Geliştiricisi taşıdı
(16 Kasım 2026). Onay Kemal'in.

Kaynak: Kems Ajans'taki fikir belgesi (`oneriler/minigolf-fikir-belgesi-15-11-2026.md`, Kemal'in
15 ve 16 Kasım cevapları işli) ve Kemal'in 16 Kasım ek kararları. Düzada bilgisi yalnız KKM'deki
`docs/03-duzada-kunyesi.md`'den.

Okuma kuralı: "[Kemal]" Kemal'in dolduracağı boş alandır. Ad, slogan, kurgu metni yok. Delik
ölçüsü, vuruş sınırı, süre, fiyat, reklam sıklığı sayısı yok: "veri yok". Denemek için konan
onaysız değer "DENEME" diye işaretlenir.

## Kararların geçmişi

En yeni üstte.

- **16 Kasım (ek kararlar, kesin):** Turlar lokasyon bazlı, her tur 18 delik. İlk tur yalnız stat
  kompleksi (Dirlik Stadı). Pist gerçek minigolf pisti, yerin eşyaları çevrede ve engel olarak.
  Engel türleri ve sırası, zorluk eğrisi, ortam ve görsel dil (ayrıntı 3. bölümde).
- **16 Kasım:** Bütün ada değil; önce basit bir yerle (Stadyum) başlanır, plan çizilir, delik
  delik denenir. Imperial'deki uzun tur sonra. Ayın görevi: ayın turunu bitirmek; ay takvim ayı,
  geçen ayın turu sonradan bitirilebilir.
- **15 Kasım:** Fikir belgesindeki 7 soru cevaplandı (kamera, ekran yönü, Düzada bağı, vuruş
  sınırı, delikler, yardımcılar, para modeli). Ödül: ortak pul koleksiyonu.

## 1. Oyun bir cümlede

Düzada'nın yerlerine kurulmuş gerçek minigolf pistlerinde, topu tek parmakla çekip bırakarak
deliğe sokulan, sakin ve cezasız bir telefon minigolf oyunu.

**Karar (Kemal, 15 Kasım):** telefon önce, dikey, tek elle. Web deneme sürümü önce, telefon
uygulaması sonra.

**Öneri (Kemal onaylamadı):** sakin, cezasız: kaybetme yok, "oyun bitti" yok. Ekran dolu ve
kompakt (öbür oyunlardan taşınan tercih).

## 2. Oynanış

**Karar (Kemal, 15 Kasım):**
- Kamera: eğik yukarıdan 3B (izometrik), delik tek ekranda.
- Ekran yönü: dikey, tek elle.
- Delik başına vuruş sınırı: sonra; web denemesinden sonra Kemal karar verir.
- İlk sürümdeki yardımcılar: nişan çizgisi, geri al vuruş, kaldığı yerden devam.

**Öneri (Kemal onaylamadı):**
- Vuruş: oyuncu topa dokunur, parmağını geri çeker (ne kadar çekerse o kadar güçlü), bırakınca
  top atılır. Çekerken topun önünde ince bir nişan çizgisi çıkar. Delik başına vuruş sayılır.
- İki parmakla döndürme ve yakınlaştırma.
- Low-poly minyatür görünüm; tasarım dili (ölçü, palet, mat yüzey) Dondurmacı Kızlar'daki örnekten.

## 3. Turlar, delikler ve engeller

**Karar (Kemal, 15–16 Kasım):**
- Turlar Düzada'nın yerlerinde geçer; oyuncu bir yerin farklı bölümlerinde adım adım ilerler,
  sanki oralara gerçek minigolf parkurları kurulmuş gibi.
- Delikler mahalle değil **lokasyon** bazlı: her lokasyon bir tur, **her tur 18 delik**. Aynı
  mahallede başka bir lokasyon ayrı bir 18 delikli tur olabilir.
- **İlk tur yalnız stat kompleksi (Dirlik Stadı):** çim, tribün, tünel, soyunma odası vb.
  Taraftar Birahanesi ve Kuzey Plajı bu turda yok. Önce bir plan çizilir, delik delik denenir.
- Stat yukarıdadır, denize yakın değildir; deniz en çok uzakta, ufukta görünür.
- Pist gerçek bir minigolf pistidir; yerin eşyaları pistin çevresinde ve engel olarak durur.
- Engeller: yerin eşyaları; klasik engeller (tünel, rampa, köprü); su ve kum tuzakları;
  hareketli engeller. Hareketli engeller en son gelir.
- Zorluk delikten deliğe ve turdan tura değişken; düz artış değil.
- Ortam: maçsız, sakin bir gün.
- Imperial'deki uzun tur sonra; otelin planları (The Imperial Kemskoy deposu ve künye; otel 1954
  yapımı) kullanılır, plan dışı yer uydurulmaz.
- Görsel dil: İllüstratör 2–3 deneme hazırlar (sonra).

**DENEME:** tur süresi kısa delikler üzerine kurulur; delik ölçüsü ve süre sayısı yok, ilk
denemede konan değerler "DENEME" diye işaretlenir.

**Öneri (Kemal onaylamadı) · sonraki tur adayları** (yalnız künyede adı ya da tarifi geçen yerler):
- Liman Mahallesi: Deniz Feneri / Fener Burnu, Liman ve mendirek, Dondurmacı Kızlar.
- İskele Mahallesi / Kemsköy: The Imperial Kemsköy ve Sahil Merdiveni, Kemsköy Caddesi, Sade
  Meyhane, Güney Burnu.
- Merkez Mahallesi: Meydan (taş çeşme, çınar).
- Stadyum Mahallesi: Kuzey Plajı (ilk turda değil).
- Çiftlik Mahallesi: Küçükçetmi Çiftliği.
- Ada: Ada Tepesi (antik duvarlar Kemal'e sorulmadan kullanılmaz), Sahil Yolu.
- Kullanılmaması önerilen: ibadet ve mezar yerleri.

Her yerin görselinden ve planından önce künyede ve vikide yeri, rakımı, çevresi yeniden okunur.

## 4. İlk oynanabilir sürüm

**Öneri (Kemal onaylamadı):**
- Tek parmak vuruş ve nişan çizgisi.
- Stadyum turunun delikleri, plandan sırayla; ilk deneme tek delikle.
- Delik sonu: kısa sonuç (vuruş sayısı), "sonraki delik" ve "yeniden".
- Tur sonu: bütün deliklerin vuruşları; ceza yok, "kaybettin" yok.
- Ses: top, delik, hafif ortam sesi; ayrı kısılır.
- Türkçe ve İngilizce metin dosyaları.
- Web deneme sürümü: Kemal ve yakın çevresi bağlantıyla dener; reklam ve satın alma yok.
- İlk sürümde değil: reklam, satın alma, çok oyunculu, mevsim ve saat değişimi.

## 5. Teknoloji

**Öneri (Kemal onaylamadı):**
- Vite + React + TypeScript; 3B için Three.js ve React Three Fiber (Dondurmacı Kızlar gibi).
  İskelet bu öneriyle kuruldu (16 Kasım).
- Fizik: hazır bir fizik kütüphanesi (ör. Rapier); Oyun Geliştiricisi ilk delik denemesinde seçer.
- Telefon uygulaması sonra; paketleme öbür oyunlardaki gibi Capacitor.
- Modeller yalnız ücretsiz ve ticari kullanıma açık paketlerden; her biri `docs/lisanslar.md`'ye.
  Ortak 3B bina modelleri uygun yerde kullanılır.
- Başka minigolf oyununun görseli, adı, sahası kopyalanmaz; yalnız tür örnektir.

## 6. Para modeli

**Karar (Kemal, 15 Kasım):** yalnız telefon uygulamasında; kart oyunu gibi: ipucu gibi yardımcılar
reklamla, birkaç delikte bir seyrek reklam, reklamsız paket. Sıklık ve fiyat [Kemal]. Web
denemesinde reklam ve satın alma yok.

## 7. Açık sorular

Kemal'e şu an Stadyum soru turu gidiyor; cevaplar gelince bu bölüme ve ilgili bölümlere işlenecek.

- Oyunun yayın adı: [Kemal].
- Stadyum turunun 18 deliği: hangi bölüm hangi delik, sırası (delik planı, Oyun Tasarımcısı
  hazırlıyor).
- Delik ölçüsü, delik başına süre (şimdilik "kısa", DENEME).
- Delik başına vuruş sınırı (web denemesinden sonra).
- Görsel dil (İllüstratör'ün 2–3 denemesinden sonra).
- Ayın turunun içeriği (hangi delikler; oyun yapılırken sorulur).
- Sonraki turların sırası ve Imperial uzun turunun zamanı.

## 8. Ödül: pul koleksiyonu

**Karar (Kemal, 15 Kasım):** minigolfün ödül sistemi bütün oyunların ortak pul koleksiyonudur: her
ay bir pul, çeyrekte üç pul toplanınca büyük 4. pul ("3+1"), her pul ayrı tasarım ve yazısız,
ortak koleksiyon sayfası. Ayın pulu o ayın görevi bitince gelir.

## 9. Ayın görevi

**Karar (Kemal, 16 Kasım):** ayın büyük görevi ayın turunu baştan sona bitirmek. Ayın pulu tur
bitince gelir. Ay takvim ayına bağlıdır; geçen ayın turu sonradan bitirilebilir. Turun içeriği
(hangi delikler) oyun yapılırken sorulur.
