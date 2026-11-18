import type { MetinAnahtari } from '../metinler';
import { IFAB, WMF, MODEL, DENEME, TOP_YARICAP } from './olculer';

// YENİ DİLLE DELİKLER (öneri; Kemal, 18 Kasım 2026): önce üç örnek (3, 7, 14), sonra adım adım öbürleri
// (tasarım belgesi 4.9). Adım 1: 1, 2, 4, 5 (saha, çim). Pist gerçek minigolf ölçüsünde,
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
  cizgiler: { a: N2; b: N2; tur: 'saha' | 'basamak' | 'merdiven' | 'ag' }[];
  kutular: (Dikdortgen & { tur: 'direk' | 'koltuk' | 'koltukAcik' | 'bolme' | 'duvar' })[];
  birikinti?: { n: N2; r: number };
  // Yere boyanmış yuvarlak işaretler (penaltı noktası)
  noktalar?: { n: N2; r: number }[];
  // Önerilen yol (şemada kesik lacivert çizgi; oynanışta çizilmez). İkincisi varsa: başka bir örnek yol.
  yollar?: N2[][];
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
      y: 0.04,
      noktalar: [
        [-G / 2, yk],
        [-G / 2, kaleBas],
        [G / 2, kaleBas],
        [G / 2, koseBas],
        [0, uz + 0.07],
      ],
    },
  ],
  baslangic: [0, 0.05, MODEL.kaleSahasiCizgisiZ],
  cukur: [-1.25, 0.045, uz - 0.3],
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
  atis: { top: [0, 0.05, MODEL.kaleSahasiCizgisiZ], yon: [0.035, 0.9994], boy: 1.3 },
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
// Sahanın çizgileri modelden (IFAB ölçüleriyle çizilmiş); modelde olmayan köşe yayı, köşe bayrağı ve
// penaltı noktası IFAB ölçüsüyle kodla çizilir (OrnekDelik.tsx). Pist eni hepsinde 1,25 m (WMF beton pist).
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
export const YAY_BOYU = R * yayAci; // 9,58 m: keçe norm pistin aralığında (9–18 m)
const y0 = -DENEME.baslangicPayi / R;
const y1 = yayAci + DENEME.delikPayi / R;
const ortaBas = oy(R, 0);
const ortaCukur = oy(R, yayAci);
// Önerilen yol: top dış kenara bir kez yaslanır (yarı yolda, 30°), kavisle deliğe döner.
const ortaSekme = oy(R + h - TOP_YARICAP, yayAci / 2);

const ortaYuvarlak: OrnekDelik = {
  no: 1,
  zorluk: 'maket.zorluk.enKolay',
  eksen: '-x',
  bordurler: [{ y: yCim, noktalar: [...yay(R + h, y0, y1), ...yay(R - h, y1, y0), oy(R + h, y0)] }],
  baslangic: [ortaBas[0], yCizgi, ortaBas[1]],
  cukur: [ortaCukur[0], yCizgi - 0.003, ortaCukur[1]],
  cerceve: { x0: 35.5, x1: 46.5, z0: -39.7, z1: -32.1 },
  cizgiler: [
    { a: [ORTA[0], -39.7], b: [ORTA[0], -32.1], tur: 'saha' }, // orta çizgi
    ...parcala(yay(R, -0.17, 1.2, 40)), // orta yuvarlak
  ],
  kutular: [],
  noktalar: [],
  yollar: [[ortaBas, ortaSekme, ortaCukur]],
  olculer: [
    { a: oy(R - h, y1), b: oy(R + h, y1), kaydir: -0.4, deger: WMF.betonEn, kaynak: 'wmf' },
  ],
  etiketler: [
    { n: [42.0, -34.3], metin: 'maket.sema.yayBoyu', deger: YAY_BOYU, metre: true, hiza: 'orta' },
    { n: [42.5, -34.3], metin: 'maket.sema.yaricap', deger: IFAB.ortaYuvarlakYaricap, metre: true, hiza: 'orta' },
    { n: [ortaSekme[0] + 0.1, ortaSekme[1] + 1.75], metin: 'maket.sema.disKenar', hiza: 'sag' },
    { n: [ORTA[0] - 0.2, -34.3], metin: 'maket.sema.ortaCizgi', hiza: 'orta' },
    { n: [46.2, -37.75], metin: 'maket.sema.ortaYuvarlak', hiza: 'sag' },
  ],
  // Nişan: dış kenara, yarı yola (yaklaşık 8° dışa)
  atis: { top: [ortaBas[0], yCizgi, ortaBas[1]], yon: [-0.9903, 0.1387], boy: 1.3 },
};

// ---------- 2 · Kenar çizgisi: pist sahanın içinden taç çizgisine iner; ucu açık ----------
const X2 = MODEL.sahaBoy / 4; // A yarısının ortası (22,5); yeri DENEME
const zTac = MODEL.tacCizgisiZ;
const tacBas = zTac + WMF.minyaturBoy; // başlangıç taç çizgisinden 6,25 m içeride (minyatür norm pist boyu)
const tacCukurZ = zTac + DENEME.tacPayi;

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
  kutular: [],
  yollar: [[[X2, tacBas], [X2, tacCukurZ]]],
  olculer: [
    { a: [X2 + h, tacBas], b: [X2 + h, zTac], kaydir: 0.45, deger: WMF.minyaturBoy, kaynak: 'wmf' },
    { a: [X2 - h, tacBas + DENEME.baslangicPayi], b: [X2 + h, tacBas + DENEME.baslangicPayi], kaydir: 0.4, deger: WMF.betonEn, kaynak: 'wmf' },
    { a: [X2 - h, tacCukurZ], b: [X2 - h, zTac], kaydir: -0.45, deger: DENEME.tacPayi, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [X2 + 0.85, zTac - 0.2], metin: 'maket.sema.tacCizgisi', hiza: 'sol' },
    { n: [X2, zTac - 0.75], metin: 'maket.sema.acikUc', hiza: 'orta' },
    { n: [X2 - 1.6, tacBas - 1.6], metin: 'maket.sema.sahaIci', hiza: 'orta' },
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
  kutular: [{ tur: 'direk', x0: KOSE[0] - 0.06, x1: KOSE[0] + 0.06, z0: KOSE[1] - 0.06, z1: KOSE[1] + 0.06 }],
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

// ---------- 5 · Penaltı noktası (nefes): ceza sahası çizgisinden noktaya; delik noktanın kendisi ----------
const zKale = -MODEL.sahaEn / 2; // iki direğin ortası (z = -29)
const penBas: N2 = [IFAB.cezaSahasi, zKale];
export const PENALTI: N2 = [IFAB.penaltiNoktasi, zKale];
// Arka kenar elips: odakları başlangıç işareti ile delik. Başlangıçtan çıkıp bu kenara değen her top
// deliğe döner (elipsin odak özelliği). Genişliği delik hizasında pistin eni olacak biçimde seçildi.
const eC = (penBas[0] - PENALTI[0]) / 2; // odak yarı aralığı 2,75
const eA = (h + Math.sqrt(h * h + 4 * eC * eC)) / 2; // büyük yarı eksen
const eB = Math.sqrt(eA * eA - eC * eC);
const eT = Math.acos(eC / eA);
const elips = (t: number): N2 => [(penBas[0] + PENALTI[0]) / 2 - eA * Math.cos(t), zKale + eB * Math.sin(t)];
export const KAVIS_DERINLIK = eA - eC; // deliğin arkasında kalan pay (0,33 m)
const penArka = penBas[0] + DENEME.baslangicPayi;

const penalti: OrnekDelik = {
  no: 5,
  zorluk: 'maket.zorluk.kolay',
  eksen: '-x',
  bordurler: [
    {
      y: yCim,
      noktalar: [
        [penArka, zKale + h],
        [penArka, zKale - h],
        ...Array.from({ length: 17 }, (_, i) => elips(-eT + (2 * eT * i) / 16)),
        [penArka, zKale + h],
      ],
    },
  ],
  baslangic: [penBas[0], yCizgi, penBas[1]],
  cukur: [PENALTI[0], yCim + 0.005, PENALTI[1]],
  cerceve: { x0: 9.5, x1: 18.1, z0: zKale - 2.25, z1: zKale + 2.25 },
  cizgiler: [{ a: [IFAB.cezaSahasi, zKale - 2.25], b: [IFAB.cezaSahasi, zKale + 2.25], tur: 'saha' }],
  kutular: [],
  noktalar: [{ n: PENALTI, r: DENEME.penaltiNoktasiCap / 2 }],
  yollar: [
    [penBas, PENALTI],
    [penBas, elips(eT * 0.62), PENALTI],
  ],
  olculer: [
    { a: [penBas[0], zKale + h], b: [PENALTI[0], zKale + h], kaydir: -0.5, deger: IFAB.cezaSahasi - IFAB.penaltiNoktasi, kaynak: 'ifab' },
    { a: [penArka, zKale - h], b: [penArka, zKale + h], kaydir: -0.4, deger: WMF.betonEn, kaynak: 'wmf' },
    { a: [PENALTI[0], zKale - h], b: [PENALTI[0] - KAVIS_DERINLIK, zKale - h], kaydir: 0.45, deger: KAVIS_DERINLIK, kaynak: 'deneme' },
  ],
  etiketler: [
    { n: [PENALTI[0] - 0.85, zKale], metin: 'maket.sema.penaltiNoktasi', hiza: 'orta' },
    { n: [PENALTI[0] - 0.3, zKale + 0.75], metin: 'maket.sema.kavis', hiza: 'sag' },
    { n: [IFAB.cezaSahasi + 0.25, zKale - 1.5], metin: 'maket.sema.cezaCizgisi', hiza: 'orta' },
    { n: [IFAB.cezaSahasi - 2.2, zKale - 1.55], metin: 'maket.sema.cezaSahasi', hiza: 'orta' },
  ],
  // Atış anı: ikinci vuruş, top noktaya 1,3 m; doğrudan deliğe
  atis: { top: [12.28, yCim, zKale + 0.25], yon: [-0.9815, -0.1917], boy: 1.0 },
};

// Tur sırasıyla. Yeni dille çizilen delikler: 1, 2, 3, 4, 5, 7, 14; kalan 11 delik eski dilde.
export const ORNEK_DELIKLER: OrnekDelik[] = [ortaYuvarlak, kenarCizgisi, kale, koseDeligi, penalti, tribun, dus];
export const KALAN_DELIK_SAYISI = 18 - ORNEK_DELIKLER.length;
export const ornekDelik = (no: number): OrnekDelik => ORNEK_DELIKLER.find((d) => d.no === no) ?? kale;
