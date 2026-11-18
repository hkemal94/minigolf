// Örnek deliklerin ölçüleri (Kemal, 18 Kasım 2026: "pistler gerçek boyutlarda olsun").
// Birim metre; 3B Dirlik Stadı modeli de metreyle çizilmiş (1 birim = 1 m).
// Kaynağı olan sayı kaynağıyla yazıldı; kaynağı olmayan her değer DENEME (Kemal onaylamadı).

// --- Futbol sahası: IFAB Oyun Kuralları, Kural 1 "The Field of Play"
// (https://www.theifab.com/laws/latest/the-field-of-play/, 18 Kasım 2026'da okundu).
export const IFAB = {
  kaleGenislik: 7.32, // direklerin iç yüzleri arası
  kaleYukseklik: 2.44, // üst direğin alt kenarı
  direkEnCok: 0.12, // direk ve çizgi genişliği en çok
  kaleSahasi: 5.5, // direğin iç yüzünden yana ve sahanın içine
  cezaSahasi: 16.5,
  penaltiNoktasi: 11, // iki direğin ortasından
  ortaYuvarlakYaricap: 9.15,
  koseBayragiEnAz: 1.5, // yükseklik
  koseYayiYaricap: 1, // köşe bayrağından, sahanın içine çeyrek daire (18 Kasım 2026'da yeniden okundu)
  sahaBoyEnAz: 90, // taç çizgisi 90–120 m
  sahaEnEnAz: 45, // kale çizgisi 45–90 m
} as const;

// --- Gerçek minigolf pistleri: Dünya Minigolf Sporu Federasyonu (WMF) norm sistemleri.
// Beton pist: Avusturya federasyonu ÖBGV kural kitabı 2.3 "Minigolf (Concrete)" (WMF-2.4):
// boy 12,00 m, en 1,25 m, başlangıç işareti 30 cm çaplı daire
// (https://www.oebgv.at/uploads/pdf/regelwerk/OEBGV-Re-2.3.pdf, 18 Kasım 2026'da okundu).
// Minyatür ve keçe pist ile top çapı aralığı: Almanca Vikipedi "Bahnengolf" ve "Minigolf" maddeleri
// (ÖBGV ve WMF kural kitaplarına dayanır). WMF'nin kendi sitesi bu oturumda açılamadı.
export const WMF = {
  betonBoy: 12,
  betonEn: 1.25,
  minyaturBoy: 6.25, // "Miniaturgolf" (eternit) pisti
  minyaturEn: 0.9,
  keceBoyEnAz: 9, // keçe pist 9–18 m, en 0,90
  keceBoyEnCok: 18,
  baslangicDairesi: 0.3,
  topCapEnAz: 0.037, // minigolf topu 37–43 mm
  topCapEnCok: 0.043,
} as const;

// --- Top ve delik gerçek ölçüde (Kemal, 18 Kasım 2026: "top ve delik gerçek ölçü").
// Top: golf topunun çapı en az 1,680 inç = 42,67 mm (R&A ve USGA Ekipman Kuralları; İngilizce
// Vikipedi "Golf ball", 18 Kasım 2026'da okundu). WMF'nin 37–43 mm aralığının içinde.
// Delik: 10,8 cm. Karar (Kemal, 18 Kasım 2026). Golf deliğinin çapıyla aynı (4,25 inç = 108 mm).
export const GOLF = {
  topCap: 0.04267,
  delikCap: 0.108, // Kemal, 18 Kasım 2026
} as const;

// --- 3B Dirlik Stadı modelinden ölçülenler (public/modeller/dirlik-stadi.glb; Kems Ajans modeli).
// Model IFAB ölçüleriyle çizilmiş: saha 90 × 58, kale 7,32 × 2,44, kale sahası 5,5, ceza sahası 16,5.
export const MODEL = {
  sahaBoy: 90,
  sahaEn: 58,
  // A ucundaki kale (x = 0 kale çizgisi; ağ x = -2'ye kadar)
  kaleCizgisiX: 0,
  yakinDirekZ: -32.66,
  uzakDirekZ: -25.34,
  direkEn: 0.14, // modeldeki direk (IFAB en çok 0,12)
  agDerinlik: 2,
  kaleSahasiCizgisiZ: -38.09, // kale sahasının yan çizgisi (yakın direkten 5,5 m)
  // Saha çizgileri: en 0,14 (IFAB en çok 0,12). Dış çizgiler sahanın içinde kalır (taç çizgisi z -58 … -57,86).
  cizgiEn: 0.14,
  ortaYuvarlakCizgiEn: 0.28, // orta yuvarlak modelde 0,28 m'lik kesik parçalarla çizilmiş (öbür çizgilerden kalın)
  // Sahanın çimi çevredeki çimden 4 cm yüksek (şeritli çimin üstü 0,04; çizgilerin üstü 0,05; çevre çim 0).
  cimUstu: 0.04,
  cizgiUstu: 0.05,
  tacCizgisiZ: -58, // açık tribün yanındaki taç çizgisinin dış kenarı
  // Tribün basamakları (iki tribünde aynı): derinlik ve yükseklik
  basamakDerinlik: 0.85,
  basamakYukseklik: 0.42,
  tahtaEn: 0.4, // basamağın üstündeki oturma tahtası (makette yerine tek tek koltuk çizilir)
  tahtaKalinlik: 0.08,
  tahtaOndenBosluk: 0.1,
  // Açık tribün: x 28–62, ilk basamağın ön kenarı z = -63, altı basamak
  acikTribunOnZ: -63,
  acikTribunX0: 28,
  acikTribunX1: 62,
  acikTribunSira: 6,
  // Açık tribünün ortasındaki taş merdiven: x 44,4–45,6 (en 1,2 m), basamaktan 3 cm yüksek
  merdivenEn: 1.2,
} as const;
// Tribün basamağı için dış kaynak (standart) bu oturumda doğrulanamadı; ölçü modelin kendisinden.

// --- DENEME: kaynağı yok, Kemal onaylamadı.
export const DENEME = {
  bordurYukseklik: 0.08, // pist sınırı: ince, yükseltilmiş bordür
  bordurEn: 0.06,
  bayrakBoy: 0.9,
  // Duşlar (oda modelde yok; maket için kodla çizildi)
  dusEn: 2.7,
  dusBolmeBoy: 1.7,
  dusBolmeKalinlik: 0.08,
  dusGecit: 1.0,
  dusDuvarYukseklik: 1.1, // içi görünsün diye kesik
  dusBolmeYukseklik: 0.7, // arkası görünsün diye kesik
  karo: 0.3,
  birikintiYaricap: 0.38,
  // Tribün koltukları (modelde yok; makette kodla çizildi). Koltuğun derinliği modeldeki tahtanın eni.
  koltukEn: 0.43,
  koltukAralik: 0.45, // iki koltuğun ortası arası; arada top geçmez (2 cm)
  koltukSirt: 0.28,
  // Adım 1 (delik 1, 2, 4, 5; saha, çim). Hepsi kaynaksız, Kemal onaylamadı.
  baslangicPayi: 0.45, // başlangıç işaretinin arkasında kalan pist
  delikPayi: 0.3, // deliğin arkasında kalan pist
  ortaYuvarlakYayAcisi: 60, // 1. delik: pistin orta yuvarlak çizgisinde kapladığı yay (derece); boyu 9,58 m
  tacPayi: 1, // 2. delik: deliğin taç çizgisine uzaklığı
  kosePah: 0.8, // 4. delik: dış köşedeki 45° sektirme kenarının iki yana boyu
  koseDirekYaricap: 0.025, // köşe bayrağının direği (IFAB yalnız en az boyu verir)
  koseBayrakEn: 0.34,
  koseBayrakBoy: 0.26,
  penaltiNoktasiCap: 0.22, // IFAB noktanın çapını vermez
  // Atış işaretleri (yerde): güç halkası ve nişan çizgisi
  gucHalkasiIc: 0.085,
  gucHalkasiDis: 0.11,
  nisanKalinlik: 0.016,
} as const;

export const TOP_YARICAP = GOLF.topCap / 2;
