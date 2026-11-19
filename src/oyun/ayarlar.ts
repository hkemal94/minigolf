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

// --- Görünüş: dokulu gerçekçi (Karar: Kemal, 19 Kasım 2026; tasarım belgesi 5.2). Dokuların kaynağı
// docs/lisanslar.md'de. Buradaki her değer DENEME; fizikle ilgisi yok.
export const GORUNUS = {
  // Dokunun yerde kapladığı kenar (m): kaynağın kendi ölçüsü (ambientCG ve Poly Haven sayfalarındaki boyut).
  dokuBoyu: { cim: 1.4, toprak: 2.07, beton: 2.0, tas: 2.0, ahsap: 1.5 },
  // Renk dokularının ortalama rengi (doğrusal; dosyalardan ölçüldü: scripts/dokulari-hazirla.py). Modelin kendi rengi korunsun diye
  // doku bu ortalamaya bölünür: yüzey uzaktan modelin renginde, yakından dokulu görünür.
  dokuOrtalama: {
    cim: [0.0581, 0.1061, 0.0217],
    toprak: [0.4709, 0.2611, 0.1272],
    beton: [0.1878, 0.1573, 0.1047],
    tas: [0.4333, 0.3127, 0.189],
    ahsap: [0.191, 0.0992, 0.0413],
  },
  // DENEME · Kabartının (normal dokusu) gücü.
  kabarti: { cim: 0.7, toprak: 0.8, beton: 0.7, tas: 1.2, ahsap: 0.8, bordur: 0.5 },
  // DENEME · Eğik bakışta dokunun netliği (telefonun izin verdiği kadar; en çok bu).
  netlik: 4,
  // DENEME · Güneş: yönü (hedefe göre; x, y, z), rengi, gücü. Sakin gün ışığı (maçsız gün).
  gunesYon: [22, 40, 26],
  gunesRenk: '#FFF3DC',
  gunesGuc: 2.8,
  // DENEME · Gökten ve yerden gelen dolgu ışığı.
  gokRenk: '#DCE9F5',
  yerRenk: '#7A6A4F',
  dolguGuc: 1.7,
  // DENEME · Gölge dokusunun kenarı (piksel). Tek gölge veren ışık; kutu deliğin tamamını kaplar.
  golgeBoyu: 2048,
  // DENEME · Kalite düşürme: saniyedeki kare sayısı art arda iki ölçümde bunun altındaysa gölgeler kapanır
  // (o açılış için; geri açılmaz). Açılıştan sonraki ilk süre sayılmaz (yükleme takılmaları).
  golgeKapatFps: 30,
  olcumSuresi: 2, // bir ölçümün süresi (sn)
  olcumBekleme: 2, // açılıştan sonra ölçüme başlamadan beklenen süre (sn)
  // DENEME · Golf topu: gamze sayısı ve derinliğin görünüşü. Gerçek toplarda gamze sayısı markaya göre değişir;
  // kaynaktan okunmadı.
  gamzeSayisi: 336,
  gamzeGucu: 0.8,
  // DENEME · Kale filesi: ipin kalınlığı (m; telefonda seçilsin diye gerçeğinden kalın). Göz aralığı GORUNTU.fileGoz.
  fileIp: 0.009,
  // DENEME · Uzaktan bakınca ipin solmasını azaltan üs (1: olduğu gibi; küçüldükçe ip uzaktan daha belirgin).
  fileUzakUs: 0.6,
  // DENEME · Delik bayrağı: hafif rüzgârda dalgalanma (genlik m, hız, bayrak boyunca dalga sayısı).
  bayrakGenlik: 0.014,
  bayrakHiz: 3.2,
  bayrakDalga: 1.3,
} as const;
