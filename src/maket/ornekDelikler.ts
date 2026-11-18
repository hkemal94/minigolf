import type { MetinAnahtari } from '../metinler';
import { IFAB, WMF, MODEL, DENEME } from './olculer';

// ÖRNEK DELİKLER (öneri; Kemal, 18 Kasım 2026): üç delik yeni dille. Pist gerçek minigolf ölçüsünde,
// zemin mekânın kendi zemini, sınır ince bordür; bulmacayı yerin şekli, eğimi ve eşyası kurar.
// Koordinatlar 3B modelin koordinatları (x, z; metre). Aynı veri hem 3B makette hem üstten şemada kullanılır.

export type N2 = [number, number]; // x, z
export type N3 = [number, number, number];
export type Kaynak = 'ifab' | 'wmf' | 'model' | 'deneme';

export type Olcu = { a: N2; b: N2; kaydir: number; deger: number; kaynak: Kaynak };
export type Dikdortgen = { x0: number; x1: number; z0: number; z1: number };
export type Etiket = { n: N2; metin: MetinAnahtari; deger?: number; hiza?: 'sol' | 'sag' | 'orta' };

export type OrnekDelik = {
  no: 3 | 7 | 14;
  zorluk: MetinAnahtari;
  eksen: 'x' | '-x' | 'z'; // deliğin uzun ekseni ekranda dikey; başlangıç altta kalacak yön
  bordurler: { noktalar: N2[]; y: number }[];
  baslangic: N3;
  cukur: N3;
  // Şemada: çerçeve, zemin çizgileri, eşyalar
  cerceve: Dikdortgen;
  cizgiler: { a: N2; b: N2; tur: 'saha' | 'basamak' | 'merdiven' | 'ag' }[];
  kutular: (Dikdortgen & { tur: 'direk' | 'tahta' | 'bolme' | 'duvar' })[];
  birikinti?: { n: N2; r: number };
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
  cukur: [-1.25, 0.05, uz - 0.3],
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
  atis: { top: [0, 0.05, MODEL.kaleSahasiCizgisiZ], yon: [0.035, 0.9994], boy: 5.2 },
};

// ---------- 7 · Açık tribün sıraları: zemin tribünün beton basamağı ----------
const D = MODEL.basamakDerinlik;
const H = MODEL.basamakYukseklik;
export const siraOn = (k: number) => MODEL.acikTribunOnZ - D * (k - 1); // sıranın sahaya bakan kenarı
export const siraArka = (k: number) => siraOn(k) - D;
export const siraY = (k: number) => H * k;
// Tribünün ortasındaki taş merdiven (modelde var): x 44,4–45,6, bütün sıraları keser.
export const MERDIVEN_X0 = 44.4;
export const MERDIVEN_X1 = 45.6;
const MERDIVEN_PAY = 0.03; // merdiven taşı basamaktan 3 cm yüksek (model)
export const TRIBUN_X1 = 48.15;
export const TRIBUN_X0 = TRIBUN_X1 - WMF.minyaturBoy; // pistin boyu 6,25 m (minyatür norm pist)
const X0 = TRIBUN_X0;
const X1 = TRIBUN_X1;
const A0 = MERDIVEN_X0;
const A1 = MERDIVEN_X1;
// Pistte bırakılan iki oturma tahtası parçası (yerin eşyası; pistin ön yanını kapatır, arkada dar geçit kalır).
const ENGEL_TAHTALAR = [
  { sira: 5, x0: 46.0, x1: 46.9 },
  { sira: 3, x0: 43.2, x1: 44.0 },
];
// 3B makette çizilen tahtalar: engeller ve pistin dışında kalan (modelden kesilip yerine konan) parçalar.
export const TRIBUN_TAHTALAR = [
  ...ENGEL_TAHTALAR,
  { sira: 5, x0: X0, x1: A0 },
  { sira: 4, x0: X0, x1: A0 },
  { sira: 4, x0: A1, x1: X1 },
  { sira: 3, x0: A1, x1: X1 },
];
export const tahtaZ = (k: number): [number, number] => [siraOn(k) - MODEL.tahtaOndenBosluk - MODEL.tahtaEn, siraOn(k) - MODEL.tahtaOndenBosluk];
const arkaGecit = D - MODEL.tahtaOndenBosluk - MODEL.tahtaEn; // tahtanın arkasında kalan boşluk: 0,35 m

const tribun: OrnekDelik = {
  no: 7,
  zorluk: 'maket.zorluk.zor',
  eksen: '-x',
  bordurler: [
    // 5. sıra (üst): ön kenar ve doğu ucu; merdivenin içinde 45° köşe topu aşağı çevirir
    { y: siraY(5), noktalar: [[A1, siraOn(5)], [X1, siraOn(5)], [X1, siraArka(5)]] },
    { y: siraY(5) + MERDIVEN_PAY, noktalar: [[A0 + D, siraArka(5)], [A0, siraOn(5)]] },
    // merdiven, 4. sıra hizası: iki yan
    { y: siraY(4) + MERDIVEN_PAY, noktalar: [[A0, siraOn(5)], [A0, siraOn(4)]] },
    { y: siraY(4) + MERDIVEN_PAY, noktalar: [[A1, siraOn(5)], [A1, siraOn(4)]] },
    // merdiven, 3. sıra hizası: doğu yanı ve ön kenar; sonra 3. sıra batıya
    { y: siraY(3) + MERDIVEN_PAY, noktalar: [[A1, siraOn(4)], [A1, siraOn(3)], [A0, siraOn(3)]] },
    { y: siraY(3), noktalar: [[A0, siraOn(3)], [X0, siraOn(3)], [X0, siraArka(3)]] },
  ],
  baslangic: [X1 - 0.55, siraY(5), siraArka(5) + 0.2],
  cukur: [X0 + 0.6, siraY(3), siraOn(3) - D / 2],
  cerceve: { x0: X0 - 1.0, x1: X1 + 1.0, z0: siraArka(5) - 1.2, z1: siraOn(3) + 1.2 },
  cizgiler: [
    ...[3, 4, 5, 6].map((k) => ({ a: [X0 - 1.0, siraOn(k)] as N2, b: [X1 + 1.0, siraOn(k)] as N2, tur: 'basamak' as const })),
    { a: [A0, siraArka(5) - 1.2], b: [A0, siraOn(3) + 1.2], tur: 'merdiven' },
    { a: [A1, siraArka(5) - 1.2], b: [A1, siraOn(3) + 1.2], tur: 'merdiven' },
  ],
  kutular: ENGEL_TAHTALAR.map((t) => ({ tur: 'tahta' as const, x0: t.x0, x1: t.x1, z0: tahtaZ(t.sira)[0], z1: tahtaZ(t.sira)[1] })),
  olculer: [
    { a: [X0, siraOn(3)], b: [X1, siraOn(3)], kaydir: 0.55, deger: WMF.minyaturBoy, kaynak: 'wmf' },
    { a: [X1, siraArka(5)], b: [X1, siraOn(5)], kaydir: -0.35, deger: MODEL.basamakDerinlik, kaynak: 'model' },
    { a: [A0, siraArka(5)], b: [A1, siraArka(5)], kaydir: -0.45, deger: A1 - A0, kaynak: 'model' },
    { a: [43.6, siraArka(3)], b: [43.6, siraArka(3) + arkaGecit], kaydir: 0.75, deger: arkaGecit, kaynak: 'model' },
  ],
  etiketler: [
    { n: [45, siraOn(5) + 0.42], metin: 'maket.sema.dusus', hiza: 'orta' },
    { n: [45, siraOn(4) + 0.42], metin: 'maket.sema.dusus', hiza: 'orta' },
    { n: [45.52, siraOn(3) + 0.8], metin: 'maket.sema.merdiven', hiza: 'orta' },
    { n: [46.45, siraOn(5) + 0.25], metin: 'maket.sema.tahta', hiza: 'sol' },
    { n: [X1 + 0.75, siraOn(5) - D / 2], metin: 'maket.sema.sira', deger: 5, hiza: 'orta' },
    { n: [X1 + 0.75, siraOn(4) - D / 2], metin: 'maket.sema.sira', deger: 4, hiza: 'orta' },
    { n: [X1 + 0.75, siraOn(3) - D / 2], metin: 'maket.sema.sira', deger: 3, hiza: 'orta' },
    { n: [X0 - 0.6, siraOn(4)], metin: 'maket.sema.basamakYukseklik', deger: MODEL.basamakYukseklik, hiza: 'orta' },
  ],
  // Nişan: tahtanın arkasındaki dar geçitten, merdivendeki köşeye
  atis: { top: [X1 - 0.55, siraY(5), siraArka(5) + 0.2], yon: [-1, 0], boy: 2.4 },
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
  atis: { top: [0.6, 0, 0.75], yon: [0.6, 0.8], boy: 1.75 },
};

export const ORNEK_DELIKLER: OrnekDelik[] = [kale, tribun, dus];
export const ornekDelik = (no: number): OrnekDelik => ORNEK_DELIKLER.find((d) => d.no === no) ?? kale;
