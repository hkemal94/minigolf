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
// Model 19 Kasım 2026'da düzeltildi (Kemal): sahanın çimi çevre çimle aynı düzeyde (basamak yok), orta yuvarlak
// sürekli çizgi, çizgi eni 0,12; köşe ve penaltı yayları, penaltı ve orta noktaları, köşe bayrakları modelde.
export const MODEL = {
  sahaBoy: 90,
  sahaEn: 58,
  // A ucundaki kale (x = 0 kale çizgisi; ağ x = -2'ye kadar)
  kaleCizgisiX: 0,
  yakinDirekZ: -32.66,
  uzakDirekZ: -25.34,
  direkEn: 0.14, // modeldeki direk (IFAB en çok 0,12)
  agDerinlik: 2,
  kaleSahasiCizgisiZ: -38.1, // kale sahasının yan çizgisinin ortası (yakın direkten 5,5 m; çizgi z -38,16 … -38,04)
  // Saha çizgileri: en 0,12 (IFAB en çok 0,12). Dış çizgiler sahanın içinde kalır (taç çizgisi z -58 … -57,88).
  cizgiEn: 0.12,
  ortaYuvarlakCizgiEn: 0.12, // orta yuvarlak sürekli çizgi, öbür çizgilerle aynı ende
  // Sahanın çimi çevredeki çimle aynı düzeyde (0). Çizgilerin üstü 0,01; yaylar 0,011; noktalar 0,012.
  cimUstu: 0,
  cizgiUstu: 0.01,
  yayUstu: 0.011,
  noktaUstu: 0.012,
  penaltiNoktasiCap: 0.22, // penaltı ve orta noktası (IFAB çap vermez)
  koseDirekEn: 0.04, // köşe bayrağının direği (boyu 1,5 m; IFAB en az 1,5)
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
  // --- Adım 2 (delik 6, 8, 9) için ölçülenler
  // Sahayı saran çimin açık tribün yanındaki kenarı (çim z -62'de biter; tribüne kadar 1 m toprak).
  cevreCimKenarZ: -62,
  // Açık tribünün önündeki demir korkuluk: tribün boyunca (x 28–62), her 2 m'de bir direk, üstte tek boru.
  // Direklerin arası boş: top borunun altından geçer, direğe çarpar.
  korkulukZ: -62.6,
  korkulukDirekAralik: 2,
  korkulukDirekEn: 0.08,
  korkulukYukseklik: 1,
  // Tribün merdivenleri (üç tane: x 28–29,2 · 44,4–45,6 · 60,8–62): ilk basamak tribünün ön kenarında, 0,24 m yüksek.
  merdivenIlkBasamak: 0.24,
  bMerdivenX0: 60.8, // B ucundaki merdivenin batı kenarı
  // Açık tribünün arka duvarı (z -68,4 … -68,1; üst sıradan 1,1 m yüksek) ve B ucundaki yan duvarı (x 62 … 62,3).
  arkaDuvarIcZ: -68.1,
  arkaDuvarDisZ: -68.4,
  arkaDuvarYukseklik: 3.62,
  yanDuvarX0: 62,
  yanDuvarX1: 62.3,
  yanDuvarYukseklik: 3.52,
  // Kompleksi saran taş duvar (açık tribünün arkasında): iç yüzü z -71,5, kalınlık 0,5 m.
  // Taşlar tek tek, boyları 2,2–2,5 m arasında değişir. Tribünle arasındaki toprak koridor 3,1 m.
  tasDuvarIcZ: -71.5,
  tasDuvarDisZ: -72,
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
  ortaYuvarlakYayAcisi: 45, // 1. delik: pistin orta yuvarlak çizgisinde kapladığı yay (derece); boyu 7,19 m
  tacPayi: 1, // 2. delik: deliğin taç çizgisine uzaklığı
  kosePah: 0.8, // 4. delik: dış köşedeki 45° sektirme kenarının iki yana boyu
  // Yerin eşyası olarak eklenenler: modelde ve künyede yok; DENEME, Kemal onaylamadı. Yazı, logo yok.
  // Kemal, 19 Kasım 2026: üçü de kalsın, gerçeğe yakın modellensin. Kaynağı olan ölçüler ESYA'da (aşağıda);
  // buradakilerin kaynağı bulunamadı.
  huniTaban: 0.2, // antrenman hunisinin kare tabanı (1. delik)
  huniUc: 0.03, // huninin kesik ucunun çapı
  sulamaYuva: 0.07, // sulama başlığının çevresindeki çimsiz yuvanın yarıçapı (2. delik)
  mankenEn: 0.5, // baraj mankeninin omuz eni (5. delik)
  mankenKalinlik: 0.05,
  mankenAralik: 0.55, // iki mankenin ortası arası
  mankenTaban: 0.4, // mankenin yuvarlak ayak tabanının çapı
  ovalYariEn: 1.25, // 5. delik: oval pistin yarı eni (iki pist eni)
  vurguKenarYukseklik: 0.16, // 4. delik: eğik sektirme kenarı öbür kenarın iki katı yüksek, üstü krem
  // Adım 2 (delik 6, 8, 9). Hepsi kaynaksız, Kemal onaylamadı.
  korkulukPistX: 41, // 6. delik: pistin tribüne inen kolunun yeri (40 ve 42 direklerinin ortası)
  kopruEn: 0.6, // 8. delik: köprünün eni (yeri karar: Kemal; biçimi ve ölçüsü DENEME)
  kopruKalinlik: 0.1,
  kopruSahanlikY: 2.4, // köprünün taş duvarın üstüne oturduğu yükseklik (duvar taşları modelde 2,2–2,5 m)
  kopruOluk: 3, // 8. delik: başlangıçtan köprünün ağzına, üst sıranın oluğunda
  kopruAyak: 0.3, // köprünün koridordaki iki ayağı (açıklığın üçte birlerinde; 9. delikte engel)
  koridorBaslangic: 1.5, // 9. delik: başlangıcın köprü ayağına uzaklığı
  tasSirasiDerinlik: 0.3, // 9. delik: taş duvarın dibindeki taş sırası (duvardan ne kadar çıkar; en çok)
  tasSirasiBosluk: 0.9, // taş sırasındaki boşluk: topun duvardan sekebildiği yer
  koridorCepBoy: 2.2, // 9. delik: tribünün köşesinden sonraki cebin boyu (x) ve derinliği (z)
  koridorCepDerinlik: 1.4,
  // Atış işaretleri (yerde): güç halkası ve nişan çizgisi
  gucHalkasiIc: 0.085,
  gucHalkasiDis: 0.11,
  nisanKalinlik: 0.016,
} as const;

// --- Yerin eşyaları (Kemal, 19 Kasım 2026: "kalsın, gerçeğe yakın"). Yerleri DENEME; ölçüleri kaynaktan.
// Künyede ve 3B modelde yoklar; her sahada olan genel eşya. Üstlerinde yazı, logo yok.
export const ESYA = {
  // Huni: en küçük yaygın boy 12 inç = 305 mm (İngilizce Vikipedi "Traffic cone", ABD boyları;
  // 19 Kasım 2026'da okundu). Taban ölçüsü kaynakta yok (DENEME.huniTaban).
  huniBoy: 0.305,
  // Yerden çıkan (pop-up) sulama başlığı: görünen yüzün çapı 4,1 cm, çıkma boyu 10,2 cm
  // (Rain Bird 5000 serisi rotor, ürün sayfası "Dimensions": exposed surface diameter 1 5/8", pop-up height 4";
  // https://www.rainbird.com/products/5000-series, 19 Kasım 2026'da okundu). Tek üreticinin tek ürünü; örnek ölçü.
  sulamaCap: 0.041,
  sulamaBoy: 0.102,
  // Baraj (serbest vuruş) mankeni: boy 180 cm (Precision Training "Senior Pro Club Mannequin" ürün sayfası,
  // https://www.precisiontraining.uk.com, 19 Kasım 2026'da okundu). En ve taban kaynakta yok (DENEME).
  mankenBoy: 1.8,
} as const;

export const TOP_YARICAP = GOLF.topCap / 2;
