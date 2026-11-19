import { DENEME, GOLF, IFAB, MODEL, TOP_YARICAP } from '../maket/olculer';
import { ornekDelik, siraArka, siraOn, siraY, koltukZ, TRIBUN_X0, TRIBUN_X1, type N2, type OrnekDelik } from '../maket/ornekDelikler';
import { FIZIK, GORUNTU } from './ayarlar';
import { duvar, kutu, type Dunya, type Kutu } from './fizik';

// OYNANABİLİR PROTOTİP · deliklerin fizik dünyası. Deliklerin yeri ve ölçüsü yeniden yazılmaz:
// maketin verisinden (src/maket/ornekDelikler.ts) okunur; burada yalnız o veriden çarpılacak
// kutular kurulur. Delik verisi değişirse oyun da kendiliğinden değişir.

export type OyunDeligi = {
  no: number;
  veri: OrnekDelik;
  dunya: Dunya;
  baslangic: [number, number, number]; // topun merkezi
  // Çizim için: bordürler (yükseklikleri zemine oturtulmuş), deliğin zemini
  bordurler: { noktalar: N2[]; y: number }[];
  zeminY: number; // deliğin bulunduğu zeminin yüksekliği
  baslangicY: number;
  // Oyun yönü (x, z): küçük planda yukarı bakan yön.
  yon: N2;
  // Kameranın başta baktığı yön (x, z): topun arkasından, biraz yandan (maketteki bakış; DENEME).
  bakis: N2;
  // Top ve işaretler çizilirken bu kadar yukarıda (çimde saha çizgisinin üstünde kalsın diye).
  kaldirma: number;
  // Küçük planın çerçevesi
  cerceve: { x0: number; x1: number; z0: number; z1: number };
};

const cimSurtunme = FIZIK.cimYavaslama / FIZIK.yercekimi;
const betonSurtunme = FIZIK.betonYavaslama / FIZIK.yercekimi;
const YONLER: Record<OrnekDelik['eksen'], N2> = { x: [1, 0], '-x': [-1, 0], z: [0, 1], '-z': [0, -1] };
// Kameranın başlangıç yönü: maketin delik ekranındaki bakışla aynı (src/maket/OrnekDelik.tsx, BAKISLAR; DENEME).
const BAKISLAR: Record<number, N2> = { 1: [-13.3, -1.5], 3: [-5.5, 12.3], 7: [-11.2, -2.45] };

function bordurKutulari(noktalar: N2[], y: number): Kutu[] {
  return noktalar.slice(0, -1).map((a, i) => duvar(a, noktalar[i + 1], y, y + DENEME.bordurYukseklik, DENEME.bordurEn, FIZIK.bordurSekme, FIZIK.duvarSurtunme));
}

function sinir(noktalar: N2[], pay: number) {
  const xs = noktalar.map((n) => n[0]);
  const zs = noktalar.map((n) => n[1]);
  return { x0: Math.min(...xs) - pay, x1: Math.max(...xs) + pay, z0: Math.min(...zs) - pay, z1: Math.max(...zs) + pay };
}

// Sahadaki delikler (1, 3): zemin sahanın çimi, tek düzey (model 19 Kasım 2026: çim 0'da).
function cimDeligi(no: number): OyunDeligi {
  const veri = ornekDelik(no);
  const y = 0;
  const bordurler = veri.bordurler.map((b) => ({ noktalar: b.noktalar, y }));
  const kutular: Kutu[] = [];
  // Çim: geniş tek kutu (üstü 0); delik bunun içinde.
  const [cx, , cz] = veri.cukur;
  kutular.push(kutu(cx - 40, cx + 40, cz - 40, cz + 40, -3, y, FIZIK.cimZeminSekme, cimSurtunme, true));
  for (const b of bordurler) kutular.push(...bordurKutulari(b.noktalar, y));
  const aglar = veri.cizgiler.filter((c) => c.tur === 'ag');
  for (const a of aglar) kutular.push(duvar(a.a, a.b, y, y + IFAB.kaleYukseklik, FIZIK.agKalinlik, FIZIK.agSekme, 0.5));
  for (const k of veri.kutular) {
    if (k.tur === 'direk') kutular.push(kutu(k.x0, k.x1, k.z0, k.z1, y, y + GORUNTU.direkBoy, FIZIK.direkSekme, FIZIK.duvarSurtunme));
    else if (k.tur === 'huni') kutular.push(kutu(k.x0, k.x1, k.z0, k.z1, y, y + GORUNTU.huniBoy, FIZIK.esyaSekme, FIZIK.duvarSurtunme));
  }
  const alan = sinir([...bordurler.flatMap((b) => b.noktalar), ...aglar.flatMap((a) => [a.a, a.b])], 0.3);
  const icerde = (x: number, yy: number, z: number) => x > alan.x0 && x < alan.x1 && z > alan.z0 && z < alan.z1 && yy > y - 0.5;
  const dunya: Dunya = {
    kutular,
    delik: { x: cx, y, z: cz, yaricap: GOLF.delikCap / 2, derinlik: FIZIK.delikDerinlik },
    topYaricap: TOP_YARICAP,
    icerde,
    pistte: icerde,
  };
  return {
    no,
    veri,
    dunya,
    baslangic: [veri.baslangic[0], y + TOP_YARICAP, veri.baslangic[2]],
    bordurler,
    zeminY: y,
    baslangicY: y,
    yon: YONLER[veri.eksen],
    bakis: BAKISLAR[no] ?? YONLER[veri.eksen],
    kaldirma: GORUNTU.cimKaldirma,
    cerceve: sinir([...bordurler.flatMap((b) => b.noktalar), ...aglar.flatMap((a) => [a.a, a.b])], 0.25),
  };
}

// 7 · Açık tribün sıraları: zemin beton basamaklar; koltuklar engel, boş koltuktan alt sıraya düşülür.
export const TRIBUN_SIRALARI = [5, 4, 3]; // pistin geçtiği sıralar, yukarıdan aşağı
function tribunDeligi(): OyunDeligi {
  const veri = ornekDelik(7);
  const kutular: Kutu[] = [];
  const delikSira = 3;
  // Basamaklar: her biri kendi üst düzeyine kadar dolu kutu. Alt sıradaki top için bir üst basamağın alnı duvardır.
  for (let k: number = MODEL.acikTribunSira; k >= 1; k--) {
    kutular.push(kutu(MODEL.acikTribunX0, MODEL.acikTribunX1, siraArka(k), siraOn(k), -1, siraY(k), FIZIK.betonZeminSekme, betonSurtunme, k === delikSira));
  }
  for (const b of veri.bordurler) kutular.push(...bordurKutulari(b.noktalar, b.y));
  // Koltuklar: oturak (alçak, dolu) ve sırtlık (ince, yüksek). Top hızlıysa sırtlığın üstünden aşabilir.
  for (const k of veri.kutular) {
    if (k.tur !== 'koltuk' && k.tur !== 'koltukAcik') continue;
    const sira = TRIBUN_SIRALARI.find((s) => Math.abs(koltukZ(s)[0] - k.z0) < 1e-6);
    if (sira === undefined) continue;
    const y = siraY(sira);
    kutular.push(kutu(k.x0, k.x1, k.z0, k.z1, y, y + MODEL.tahtaKalinlik, FIZIK.esyaSekme, FIZIK.duvarSurtunme));
    kutular.push(kutu(k.x0 + 0.035, k.x1 - 0.035, k.z0 + 0.005, k.z0 + 0.055, y, y + MODEL.tahtaKalinlik + DENEME.koltukSirt, FIZIK.esyaSekme, FIZIK.duvarSurtunme));
  }
  const [cx, cy, cz] = veri.cukur;
  const alan = { x0: TRIBUN_X0 - 0.4, x1: TRIBUN_X1 + 0.4, z0: siraArka(5) - 0.3, z1: siraOn(delikSira) + 0.03 };
  const icerde = (x: number, y: number, z: number) => x > alan.x0 && x < alan.x1 && z > alan.z0 && z < alan.z1 && y > siraY(delikSira) - 0.3;
  // Top yalnız basamağın betonunda durursa oyunda kalır (koltuğun üstünde durduysa dışarı).
  const pistte = (x: number, y: number, z: number) => icerde(x, y, z) && TRIBUN_SIRALARI.some((s) => Math.abs(y - TOP_YARICAP - siraY(s)) < 0.01);
  const dunya: Dunya = {
    kutular,
    delik: { x: cx, y: cy, z: cz, yaricap: GOLF.delikCap / 2, derinlik: FIZIK.delikDerinlik },
    topYaricap: TOP_YARICAP,
    icerde,
    pistte,
  };
  return {
    no: 7,
    veri,
    dunya,
    baslangic: [veri.baslangic[0], veri.baslangic[1] + TOP_YARICAP, veri.baslangic[2]],
    bordurler: veri.bordurler,
    zeminY: cy,
    baslangicY: veri.baslangic[1],
    yon: YONLER[veri.eksen],
    bakis: BAKISLAR[7],
    kaldirma: 0,
    cerceve: { x0: TRIBUN_X0 - 0.3, x1: TRIBUN_X1 + 0.3, z0: siraArka(5) - 0.2, z1: siraOn(delikSira) + 0.2 },
  };
}

// Oynanabilir delikler, oynanış sırasıyla (Kems, 19 Kasım 2026): 3 (kale), 1 (orta yuvarlak), 7 (tribün).
export const OYUN_SIRASI = [3, 1, 7];

export function oyunDeligi(no: number): OyunDeligi {
  return no === 7 ? tribunDeligi() : cimDeligi(no);
}
