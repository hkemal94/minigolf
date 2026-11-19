// OYNANABİLİR PROTOTİP · ayarlar. Buradaki her değer DENEME'dir: kaynağı olsa da oyundaki seçimi
// Kemal onaylamadı; telefonda denendikten sonra Kemal karar verir (tasarım belgesi 6.4).
// Gerçek ölçüler (top 42,67 mm, delik 108 mm) src/maket/olculer.ts'ten gelir, burada tekrar edilmez.

// --- Fizik
export const FIZIK = {
  // Yerçekimi: 9,81 m/s² (gerçek; DENEME değil).
  yercekimi: 9.81,
  // Hesap adımı (saniye). Top en hızlı hâlinde bir adımda yarıçapından az yol alır; duvardan geçemez.
  adim: 1 / 480,
  // DENEME · Çimde yuvarlanan topun yavaşlaması (m/s²). Orta hızda bir golf yeşili: Stimpmeter topu
  // 1,83 m/s ile bırakır, top 10 fit (3,05 m) giderse yavaşlama 1,83² / (2 × 3,05) = 0,55
  // (İngilizce Vikipedi "Stimpmeter", 19 Kasım 2026'da okundu; "10 fit" seçimi DENEME).
  cimYavaslama: 0.55,
  // DENEME · Beton basamakta yavaşlama (m/s²); kaynağı yok.
  betonYavaslama: 0.4,
  // DENEME · Sekme katsayıları (çarpmadan sonra kalan hızın oranı); kaynağı yok.
  bordurSekme: 0.72,
  direkSekme: 0.6,
  esyaSekme: 0.5, // huni, koltuk
  agSekme: 0.1, // kale ağı topu yumuşak durdurur
  cimZeminSekme: 0.25, // düşen topun çimden sekmesi
  betonZeminSekme: 0.4, // düşen topun betondan sekmesi
  delikKenarSekme: 0.3,
  delikTabanSekme: 0.15,
  // DENEME · Duvara sürtünme (çarpma anında yana kayışı keser); kaynağı yok.
  duvarSurtunme: 0.12,
  // Bundan yavaş çarpmada top sekmez (titreme olmasın); m/s.
  sekmeEsigi: 0.25,
  // Bir vuruş en çok bu kadar sürer (saniye); top bir yerde sıkışıp titrerse oyun kilitlenmesin diye durdurulur.
  enUzunVurus: 30,
  // Top bu hızın altında bu kadar süre kalırsa durmuş sayılır.
  durmaHizi: 0.02,
  durmaSuresi: 0.2,
  // Golf deliğinin derinliği en az 4 inç = 101,6 mm (R&A ve USGA Golf Kuralları, tanım "Hole";
  // bu oturumda kaynaktan okunmadı, DENEME).
  delikDerinlik: 0.1016,
  // DENEME · Fizik için kale ağının kalınlığı (m).
  agKalinlik: 0.05,
} as const;

// --- Vuruş
export const VURUS = {
  // DENEME · En güçlü vuruşta topun hızı (m/s): güç sınırı. 19 Kasım (Kemal: "top çok yavaş"; en uzun delik
  // rahatça %60–70 güçle oynansın): 5'ten 8,5'e çıktı. En uzun delik (3; 13,4 m) tarifteki yolla gücün
  // yaklaşık %61–69'unu ister (tek vuruşta deliğe giren hızlar 4,1–4,85 m/s; scripts/oyna-bot.mjs hesabı).
  // Bir hesap adımında top en çok 8,5 / 480 = 1,8 cm gider; yarıçapından (2,13 cm) az, duvardan geçemez.
  enCokHiz: 8.5,
  // DENEME · Gücün dolduğu çekme boyu (ekran pikseli).
  enCokCekme: 150,
  // DENEME · Bundan kısa çekme vuruş sayılmaz (iptal).
  enAzCekme: 14,
  // DENEME · Güç eğrisi: hız = enCokHiz × (çekme / enCokCekme) ^ us. 1'den büyük: kısa vuruş daha ince ayarlanır.
  us: 1.5,
  // DENEME · Topa dokunma payı (ekran pikseli): parmak topun bu kadar yakınına değerse vuruş başlar.
  dokunmaPayi: 44,
  // DENEME · Nişan okunun boyu (m): en az ve en çok güçte.
  okEnAz: 0.25,
  okEnCok: 1.4,
} as const;

// --- Kamera (eğik yukarıdan, izometrik; topu izler). 19 Kasım (Kemal): topun çevresinde tam tur, yukarı aşağı
// eğme, vuruştan sonra topu izleme, "Deliğe bak" düğmesi; iki parmakla yakınlaştırma kalır.
export const KAMERA = {
  // DENEME · Yakınlık: ekranın bir pikseline düşen yer. 200: ekranın eni yaklaşık 1,95 m (maketteki uzaklık).
  yakinlik: 200,
  enUzak: 55,
  enYakin: 420,
  // Kameranın başlangıçta yerden açısı (maketteki bakış: 17 m yukarı, 13,4 m geri; yaklaşık 52°).
  egim: Math.atan2(17, 13.4),
  // DENEME · Eğmenin sınırları (derece → radyan). En az 20°: kamera yere yatmaz, yerin altına inmez.
  // En çok 80°: tam tepeden (90°) bakılmaz, yön duygusu kaybolmasın.
  enAzEgim: (20 * Math.PI) / 180,
  enCokEgim: (80 * Math.PI) / 180,
  // DENEME · Tek parmakla çevirme ve eğme hızı (radyan / ekran pikseli). Sağa sola sürüklemek çevirir
  // (sınırsız, tam tur), yukarı aşağı sürüklemek eğer. 0,012: yaklaşık 520 piksel sürükleme bir tam tur.
  cevirHizi: 0.012,
  egimHizi: 0.006,
  uzaklik: 22,
  // DENEME · Top ekranın ortasından bu kadar aşağıda durur (ekran boyunun oranı): önü görünsün, çekmeye yer kalsın.
  topAsagi: 0.12,
  // DENEME · Kameranın topu izleme yumuşaklığı (büyük: daha çabuk).
  izleme: 6,
  // DENEME · Vuruştan sonra, top durana kadar: kamera topu daha sıkı izler ve yavaşça topun gittiği yöne döner
  // (topun arkasından bakar). Oyuncu bu sırada kamerayı elle çevirirse izleme o vuruş için bırakılır.
  takipIzleme: 12,
  takipDonme: 1.2, // dönme hızı (büyük: daha çabuk); top yavaşladıkça azalır
  takipHizi: 2, // top bu hızdan (m/s) hızlıyken tam hızla döner, yavaşken orantılı
  // DENEME · "Deliğe bak" düğmesinde dönüşün yumuşaklığı (büyük: daha çabuk).
  delikBakisi: 8,
} as const;

// --- Oyuncu ayarları (oyundaki küçük ayar menüsü)
export const OYUNCU = {
  // DENEME · Kolay mod: çekerken topun duracağı yer gösterilir (aynı fizikle, sekmeler dahil). Kemal
  // 19 Kasım'da istedi; başta açık mı kapalı mı Kemal'in kararı. Şimdilik açık.
  kolayMod: true,
} as const;

// --- Kural
export const KURAL = {
  // Karar (Kemal, 19 Kasım 2026): top dışarı çıkarsa (saha dışı, taç, su) son vuruşun yerine döner;
  // o vuruş sayılır, üstüne 1 ceza vuruşu eklenir (sayaç 2 artar).
  disariCeza: 1,
} as const;

// --- Görüntü (fizikle ilgisi yok)
export const GORUNTU = {
  huniBoy: 0.3, // DENEME · antrenman hunisinin boyu (maketteki gibi)
  direkBoy: 2.44, // kale direği (IFAB)
  // Saha çizgileri modelde çimden 1 cm yüksek; top çizginin içine gömülmesin diye çimde bu kadar yukarıda çizilir.
  cimKaldirma: 0.011,
  // DENEME · Kale filesinin göz aralığı (m). Model filesi oyunda çizilmez; yerine ince çizgilerle file ağı
  // (fizikteki yan ağlar ve arka ağ). Kaynağı yok; gerçek file sonraki adımda.
  fileGoz: 0.12,
  // Modeldeki arka filenin boyu (m; dirlik-stadi.glb).
  fileArkaBoy: 1.7,
} as const;
