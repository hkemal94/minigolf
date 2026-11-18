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
  kutular: (Dikdortgen & { tur: 'direk' | 'koltuk' | 'koltukAcik' | 'bolme' | 'duvar' })[];
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

export const ORNEK_DELIKLER: OrnekDelik[] = [kale, tribun, dus];
export const ornekDelik = (no: number): OrnekDelik => ORNEK_DELIKLER.find((d) => d.no === no) ?? kale;
