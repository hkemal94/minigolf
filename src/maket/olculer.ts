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
  sahaBoyEnAz: 90, // taç çizgisi 90–120 m
  sahaEnEnAz: 45, // kale çizgisi 45–90 m
} as const;

// --- Gerçek minigolf pistleri: Dünya Minigolf Sporu Federasyonu (WMF) norm sistemleri.
// Sayılar Almanca Vikipedi "Bahnengolf" maddesinden (ÖBGV kural kitabı ve WMF kural kitabı 2.5'e
// dayanır; https://de.wikipedia.org/wiki/Bahnengolf, 18 Kasım 2026'da okundu). WMF'nin kendi
// sitesi (minigolfsport.com) bu oturumda açılamadı; sayı birincil kaynaktan doğrulanmadı.
export const WMF = {
  betonBoy: 12, // "Minigolf" (beton) pisti
  betonEn: 1.25,
  minyaturBoy: 6.25, // "Miniaturgolf" (eternit) pisti
  minyaturEn: 0.9,
  keceBoyEnAz: 9, // keçe pist 9–18 m, en 0,90
  keceBoyEnCok: 18,
  baslangicDairesi: 0.3, // beton pistte başlangıç işareti: 30 cm çaplı daire
  topCapEnAz: 0.037, // minigolf topu 37–43 mm (https://de.wikipedia.org/wiki/Minigolf)
  topCapEnCok: 0.043,
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
  // Tribün basamakları (iki tribünde aynı): derinlik ve yükseklik
  basamakDerinlik: 0.85,
  basamakYukseklik: 0.42,
  tahtaEn: 0.4, // basamağın üstündeki oturma tahtası
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
  topBuyutme: 4, // top telefonda görünsün diye gerçeğinin 4 katı çizilir (gerçek top 2 piksel kalıyor)
  delikCap: 0.3, // gerçek minigolf deliğinin ölçüsü doğrulanamadı; topla birlikte büyütüldü
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
} as const;

export const TOP_YARICAP = (WMF.topCapEnCok / 2) * DENEME.topBuyutme;
