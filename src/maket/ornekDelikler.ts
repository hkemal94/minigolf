import type { MetinAnahtari } from '../metinler';
import { IFAB, WMF, MODEL, DENEME, ESYA, TOP_YARICAP } from './olculer';

// YENİ DİLLE DELİKLER (öneri; Kemal, 18 Kasım 2026): önce üç örnek (3, 7, 14), sonra adım adım öbürleri
// (tasarım belgesi 4.9). Adım 1: 1, 2, 4, 5 (saha, çim). Adım 2: 6, 8, 9 (açık tribünün önü, köprü, koridor). Pist gerçek minigolf ölçüsünde,
// zemin mekânın kendi zemini, sınır ince bordür; bulmacayı yerin şekli, eğimi ve eşyası kurar.
// Koordinatlar 3B modelin koordinatları (x, z; metre). Aynı veri hem 3B makette hem üstten şemada kullanılır.

export type N2 = [number, number]; // x, z
export type N3 = [number, number, number];
export type Kaynak = 'ifab' | 'wmf' | 'model' | 'deneme';

export type Olcu = { a: N2; b: N2; kaydir: number; deger: number; kaynak: Kaynak };
export type Dikdortgen = { x0: number; x1: number; z0: number; z1: number };
// metre: değer metre olarak yazılır (6,25 m); yoksa sayı olduğu gibi.
export type Etiket = { n: N2; metin: MetinAnahtari; deger?: number; metre?: boolean; hiza?: 'sol' | 'sag' | 'orta' };

export type OrnekDelik = {
  no: number;
  zorluk: MetinAnahtari;
  eksen: 'x' | '-x' | 'z' | '-z'; // deliğin uzun ekseni ekranda dikey; başlangıç altta kalacak yön
  bordurler: { noktalar: N2[]; y: number }[];
  baslangic: N3;
  cukur: N3;
  // Şemada: çerçeve, zemin çizgileri, eşyalar
  cerceve: Dikdortgen;
  cizgiler: { a: N2; b: N2; tur: 'saha' | 'basamak' | 'merdiven' | 'ag' | 'korkuluk' }[];
  kutular: (Dikdortgen & { tur: 'direk' | 'koltuk' | 'koltukAcik' | 'bolme' | 'duvar' | 'tas' | 'merdivenTas' | 'ayak' | 'huni' | 'sulama' | 'manken' })[];
  // Şemada zeminin parçaları (çim, toprak, beton, köprü): çerçevenin rengi tek zemine yetmediğinde.
  alanlar?: (Dikdortgen & { renk: string })[];
  // Kenarı olmayan pist sınırı (köprünün yanları): şemada ve küçük planda kesik kiremit çizgi.
  acikKenarlar?: N2[][];
  // Deliğin dış çizgisi (yerleşim şemasında kiremit biçim); yoksa ilk bordür.
  dis?: N2[];
  birikinti?: { n: N2; r: number };
  // Yere boyanmış yuvarlak işaretler (penaltı noktası)
  noktalar?: { n: N2; r: number }[];
  // Önerilen yol (şemada kesik lacivert çizgi; oynanışta çizilmez). İkincisi varsa: başka bir örnek yol.
  yollar?: N2[][];
  // Öne çıkarılan kenar parçası (4. delikteki eğik sektirme kenarı): daha yüksek, üstü krem.
  vurguKenar?: [N2, N2];
  olculer: Olcu[];
  etiketler: Etiket[];
  // Atış maketi: topun yeri, nişan yönü (birim vektör), nişan boyu
  atis: { top: N3; yon: N2; boy: number };
};

// ---------- 3 · Kale (A ucu): zemin sahanın çimi ----------
const G = WMF.betonEn; // pist eni 1,25 m (beton norm pist)
const yk = MODEL.yakinDirekZ;
const uz = MODEL.uzakDirekZ;
const kaleBas = MODEL.kaleSahasiCizgisiZ - 0.6; // DENEME: başlangıcın arkasındaki pay
const koseBas = uz - 0.56; // 45° sektirme köşesinin başladığı yer (yarım pist eni kadar)

const kale: OrnekDelik = {
  no: 3,
  zorluk: 'maket.zorluk.orta',
  eksen: 'z',
  // Bordür: kalenin dışında kale çizgisinin iki yanı; kalenin içinde sınır ağın kendisi.
  bordurler: [
    {
      y: MODEL.cimUstu,
      noktalar: [
        [-G / 2, yk],
        [-G / 2, kaleBas],
        [G / 2, kaleBas],
        [G / 2, koseBas],
        [0, uz + 0.07],
      ],
    },
  ],
  baslangic: [0, MODEL.cizgiUstu, MODEL.kaleSahasiCizgisiZ],
  cukur: [-1.25, MODEL.cimUstu, uz - 0.3],
  cerceve: { x0: -3.9, x1: 3.9, z0: kaleBas - 1.3, z1: uz + 1.5 },
  cizgiler: [
    { a: [0, kaleBas - 1.3], b: [0, uz + 1.5], tur: 'saha' }, // kale çizgisi
    { a: [0, MODEL.kaleSahasiCizgisiZ], b: [3.9, MODEL.kaleSahasiCizgisiZ], tur: 'saha' }, // kale sahası çizgisi
    { a: [0, yk], b: [-MODEL.agDerinlik, yk], tur: 'ag' },
    { a: [-MODEL.agDerinlik, yk], b: [-MODEL.agDerinlik, uz], tur: 'ag' },
    { a: [-MODEL.agDerinlik, uz], b: [0, uz], tur: 'ag' },
  ],
  kutular: [
    { tur: 'direk', x0: -0.07, x1: 0.07, z0: yk - 0.07, z1: yk + 0.07 },
    { tur: 'direk', x0: -0.07, x1: 0.07, z0: uz - 0.07, z1: uz + 0.07 },
  ],
  olculer: [
    { a: [G / 2, MODEL.kaleSahasiCizgisiZ], b: [G / 2, yk], kaydir: -0.7, deger: IFAB.kaleSahasi, kaynak: 'ifab' },
    { a: [G / 2, yk], b: [G / 2, uz], kaydir: -0.7, deger: IFAB.kaleGenislik, kaynak: 'ifab' },
    { a: [-G / 2, kaleBas], b: [G / 2, kaleBas], kaydir: -0.5, deger: WMF.betonEn, kaynak: 'wmf' },
    { a: [-MODEL.agDerinlik, uz], b: [0, uz], kaydir: 0.55, deger: MODEL.agDerinlik, kaynak: 'model' },
    { a: [-MODEL.agDerinlik, kaleBas], b: [-MODEL.agDerinlik, uz + 0.07], kaydir: 0.75, deger: uz + 0.07 - kaleBas, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [-0.3, yk + 0.12], metin: 'maket.sema.yakinDirek', hiza: 'sol' },
    { n: [-0.25, uz + 0.95], metin: 'maket.sema.sektirme', hiza: 'sag' },
    { n: [-1.0, (yk + uz) / 2], metin: 'maket.sema.ag', hiza: 'orta' },
    { n: [-0.8, yk - 1.6], metin: 'maket.sema.yanAg', hiza: 'sol' },
  ],
  // Nişan: yakın direği sıyıran dar açı (yaklaşık 2°)
  atis: { top: [0, MODEL.cizgiUstu, MODEL.kaleSahasiCizgisiZ], yon: [0.035, 0.9994], boy: 1.3 },
};

// ---------- 7 · Açık tribün sıraları: zemin tribünün beton basamağı ----------
const D = MODEL.basamakDerinlik;
const H = MODEL.basamakYukseklik;
export const siraOn = (k: number) => MODEL.acikTribunOnZ - D * (k - 1); // sıranın sahaya bakan kenarı
export const siraArka = (k: number) => siraOn(k) - D;
export const siraY = (k: number) => H * k;
// Tribünün ortasındaki taş merdiven (modelde var): x 44,4–45,6, bütün sıraları keser. Koltuk yok.
export const MERDIVEN_X0 = 44.4;
export const MERDIVEN_X1 = 45.6;
export const TRIBUN_X0 = MERDIVEN_X1; // pist merdivenin doğu kenarından başlar
export const TRIBUN_X1 = TRIBUN_X0 + WMF.minyaturBoy; // pistin boyu 6,25 m (minyatür norm pist)
const X0 = TRIBUN_X0;
const X1 = TRIBUN_X1;
// Koltuklar (Kemal, 18 Kasım 2026: tahta yerine tek tek koltuk): her sırada, basamağın ön yanında dizilir.
// Koltuğun arkasında, bir üst basamağın dibinde 0,35 m'lik oluk kalır; pist bu oluktur.
export const OLUK = D - MODEL.tahtaOndenBosluk - MODEL.tahtaEn; // 0,35 m (model)
export const koltukZ = (k: number): [number, number] => [siraOn(k) - MODEL.tahtaOndenBosluk - MODEL.tahtaEn, siraOn(k) - MODEL.tahtaOndenBosluk];
const koltukBosluk = (DENEME.koltukAralik - DENEME.koltukEn) / 2;
// Merdivenin doğusundaki i. koltuğun x aralığı (i = 0 merdivenin yanı).
export const koltukX = (i: number): [number, number] => [X0 + koltukBosluk + i * DENEME.koltukAralik, X0 + koltukBosluk + i * DENEME.koltukAralik + DENEME.koltukEn];
export const KOLTUK_SAYISI = Math.ceil(WMF.minyaturBoy / DENEME.koltukAralik); // pist boyunca 14 koltuk
// Boş koltuklar: topun bir alt sıraya geçtiği yerler (sıra -> koltuk sırası).
export const BOS_KOLTUK: Record<number, number> = { 5: 8, 4: 4 };
const olukOrta = (k: number) => siraArka(k) + OLUK / 2;
// Boş koltuğun olduğu yerde olukta 45° köşe: topu boşluktan aşağı çevirir.
const kose = (k: number): N2[] => {
  const [b0, b1] = koltukX(BOS_KOLTUK[k]);
  return [
    [Math.min(b0 + OLUK, b1), siraArka(k)],
    [b0, siraArka(k) + OLUK],
  ];
};
const ucKapak = (k: number, x: number) => ({ y: siraY(k), noktalar: [[x, siraArka(k)], [x, siraArka(k) + OLUK]] as N2[] });

const tribun: OrnekDelik = {
  no: 7,
  zorluk: 'maket.zorluk.zor',
  eksen: '-x',
  bordurler: [
    ...[5, 4, 3].flatMap((k) => [ucKapak(k, X0), ucKapak(k, X1)]),
    { y: siraY(5), noktalar: kose(5) },
    { y: siraY(4), noktalar: kose(4) },
  ],
  baslangic: [X1 - 0.45, siraY(5), olukOrta(5)],
  cukur: [X0 + 0.7, siraY(3), olukOrta(3)],
  cerceve: { x0: X0 - 0.9, x1: X1 + 0.9, z0: siraArka(5) - 1.1, z1: siraOn(3) + 1.1 },
  cizgiler: [
    ...[3, 4, 5, 6].map((k) => ({ a: [X0 - 0.9, siraOn(k)] as N2, b: [X1 + 0.9, siraOn(k)] as N2, tur: 'basamak' as const })),
    { a: [X0, siraArka(5) - 1.1], b: [X0, siraOn(3) + 1.1], tur: 'merdiven' },
  ],
  kutular: [3, 4, 5].flatMap((k) =>
    Array.from({ length: KOLTUK_SAYISI }, (_, i) => i)
      .filter((i) => BOS_KOLTUK[k] !== i)
      .map((i) => ({ tur: (k === 5 ? 'koltukAcik' : 'koltuk') as 'koltuk' | 'koltukAcik', x0: koltukX(i)[0], x1: koltukX(i)[1], z0: koltukZ(k)[0], z1: koltukZ(k)[1] })),
  ),
  olculer: [
    { a: [X0, siraOn(3)], b: [X1, siraOn(3)], kaydir: 0.5, deger: WMF.minyaturBoy, kaynak: 'wmf' },
    { a: [X1, siraArka(5)], b: [X1, siraArka(5) + OLUK], kaydir: -0.3, deger: OLUK, kaynak: 'model' },
    { a: [X1, siraArka(3)], b: [X1, siraOn(3)], kaydir: -0.3, deger: MODEL.basamakDerinlik, kaynak: 'model' },
    { a: [koltukX(BOS_KOLTUK[4])[0], siraOn(4)], b: [koltukX(BOS_KOLTUK[4])[1], siraOn(4)], kaydir: 1.25, deger: DENEME.koltukEn, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [koltukX(BOS_KOLTUK[5])[0] + 0.2, siraOn(5) + 0.12], metin: 'maket.sema.bosKoltuk', hiza: 'sol' },
    { n: [koltukX(BOS_KOLTUK[4])[0] + 0.2, siraOn(4) + 0.12], metin: 'maket.sema.bosKoltuk', hiza: 'sol' },
    { n: [50.6, siraArka(5) - 0.12], metin: 'maket.sema.oluk', hiza: 'sag' },
    { n: [X1 + 0.75, siraOn(5) - D / 2], metin: 'maket.sema.sira', deger: 5, hiza: 'orta' },
    { n: [X1 + 0.75, siraOn(4) - D / 2], metin: 'maket.sema.sira', deger: 4, hiza: 'orta' },
    { n: [X1 + 0.75, siraOn(3) - D / 2], metin: 'maket.sema.sira', deger: 3, hiza: 'orta' },
    { n: [X0 - 0.55, siraOn(3) + 0.45], metin: 'maket.sema.merdiven', hiza: 'orta' },
    { n: [X0 - 0.25, siraOn(5)], metin: 'maket.sema.basamakYukseklik', deger: MODEL.basamakYukseklik, hiza: 'orta' },
  ],
  // Nişan: oluk boyunca, boş koltuğun önündeki köşeye
  atis: { top: [X1 - 0.45, siraY(5), olukOrta(5)], yon: [-1, 0], boy: 1.1 },
};

// ---------- 14 · Duşlar: zemin duşun karosu (oda modelde yok; kodla çizildi) ----------
export const DUS_BOY = WMF.minyaturBoy; // oda boyu = pist boyu 6,25 m
export const DUS_EN = DENEME.dusEn;
const B = DENEME.dusBolmeBoy;
const K = DENEME.dusBolmeKalinlik / 2;
export const DUS_BOLMELER = [
  { x: 1.5, z0: 0, z1: B },
  { x: 3.1, z0: DUS_EN - B, z1: DUS_EN },
  { x: 4.7, z0: 0, z1: B },
];

const dus: OrnekDelik = {
  no: 14,
  zorluk: 'maket.zorluk.zor',
  eksen: 'x',
  bordurler: [{ y: 0, noktalar: [[0, 0], [DUS_BOY, 0], [DUS_BOY, DUS_EN], [0, DUS_EN], [0, 0]] }],
  baslangic: [0.6, 0, 0.75],
  cukur: [5.6, 0, 0.75], // delik = yer süzgeci
  cerceve: { x0: -0.8, x1: DUS_BOY + 0.8, z0: -1.0, z1: DUS_EN + 1.0 },
  cizgiler: [],
  kutular: DUS_BOLMELER.map((b) => ({ tur: 'bolme' as const, x0: b.x - K, x1: b.x + K, z0: b.z0, z1: b.z1 })),
  birikinti: { n: [2.3, 2.05], r: DENEME.birikintiYaricap },
  olculer: [
    { a: [0, DUS_EN], b: [DUS_BOY, DUS_EN], kaydir: 0.5, deger: WMF.minyaturBoy, kaynak: 'wmf' },
    { a: [DUS_BOY, 0], b: [DUS_BOY, DUS_EN], kaydir: -0.4, deger: DENEME.dusEn, kaynak: 'deneme' },
    { a: [1.5, B], b: [1.5, DUS_EN], kaydir: -0.3, deger: DENEME.dusGecit, kaynak: 'deneme' },
    { a: [4.7, 0], b: [4.7, B], kaydir: 0.3, deger: DENEME.dusBolmeBoy, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [3.1, 1.75], metin: 'maket.sema.bolme', hiza: 'orta' },
    { n: [2.3, 2.05], metin: 'maket.sema.birikinti', hiza: 'orta' },
    { n: [5.6, 1.3], metin: 'maket.sema.suzgec', hiza: 'orta' },
    { n: [5.25, 2.0], metin: 'maket.sema.egim', hiza: 'orta' },
    { n: [-0.45, 0.75], metin: 'maket.sema.kapi', hiza: 'orta' },
  ],
  // Nişan: ilk bölmenin açık yanındaki geçide
  atis: { top: [0.6, 0, 0.75], yon: [0.6, 0.8], boy: 1.2 },
};

// =====================================================================================================
// ADIM 1 (tasarım belgesi 4.9): 1, 2, 4, 5. Yer: saha. Zemin: sahanın çimi. Hareketli engel yok.
// Sahanın çizgileri, köşe yayı, köşe bayrağı ve penaltı noktası modelden (IFAB ölçüleriyle; model 19 Kasım
// 2026'da düzeltildi, bunlar artık kodla çizilmez). Pist eni hepsinde 1,25 m (WMF beton pist).
// =====================================================================================================
const h = G / 2;
const yCim = MODEL.cimUstu;
const yCizgi = MODEL.cizgiUstu;
const parcala = (ns: N2[], tur: 'saha' | 'ag' = 'saha') => ns.slice(0, -1).map((a, i) => ({ a, b: ns[i + 1], tur }));

// ---------- 1 · Orta yuvarlak: pist yuvarlağın çizgisinin üstünde kıvrılır ----------
export const ORTA: N2 = [MODEL.sahaBoy / 2, -MODEL.sahaEn / 2]; // orta nokta (45, -29)
const R = IFAB.ortaYuvarlakYaricap; // 9,15 m
// Yuvarlağın üstünde nokta. Açı 0: orta çizginin açık tribün yanında yuvarlağı kestiği yer; açı arttıkça A ucuna.
const oy = (r: number, a: number): N2 => [ORTA[0] - r * Math.sin(a), ORTA[1] - r * Math.cos(a)];
const yay = (r: number, a0: number, a1: number, adim = 24): N2[] => Array.from({ length: adim + 1 }, (_, i) => oy(r, a0 + ((a1 - a0) * i) / adim));
const yayAci = (DENEME.ortaYuvarlakYayAcisi * Math.PI) / 180;
export const YAY_BOYU = R * yayAci; // 7,19 m (45°'lik yay); açı ve boy DENEME
const y0 = -DENEME.baslangicPayi / R;
const y1 = yayAci + DENEME.delikPayi / R;
const ortaBas = oy(R, 0);
const ortaCukur = oy(R, yayAci);
// Önerilen yol: top hunilerin dışından dış kenara gider (yayın 12,5°'sinde değer), sekip çizgiye geri
// döner; çizgiyi ikinci kez kestiği yer deliktir (45°). Sekme noktası yansıma hesabıyla bulundu.
const ortaSekme: N2 = [42.8865, -38.522];

// Antrenman hunileri (modelde ve künyede yok; DENEME, Kemal onaylamadı): çizginin üstünde, yayın başında üç huni.
// Çizgiyi izleyen top hunilere çarpar; önerilen yol hunilerin dışından, dış kenara yaslanarak dolanır.
export const HUNI_ACILARI = [7, 12, 17].map((d) => (d * Math.PI) / 180); // DENEME
export const HUNILER: N2[] = HUNI_ACILARI.map((a) => oy(R, a));
const hy = DENEME.huniTaban / 2;

const ortaYuvarlak: OrnekDelik = {
  no: 1,
  zorluk: 'maket.zorluk.kolay',
  eksen: '-x',
  bordurler: [{ y: yCim, noktalar: [...yay(R + h, y0, y1), ...yay(R - h, y1, y0), oy(R + h, y0)] }],
  baslangic: [ortaBas[0], yCizgi, ortaBas[1]],
  cukur: [ortaCukur[0], yCizgi - 0.003, ortaCukur[1]],
  cerceve: { x0: 37.0, x1: 46.5, z0: -39.9, z1: -33.9 },
  cizgiler: [
    { a: [ORTA[0], -39.9], b: [ORTA[0], -33.9], tur: 'saha' }, // orta çizgi
    ...parcala(yay(R, -0.17, 0.99, 40)), // orta yuvarlak
  ],
  kutular: HUNILER.map((n) => ({ tur: 'huni' as const, x0: n[0] - hy, x1: n[0] + hy, z0: n[1] - hy, z1: n[1] + hy })),
  yollar: [[ortaBas, ortaSekme, ortaCukur]],
  olculer: [
    { a: oy(R - h, y1), b: oy(R + h, y1), kaydir: -0.4, deger: WMF.betonEn, kaynak: 'wmf' },
  ],
  etiketler: [
    { n: [43.75, -35.6], metin: 'maket.sema.yayBoyu', deger: YAY_BOYU, metre: true, hiza: 'orta' },
    { n: [44.15, -35.6], metin: 'maket.sema.yaricap', deger: IFAB.ortaYuvarlakYaricap, metre: true, hiza: 'orta' },
    { n: [43.2, -37.15], metin: 'maket.sema.huni', hiza: 'sag' },
    { n: [ortaSekme[0] - 1.1, -39.1], metin: 'maket.sema.disKenar', hiza: 'orta' },
    { n: [ORTA[0] - 0.2, -35.0], metin: 'maket.sema.ortaCizgi', hiza: 'orta' },
    { n: [46.2, -37.75], metin: 'maket.sema.ortaYuvarlak', hiza: 'sag' },
  ],
  // Nişan: hunilerin dışından dış kenara (yaklaşık 10° dışa)
  atis: { top: [ortaBas[0], yCizgi, ortaBas[1]], yon: [-0.9849, -0.1733], boy: 1.3 },
};

// ---------- 2 · Kenar çizgisi: pist sahanın içinden taç çizgisine iner; ucu açık ----------
const X2 = MODEL.sahaBoy / 4; // A yarısının ortası (22,5); yeri DENEME
const zTac = MODEL.tacCizgisiZ;
const tacBas = zTac + WMF.minyaturBoy; // başlangıç taç çizgisinden 6,25 m içeride (minyatür norm pist boyu)
const tacCukurZ = zTac + DENEME.tacPayi;

// Sulama başlıkları (modelde ve künyede yok; DENEME, Kemal onaylamadı): pistin ortasında, yerden çıkmış iki başlık.
// Düz giden top başlığa çarpar; önerilen yol yan kenardan bir kez sekip ikisinin yanından dolanır.
export const SULAMA: N2[] = [
  [X2, tacBas - 2.0],
  [X2, tacBas - 4.0],
]; // DENEME
const sy = ESYA.sulamaCap / 2;
const tacSekme: N2 = [X2 - h + TOP_YARICAP, (tacBas + tacCukurZ) / 2];

const kenarCizgisi: OrnekDelik = {
  no: 2,
  zorluk: 'maket.zorluk.kolay',
  eksen: '-z',
  // Kenar taç çizgisinde biter: uç açık, sınır çizginin kendisi (çizgiyi geçen top taca çıkar).
  bordurler: [
    {
      y: yCim,
      noktalar: [
        [X2 - h, zTac],
        [X2 - h, tacBas + DENEME.baslangicPayi],
        [X2 + h, tacBas + DENEME.baslangicPayi],
        [X2 + h, zTac],
      ],
    },
  ],
  baslangic: [X2, yCim, tacBas],
  cukur: [X2, yCim, tacCukurZ],
  cerceve: { x0: X2 - 2.5, x1: X2 + 2.5, z0: zTac - 1.6, z1: tacBas + 1.5 },
  cizgiler: [{ a: [X2 - 2.5, zTac + MODEL.cizgiEn / 2], b: [X2 + 2.5, zTac + MODEL.cizgiEn / 2], tur: 'saha' }],
  kutular: SULAMA.map((n) => ({ tur: 'sulama' as const, x0: n[0] - sy, x1: n[0] + sy, z0: n[1] - sy, z1: n[1] + sy })),
  yollar: [[[X2, tacBas], tacSekme, [X2, tacCukurZ]]],
  olculer: [
    { a: [X2 + h, tacBas], b: [X2 + h, zTac], kaydir: 0.45, deger: WMF.minyaturBoy, kaynak: 'wmf' },
    { a: [X2 - h, tacBas + DENEME.baslangicPayi], b: [X2 + h, tacBas + DENEME.baslangicPayi], kaydir: 0.4, deger: WMF.betonEn, kaynak: 'wmf' },
    { a: [X2 - h, tacCukurZ], b: [X2 - h, zTac], kaydir: -0.45, deger: DENEME.tacPayi, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [X2 + 0.85, zTac - 0.2], metin: 'maket.sema.tacCizgisi', hiza: 'sol' },
    { n: [X2, zTac - 0.75], metin: 'maket.sema.acikUc', hiza: 'orta' },
    { n: [X2 - 0.8, SULAMA[0][1] + 0.05], metin: 'maket.sema.sulama', hiza: 'sag' },
    { n: [X2 - 0.8, SULAMA[1][1] + 0.05], metin: 'maket.sema.sulama', hiza: 'sag' },
    { n: [X2 - 0.8, tacSekme[1] + 0.05], metin: 'maket.sema.sektirmeYan', hiza: 'sag' },
    { n: [X2 + 1.7, tacBas + 1.0], metin: 'maket.sema.sahaIci', hiza: 'orta' },
    { n: [X2 - 1.6, zTac - 1.2], metin: 'maket.sema.sahaDisi', hiza: 'orta' },
  ],
  // Atış anı: ikinci vuruş, top deliğe 0,86 m; kısa ve az güçle (çizgi hemen arkada)
  atis: { top: [X2 + 0.12, yCim, tacCukurZ + 0.85], yon: [-0.1398, -0.9902], boy: 0.7 },
};

// ---------- 4 · Köşe (A ucu): L pist taç çizgisinden kale çizgisine döner; dönüşün ortasında köşe bayrağı ----------
export const KOSE: N2 = [MODEL.kaleCizgisiX, MODEL.tacCizgisiZ]; // sahanın köşesi (0, -58)
const KOL = WMF.minyaturBoy / 2; // iki kol eşit; yolun toplamı 6,25 m (minyatür norm pist boyu). Bölüşüm DENEME.
const pah = DENEME.kosePah;
const koseBasX = KOSE[0] + KOL;
const koseCukurZ = KOSE[1] + KOL;
// Önerilen yol: top direğin dışından geçer, 45° kenardan sekip kale çizgisi boyunca döner.
// (Deliğin 45° kenara göre aynası başlangıçla birleştirilince kenarı kestiği yer.)
const koseSekme: N2 = [-0.225, -58.225];

const koseDeligi: OrnekDelik = {
  no: 4,
  zorluk: 'maket.zorluk.orta',
  eksen: '-x',
  bordurler: [
    {
      y: yCim,
      noktalar: [
        [koseBasX + DENEME.baslangicPayi, KOSE[1] + h],
        [koseBasX + DENEME.baslangicPayi, KOSE[1] - h],
        [KOSE[0] - h + pah, KOSE[1] - h],
        [KOSE[0] - h, KOSE[1] - h + pah],
        [KOSE[0] - h, koseCukurZ + DENEME.delikPayi],
        [KOSE[0] + h, koseCukurZ + DENEME.delikPayi],
        [KOSE[0] + h, KOSE[1] + h],
        [koseBasX + DENEME.baslangicPayi, KOSE[1] + h],
      ],
    },
  ],
  baslangic: [koseBasX, yCizgi, KOSE[1] + MODEL.cizgiEn / 2],
  cukur: [KOSE[0] + MODEL.cizgiEn / 2, yCizgi - 0.003, koseCukurZ],
  cerceve: { x0: -2.4, x1: 4.8, z0: -60.2, z1: -52.9 },
  cizgiler: [
    { a: [KOSE[0], KOSE[1] + MODEL.cizgiEn / 2], b: [4.8, KOSE[1] + MODEL.cizgiEn / 2], tur: 'saha' }, // taç çizgisi
    { a: [KOSE[0] + MODEL.cizgiEn / 2, KOSE[1]], b: [KOSE[0] + MODEL.cizgiEn / 2, -52.9], tur: 'saha' }, // kale çizgisi
    // köşe yayı (IFAB: köşe bayrağından 1 m, sahanın içine çeyrek daire)
    ...parcala(Array.from({ length: 13 }, (_, i): N2 => [KOSE[0] + IFAB.koseYayiYaricap * Math.cos((i * Math.PI) / 24), KOSE[1] + IFAB.koseYayiYaricap * Math.sin((i * Math.PI) / 24)])),
  ],
  kutular: [{ tur: 'direk', x0: KOSE[0] - MODEL.koseDirekEn / 2, x1: KOSE[0] + MODEL.koseDirekEn / 2, z0: KOSE[1] - MODEL.koseDirekEn / 2, z1: KOSE[1] + MODEL.koseDirekEn / 2 }],
  vurguKenar: [
    [KOSE[0] - h + pah, KOSE[1] - h],
    [KOSE[0] - h, KOSE[1] - h + pah],
  ],
  yollar: [[[koseBasX, KOSE[1]], koseSekme, [KOSE[0], koseCukurZ]]],
  olculer: [
    { a: [koseBasX, KOSE[1] - h], b: [KOSE[0], KOSE[1] - h], kaydir: 0.5, deger: KOL, kaynak: 'deneme' },
    { a: [KOSE[0] - h, KOSE[1]], b: [KOSE[0] - h, koseCukurZ], kaydir: 0.5, deger: KOL, kaynak: 'deneme' },
    { a: [koseBasX + DENEME.baslangicPayi, KOSE[1] - h], b: [koseBasX + DENEME.baslangicPayi, KOSE[1] + h], kaydir: -0.4, deger: WMF.betonEn, kaynak: 'wmf' },
  ],
  etiketler: [
    { n: [KOSE[0] + 0.05, KOSE[1] - 0.9], metin: 'maket.sema.koseBayragi', hiza: 'sol' },
    { n: [KOSE[0] - 0.95, KOSE[1] - 1.0], metin: 'maket.sema.sektirme', hiza: 'orta' },
    { n: [KOSE[0] + 1.3, KOSE[1] + 1.25], metin: 'maket.sema.koseYayi', deger: IFAB.koseYayiYaricap, metre: true, hiza: 'orta' },
    { n: [4.5, KOSE[1] + 0.3], metin: 'maket.sema.tacCizgisi', hiza: 'sag' },
    { n: [KOSE[0] - 0.2, -53.72], metin: 'maket.sema.kaleCizgisi', hiza: 'orta' },
    { n: [KOSE[0] + 2.6, KOSE[1] + 2.9], metin: 'maket.sema.yolBoyu', deger: WMF.minyaturBoy, metre: true, hiza: 'orta' },
  ],
  // Atış anı: ikinci vuruş, top dönüşün önünde; nişan direğin dışından 45° kenara
  atis: { top: [1.0, yCim, KOSE[1] - 0.17], yon: [-0.999, -0.0449], boy: 1.1 },
};

// ---------- 5 · Penaltı noktası (nefes): baraj mankenlerinin yanından, kavisli kenardan noktaya ----------
const zKale = -MODEL.sahaEn / 2; // iki direğin ortası (z = -29)
const penBas: N2 = [IFAB.cezaSahasi, zKale];
export const PENALTI: N2 = [IFAB.penaltiNoktasi, zKale];
// Pist oval (elips): odakları başlangıç işareti (ceza sahası çizgisinde) ile delik (penaltı noktası).
// Başlangıçtan çıkıp kenara bir kez değen her top deliğe döner (elipsin odak özelliği).
const eC = (penBas[0] - PENALTI[0]) / 2; // odak yarı aralığı 2,75 (IFAB: 16,5 − 11 = 5,5)
const eB = DENEME.ovalYariEn; // yarı en 1,25: iki pist eni (2,5 m)
const eA = Math.hypot(eC, eB); // büyük yarı eksen 3,02
const penOrta = (penBas[0] + PENALTI[0]) / 2;
const elips = (t: number): N2 => [penOrta - eA * Math.cos(t), zKale + eB * Math.sin(t)];
export const OVAL_BOY = 2 * eA; // 6,04 m
// Baraj mankenleri (antrenman eşyası; modelde ve künyede yok; DENEME, Kemal onaylamadı): başlangıçla
// deliğin tam ortasında, yan yana üç manken. Düz vuruşu keser; top yanından geçip kenardan döner.
export const MANKENLER: N2[] = [-1, 0, 1].map((i): N2 => [penOrta, zKale + i * DENEME.mankenAralik]);
const my = DENEME.mankenEn / 2;
const penSekme = 1.2693; // elips parametresi: başlangıçtan barajın 0,9 m yanından geçen yolun kenara değdiği yer

const penalti: OrnekDelik = {
  no: 5,
  zorluk: 'maket.zorluk.kolay',
  eksen: '-x',
  bordurler: [{ y: yCim, noktalar: Array.from({ length: 97 }, (_, i) => elips((2 * Math.PI * i) / 96)) }],
  baslangic: [penBas[0], yCizgi, penBas[1]],
  cukur: [PENALTI[0], MODEL.noktaUstu, PENALTI[1]],
  cerceve: { x0: 9.5, x1: 17.9, z0: zKale - 2.5, z1: zKale + 2.5 },
  cizgiler: [{ a: [IFAB.cezaSahasi, zKale - 2.5], b: [IFAB.cezaSahasi, zKale + 2.5], tur: 'saha' }],
  kutular: MANKENLER.map((n) => ({ tur: 'manken' as const, x0: n[0] - DENEME.mankenKalinlik / 2, x1: n[0] + DENEME.mankenKalinlik / 2, z0: n[1] - my, z1: n[1] + my })),
  noktalar: [{ n: PENALTI, r: MODEL.penaltiNoktasiCap / 2 }],
  yollar: [
    [penBas, elips(penSekme), PENALTI],
    [penBas, elips(-penSekme), PENALTI],
  ],
  olculer: [
    { a: [penBas[0], zKale + eB], b: [PENALTI[0], zKale + eB], kaydir: -0.35, deger: IFAB.cezaSahasi - IFAB.penaltiNoktasi, kaynak: 'ifab' },
    { a: [penOrta + eA, zKale - eB], b: [penOrta + eA, zKale + eB], kaydir: -0.35, deger: 2 * eB, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [PENALTI[0] - 0.42, zKale], metin: 'maket.sema.penaltiNoktasi', hiza: 'orta' },
    { n: [PENALTI[0] - 0.78, zKale], metin: 'maket.sema.kavis', hiza: 'orta' },
    { n: [penOrta - 0.3, zKale], metin: 'maket.sema.baraj', hiza: 'orta' },
    { n: [IFAB.cezaSahasi + 0.3, zKale - 1.9], metin: 'maket.sema.cezaCizgisi', hiza: 'orta' },
  ],
  // Nişan: barajın yanından, kavisli kenara (yaklaşık 18° yana)
  atis: { top: [penBas[0], yCizgi, penBas[1]], yon: [-0.9503, 0.311], boy: 1.4 },
};

// =====================================================================================================
// ADIM 2 (tasarım belgesi 4.9): 6, 8, 9. Yer: açık tribünün önü, köprü, duvar içi koridor.
// Zemin yerin kendisi: çim ve toprak (6), beton basamak ve köprü (8), toprak yol (9). Hareketli engel yok.
// Korkuluk, basamaklar, merdivenler, tribünün duvarları ve taş duvar modelde var (ölçüleri MODEL).
// Köprü modelde yok: yeri karar (Kemal: açık tribünün kulüp binası ucunda, tribünün arkasından taş duvara);
// biçimi, ölçüsü ve ayağı DENEME, Kemal onaylamadı. Kodla çizilir (OrnekDelik.tsx).
// =====================================================================================================
const zOn = MODEL.acikTribunOnZ; // tribünün ilk basamağının alnı (-63)
const zCimKenar = MODEL.cevreCimKenarZ; // çimin bittiği yer (-62)
const zKork = MODEL.korkulukZ;
const direkY = MODEL.korkulukDirekEn / 2;
// Korkuluk direkleri: x 28'den başlayıp her 2 m'de bir (model).
export const korkulukDirekleri = (x0: number, x1: number): number[] =>
  Array.from({ length: 18 }, (_, i) => MODEL.acikTribunX0 + i * MODEL.korkulukDirekAralik).filter((x) => x >= x0 && x <= x1);

// ---------- 6 · Açık tribünün önü: korkuluğun altından, ilk basamağın dibinden merdivenin ayağına ----------
const X6 = DENEME.korkulukPistX; // tribüne inen kolun ortası
const merdivenOrta = (MERDIVEN_X0 + MERDIVEN_X1) / 2; // 45
const seritOrta = (zOn + zCimKenar) / 2;
const kol2 = merdivenOrta - X6; // tribün boyunca kol: 4 m
const kol1 = WMF.minyaturBoy - kol2; // tribüne inen kol: 2,25 m (yolun toplamı 6,25 m; bölüşüm DENEME)
const bas6: N2 = [X6, seritOrta + kol1];
// Delik korkulukla ilk basamağın arasındaki dar yanda (0,36 m), merdivenin ayağında.
const darYanOrta = (zOn + zKork - direkY) / 2;
const cukur6: N2 = [merdivenOrta, darYanOrta];
// İkinci vuruşun anı: top köşeyi dönmüş, şeridin geniş yanında durur.
const ara6: N2 = [X6, zCimKenar - 0.3];
const yon6 = ((): N2 => {
  const dx = cukur6[0] - ara6[0];
  const dz = cukur6[1] - ara6[1];
  const b = Math.hypot(dx, dz);
  return [dx / b, dz / b];
})();
const c6 = { x0: 39.6, x1: 46.4, z0: -66.0, z1: -57.4 };

const tribunOnu: OrnekDelik = {
  no: 6,
  zorluk: 'maket.zorluk.orta',
  eksen: '-z',
  // Tribün yanında kenar yok: sınır ilk basamağın alnı (0,42 m) ve merdivenin ilk basamağı.
  bordurler: [
    {
      y: 0,
      noktalar: [
        [MERDIVEN_X1, zOn],
        [MERDIVEN_X1, zCimKenar],
        [X6 + h, zCimKenar],
        [X6 + h, bas6[1] + DENEME.baslangicPayi],
        [X6 - h, bas6[1] + DENEME.baslangicPayi],
        [X6 - h, zOn],
      ],
    },
  ],
  baslangic: [bas6[0], 0, bas6[1]],
  cukur: [cukur6[0], 0, cukur6[1]],
  cerceve: c6,
  alanlar: [
    { renk: '#86A35C', x0: c6.x0, x1: c6.x1, z0: MODEL.tacCizgisiZ, z1: c6.z1 }, // saha
    { renk: '#7E9A55', x0: c6.x0, x1: c6.x1, z0: zCimKenar, z1: MODEL.tacCizgisiZ }, // sahayı saran çim
    { renk: '#BDB09A', x0: c6.x0, x1: c6.x1, z0: zOn, z1: zCimKenar }, // toprak
    { renk: '#C8C0AF', x0: c6.x0, x1: c6.x1, z0: c6.z0, z1: zOn }, // tribün (beton)
  ],
  cizgiler: [
    ...[1, 2, 3, 4].map((k) => ({ a: [c6.x0, siraOn(k)] as N2, b: [c6.x1, siraOn(k)] as N2, tur: 'basamak' as const })),
    { a: [c6.x0, MODEL.tacCizgisiZ + MODEL.cizgiEn / 2], b: [c6.x1, MODEL.tacCizgisiZ + MODEL.cizgiEn / 2], tur: 'saha' },
    { a: [c6.x0, zKork], b: [c6.x1, zKork], tur: 'korkuluk' },
  ],
  kutular: [
    { tur: 'merdivenTas', x0: MERDIVEN_X0, x1: MERDIVEN_X1, z0: c6.z0, z1: zOn },
    ...korkulukDirekleri(c6.x0, c6.x1).map((x) => ({ tur: 'direk' as const, x0: x - direkY, x1: x + direkY, z0: zKork - direkY, z1: zKork + direkY })),
  ],
  yollar: [[bas6, ara6, cukur6]],
  olculer: [
    { a: [X6 - h, bas6[1]], b: [X6 - h, seritOrta], kaydir: 0.4, deger: kol1, kaynak: 'deneme' },
    { a: [X6, zCimKenar], b: [merdivenOrta, zCimKenar], kaydir: 0.85, deger: kol2, kaynak: 'deneme' },
    { a: [X6 - h, bas6[1] + DENEME.baslangicPayi], b: [X6 + h, bas6[1] + DENEME.baslangicPayi], kaydir: 0.35, deger: WMF.betonEn, kaynak: 'wmf' },
    { a: [40.15, zOn], b: [40.15, zCimKenar], kaydir: 0.05, deger: zCimKenar - zOn, kaynak: 'model' },
    { a: [42, zKork], b: [44, zKork], kaydir: -1.55, deger: MODEL.korkulukDirekAralik, kaynak: 'model' },
  ],
  etiketler: [
    { n: [43.5, zCimKenar + 0.3], metin: 'maket.sema.korkuluk', hiza: 'orta' },
    { n: [42.2, zOn - 0.3], metin: 'maket.sema.ilkBasamak', hiza: 'orta' },
    { n: [46.3, zOn - 2.3], metin: 'maket.sema.merdivenAyagi', hiza: 'sag' },
    { n: [45.9, -59.7], metin: 'maket.sema.cim', hiza: 'orta' },
    { n: [46.35, seritOrta + 0.07], metin: 'maket.sema.toprak', hiza: 'sag' },
    { n: [43.8, -60.35], metin: 'maket.sema.yolBoyu', deger: WMF.minyaturBoy, metre: true, hiza: 'orta' },
    { n: [46.3, MODEL.tacCizgisiZ + 0.42], metin: 'maket.sema.tacCizgisi', hiza: 'sag' },
    { n: [39.7, -65.75], metin: 'maket.yerlesim.acikTribun', hiza: 'sol' },
  ],
  // Atış anı: ikinci vuruş; nişan iki direğin arasından dar yana, merdivenin ayağındaki deliğe
  atis: { top: [ara6[0], 0, ara6[1]], yon: yon6, boy: 1.2 },
};

// ---------- 8 · Koridor köprüsü: üst sıranın oluğundan köprüye, köprüden taş duvarın üstüne ----------
const UST = MODEL.acikTribunSira; // 6. (en üst) sıra
const zArkaIc = MODEL.arkaDuvarIcZ;
const zArkaDis = MODEL.arkaDuvarDisZ;
const zTasIc = MODEL.tasDuvarIcZ;
const zTasDis = MODEL.tasDuvarDisZ;
// Köprü B ucundaki merdivenin hemen batısında; arka duvarda köprünün eninde geçit açılır (modelde yok).
export const KOPRU = {
  x0: MODEL.bMerdivenX0 - DENEME.kopruEn,
  x1: MODEL.bMerdivenX0,
  y0: siraY(UST), // tribün yanı: üst sıranın düzeyi (2,52)
  y1: DENEME.kopruSahanlikY, // duvar yanı (2,40)
} as const;
const kopruOrta = (KOPRU.x0 + KOPRU.x1) / 2;
export const KOPRU_BOY = zArkaDis - zTasIc; // koridorun üstündeki açıklık: 3,1 m (model)
export const KOPRU_INIS = KOPRU.y0 - KOPRU.y1; // 0,12 m
// Köprünün üstünde yükseklik (z'ye göre): arka duvarın içinde düz, koridorun üstünde iner, taş duvarın üstünde düz.
export const kopruY = (z: number) => (z >= zArkaDis ? KOPRU.y0 : z <= zTasIc ? KOPRU.y1 : KOPRU.y0 - (KOPRU_INIS * (zArkaDis - z)) / KOPRU_BOY);
// Köprünün koridordaki iki ayağı (DENEME): açıklığın üçte birlerinde. 9. delikte taş duvar yanındaki ayak düz yolu keser.
export const KOPRU_AYAKLAR: N2[] = [1, 2].map((i): N2 => [kopruOrta, zTasIc + (i * (zArkaDis - zTasIc)) / 3]);
const KOPRU_AYAK = KOPRU_AYAKLAR[0];
const olukOrta8 = siraArka(UST) + OLUK / 2;
const bas8: N2 = [kopruOrta - DENEME.kopruOluk, olukOrta8];
const cukur8: N2 = [kopruOrta, (zTasIc + zTasDis) / 2];
const c8 = { x0: 56.3, x1: 62.4, z0: -73.0, z1: -66.95 };
// Üst iki sıranın koltukları (şemada): koltuk dizisi ortadaki merdivenden başlar, B ucundaki merdivende biter.
const koltuklar8 = [UST].flatMap((k) =>
  Array.from({ length: 34 }, (_, i) => koltukX(i))
    .filter(([a, b]) => a >= c8.x0 && b <= MODEL.bMerdivenX0)
    .map(([a, b]) => ({ tur: 'koltuk' as const, x0: a, x1: b, z0: koltukZ(k)[0], z1: koltukZ(k)[1] })),
);

const kopru: OrnekDelik = {
  no: 8,
  zorluk: 'maket.zorluk.zor',
  eksen: '-z',
  bordurler: [
    { y: KOPRU.y0, noktalar: [[bas8[0] - DENEME.baslangicPayi, zArkaIc], [bas8[0] - DENEME.baslangicPayi, zArkaIc + OLUK]] },
    // Köprünün ağzındaki 45° köşe: oluktan gelen topu köprüye çevirir.
    { y: KOPRU.y0, noktalar: [[kopruOrta - OLUK / 2, zArkaIc + OLUK], [kopruOrta + OLUK / 2, zArkaIc], [KOPRU.x1, zArkaIc]] },
    // Duvarın üstündeki sahanlık: üç yanı kenarlı (arkası zeytinlik).
    { y: KOPRU.y1, noktalar: [[KOPRU.x0, zTasIc], [KOPRU.x0, zTasDis], [KOPRU.x1, zTasDis], [KOPRU.x1, zTasIc]] },
  ],
  acikKenarlar: [
    [[KOPRU.x0, zArkaDis], [KOPRU.x0, zTasIc]],
    [[KOPRU.x1, zArkaDis], [KOPRU.x1, zTasIc]],
  ],
  dis: [
    [bas8[0] - DENEME.baslangicPayi, zArkaIc + OLUK],
    [KOPRU.x1, zArkaIc + OLUK],
    [KOPRU.x1, zTasDis],
    [KOPRU.x0, zTasDis],
    [KOPRU.x0, zArkaIc],
    [bas8[0] - DENEME.baslangicPayi, zArkaIc],
  ],
  baslangic: [bas8[0], KOPRU.y0, bas8[1]],
  cukur: [cukur8[0], KOPRU.y1, cukur8[1]],
  cerceve: c8,
  alanlar: [
    { renk: '#BDB09A', x0: c8.x0, x1: c8.x1, z0: c8.z0, z1: zArkaDis }, // toprak: koridor ve duvarın dışı
    { renk: '#C9C1B0', x0: KOPRU.x0, x1: KOPRU.x1, z0: zTasDis, z1: zArkaIc }, // köprü
  ],
  cizgiler: [UST].map((k) => ({ a: [c8.x0, siraOn(k)] as N2, b: [MODEL.yanDuvarX0, siraOn(k)] as N2, tur: 'basamak' as const })),
  kutular: [
    ...koltuklar8,
    { tur: 'merdivenTas', x0: MODEL.bMerdivenX0, x1: MODEL.yanDuvarX0, z0: zArkaIc, z1: c8.z1 },
    { tur: 'duvar', x0: c8.x0, x1: KOPRU.x0, z0: zArkaDis, z1: zArkaIc },
    { tur: 'duvar', x0: KOPRU.x1, x1: MODEL.yanDuvarX0, z0: zArkaDis, z1: zArkaIc },
    { tur: 'duvar', x0: MODEL.yanDuvarX0, x1: MODEL.yanDuvarX1, z0: zArkaIc, z1: c8.z1 },
    { tur: 'tas', x0: c8.x0, x1: KOPRU.x0, z0: zTasDis, z1: zTasIc },
    { tur: 'tas', x0: KOPRU.x1, x1: c8.x1, z0: zTasDis, z1: zTasIc },
  ],
  yollar: [[bas8, [kopruOrta, olukOrta8], cukur8]],
  olculer: [
    { a: [bas8[0], zArkaIc + OLUK], b: [kopruOrta, zArkaIc + OLUK], kaydir: 0.5, deger: DENEME.kopruOluk, kaynak: 'deneme' },
    { a: [KOPRU.x1, zArkaDis], b: [KOPRU.x1, zTasIc], kaydir: 0.45, deger: KOPRU_BOY, kaynak: 'model' },
    { a: [KOPRU.x0, zTasDis], b: [KOPRU.x1, zTasDis], kaydir: -0.4, deger: DENEME.kopruEn, kaynak: 'deneme' },
    { a: [KOPRU.x1, zTasIc], b: [KOPRU.x1, zTasDis], kaydir: 0.45, deger: zTasIc - zTasDis, kaynak: 'model' },
    { a: [bas8[0] - DENEME.baslangicPayi, zArkaIc], b: [bas8[0] - DENEME.baslangicPayi, zArkaIc + OLUK], kaydir: 0.25, deger: OLUK, kaynak: 'model' },
  ],
  etiketler: [
    { n: [kopruOrta - 0.25, zArkaIc + OLUK + 0.3], metin: 'maket.sema.sektirme', hiza: 'sag' },
    { n: [KOPRU.x0 - 0.15, -69.3], metin: 'maket.sema.kopru', hiza: 'sag' },
    { n: [KOPRU.x0 - 0.15, -69.65], metin: 'maket.sema.kopruInis', deger: KOPRU_INIS, metre: true, hiza: 'sag' },
    { n: [KOPRU.x0 - 0.15, -70.0], metin: 'maket.sema.kopruAcik', hiza: 'sag' },
    { n: [57.6, -70.9], metin: 'maket.sema.koridorAsagida', hiza: 'orta' },
    { n: [57.4, (zTasIc + zTasDis) / 2 + 0.07], metin: 'maket.sema.tasDuvar', hiza: 'orta' },
    { n: [58.5, (zArkaIc + zArkaDis) / 2 + 0.07], metin: 'maket.sema.arkaDuvar', hiza: 'orta' },
    { n: [KOPRU.x0 - 0.15, (zTasIc + zTasDis) / 2 + 0.07], metin: 'maket.sema.sahanlik', hiza: 'sag' },
    { n: [(MODEL.bMerdivenX0 + MODEL.yanDuvarX0) / 2, -67.3], metin: 'maket.sema.merdivenKisa', hiza: 'orta' },
  ],
  // Atış anı: ikinci vuruş, top köprünün üstünde; nişan dümdüz duvarın üstündeki deliğe
  atis: { top: [kopruOrta, kopruY(-70.4), -70.4], yon: [0, -1], boy: 1.0 },
};

// ---------- 9 · Duvar içi koridor (nefes): köprünün altından, taş duvardan sekip tribünün köşesini dön ----------
const kose9: N2 = [MODEL.yanDuvarX1, zArkaDis]; // tribünün B ucundaki arka köşesi
const bas9: N2 = [KOPRU_AYAK[0] - DENEME.koridorBaslangic, KOPRU_AYAK[1]];
const cepX1 = kose9[0] + DENEME.koridorCepBoy;
const cepZ1 = kose9[1] + DENEME.koridorCepDerinlik;
const cukur9: N2 = [kose9[0] + 1.4, cepZ1 - 0.6];
// Önerilen yol: taş duvardan tek sekme. Deliğin duvara göre aynası başlangıçla birleştirilince duvarı kestiği yer.
const zSek = zTasIc + TOP_YARICAP;
const sek9: N2 = [bas9[0] + ((cukur9[0] - bas9[0]) * (bas9[1] - zSek)) / (bas9[1] - zSek + (cukur9[1] - zSek)), zSek];
export const KORIDOR_EN = zArkaDis - zTasIc; // 3,1 m (model)
const ay = DENEME.kopruAyak / 2;
// Taş duvarın dibindeki taş sırası (duvardan dökülmüş, dibe dizilmiş taşlar; modelde ve künyede yok: DENEME,
// Kemal onaylamadı). Taşlar düzensiz: üstlerine gelen top düzgün sekmez. Sırada tek boşluk var; top duvardan
// yalnız oradan temiz seker. Taşların eni, derinliği ve boyu sabit bir diziden (rastgele değil).
const tasBosluk: [number, number] = [sek9[0] - DENEME.tasSirasiBosluk / 2, sek9[0] + DENEME.tasSirasiBosluk / 2];
export const TAS_SIRASI = ((): { x0: number; x1: number; derinlik: number; boy: number; ton: number }[] => {
  const enler = [0.42, 0.34, 0.5, 0.38, 0.46, 0.36];
  const derinlikler = [1, 0.8, 0.93, 0.73, 0.87, 0.97];
  const boylar = [0.22, 0.16, 0.26, 0.18, 0.24, 0.2];
  const liste: { x0: number; x1: number; derinlik: number; boy: number; ton: number }[] = [];
  let x = bas9[0] - DENEME.baslangicPayi;
  for (let i = 0; x < cepX1 - 0.05; i++) {
    const x1 = Math.min(x + enler[i % 6], cepX1);
    // Boşluğa giren taş konmaz.
    if (x1 <= tasBosluk[0] || x >= tasBosluk[1]) liste.push({ x0: x, x1, derinlik: DENEME.tasSirasiDerinlik * derinlikler[i % 6], boy: boylar[i % 6], ton: i % 4 });
    x = x1 + 0.03;
  }
  return liste;
})();
const c9 = { x0: 57.6, x1: 65.4, z0: -72.6, z1: -66.0 };
// Atış anı: ilk vuruş; nişan taş sırasındaki boşluğa, taş duvara.
const ara9: N2 = bas9;
const yon9 = ((): N2 => {
  const dx = sek9[0] - ara9[0];
  const dz = sek9[1] - ara9[1];
  const b = Math.hypot(dx, dz);
  return [dx / b, dz / b];
})();

const koridor: OrnekDelik = {
  no: 9,
  zorluk: 'maket.zorluk.kolay',
  eksen: 'x',
  // İki yan kenarsız: sınır tribünün arka duvarı ve taş duvarın kendisi. Kiremit kenar yalnız açık uçlarda.
  bordurler: [
    { y: 0, noktalar: [[bas9[0] - DENEME.baslangicPayi, zArkaDis], [bas9[0] - DENEME.baslangicPayi, zTasIc]] },
    { y: 0, noktalar: [[kose9[0], cepZ1], [cepX1, cepZ1], [cepX1, zTasIc]] },
  ],
  dis: [
    [bas9[0] - DENEME.baslangicPayi, zArkaDis],
    [kose9[0], zArkaDis],
    [kose9[0], cepZ1],
    [cepX1, cepZ1],
    [cepX1, zTasIc],
    [bas9[0] - DENEME.baslangicPayi, zTasIc],
  ],
  baslangic: [bas9[0], 0, bas9[1]],
  cukur: [cukur9[0], 0, cukur9[1]],
  cerceve: c9,
  alanlar: [{ renk: '#C8C0AF', x0: c9.x0, x1: MODEL.yanDuvarX0, z0: zArkaIc, z1: c9.z1 }], // tribün (beton)
  cizgiler: [],
  kutular: [
    { tur: 'duvar', x0: c9.x0, x1: KOPRU.x0, z0: zArkaDis, z1: zArkaIc },
    { tur: 'duvar', x0: KOPRU.x1, x1: MODEL.yanDuvarX0, z0: zArkaDis, z1: zArkaIc },
    { tur: 'duvar', x0: MODEL.yanDuvarX0, x1: MODEL.yanDuvarX1, z0: zArkaIc, z1: c9.z1 },
    { tur: 'tas', x0: c9.x0, x1: c9.x1, z0: zTasDis, z1: zTasIc },
    ...KOPRU_AYAKLAR.map((a) => ({ tur: 'ayak' as const, x0: a[0] - ay, x1: a[0] + ay, z0: a[1] - ay, z1: a[1] + ay })),
    ...TAS_SIRASI.map((t) => ({ tur: 'tas' as const, x0: t.x0, x1: t.x1, z0: zTasIc, z1: zTasIc + t.derinlik })),
  ],
  // Köprü üstte: şemada iki kenarı kesik çizgiyle (top altından geçer).
  acikKenarlar: [
    [[KOPRU.x0, zArkaIc], [KOPRU.x0, zTasDis]],
    [[KOPRU.x1, zArkaIc], [KOPRU.x1, zTasDis]],
  ],
  yollar: [[bas9, sek9, cukur9]],
  olculer: [
    { a: [bas9[0] - DENEME.baslangicPayi, zArkaDis], b: [bas9[0] - DENEME.baslangicPayi, zTasIc], kaydir: -0.4, deger: KORIDOR_EN, kaynak: 'model' },
    { a: [bas9[0], zArkaDis], b: [KOPRU_AYAK[0], zArkaDis], kaydir: 0.75, deger: DENEME.koridorBaslangic, kaynak: 'deneme' },
    { a: [kose9[0], cepZ1], b: [cepX1, cepZ1], kaydir: 0.4, deger: DENEME.koridorCepBoy, kaynak: 'deneme' },
    { a: [cepX1, zArkaDis], b: [cepX1, cepZ1], kaydir: -0.4, deger: DENEME.koridorCepDerinlik, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [61.6, (zTasIc + zTasDis) / 2 + 0.07], metin: 'maket.sema.tasDuvar', hiza: 'orta' },
    { n: [58.3, (zArkaIc + zArkaDis) / 2 + 0.07], metin: 'maket.sema.arkaDuvar', hiza: 'orta' },
    { n: [KOPRU_AYAK[0] - 0.5, -69.5], metin: 'maket.sema.kopruAyagi', hiza: 'orta' },
    { n: [sek9[0] - 0.25, zTasIc + 0.1], metin: 'maket.sema.tasBosluk', hiza: 'sol' },
    { n: [62.6, zTasIc + 0.55], metin: 'maket.sema.tasSirasi', hiza: 'orta' },
    { n: [KOPRU.x1 + 0.13, -69.3], metin: 'maket.sema.kopruUstte', hiza: 'orta' },
    { n: [kose9[0] - 0.25, zArkaDis + 0.75], metin: 'maket.sema.tribunKosesi', hiza: 'sag' },
    { n: [63.5, -70.2], metin: 'maket.sema.toprak', hiza: 'orta' },
  ],
  // Atış anı: ilk vuruş; nişan taş sırasındaki boşluktan taş duvara
  atis: { top: [ara9[0], 0, ara9[1]], yon: yon9, boy: 1.2 },
};

// Tur sırasıyla. Yeni dille çizilen delikler: 1–9 ve 14; kalan 8 delik eski dilde.
export const ORNEK_DELIKLER: OrnekDelik[] = [ortaYuvarlak, kenarCizgisi, kale, koseDeligi, penalti, tribunOnu, tribun, kopru, koridor, dus];
export const KALAN_DELIK_SAYISI = 18 - ORNEK_DELIKLER.length;
export const ornekDelik = (no: number): OrnekDelik => ORNEK_DELIKLER.find((d) => d.no === no) ?? kale;
