import { PUAN } from './ayarlar';

// Par, yıldız ve rozet hesabı (değerler DENEME: ayarlar.ts → PUAN). Ekrandan ayrı tutulur.
export type RozetTuru = (typeof PUAN.rozetler)[number];

export const parDegeri = (no: number): number => PUAN.par[no] ?? 0;

// Vuruş sayısına göre yıldız (bitmemiş delikte 0). Par ya da altı en çok yıldız; her eşik aşıldıkça bir eksilir; en az 1.
export function yildizSayisi(no: number, vurus: number): number {
  if (vurus <= 0) return 0;
  const fazla = vurus - parDegeri(no);
  let yildiz: number = PUAN.yildizSayisi;
  for (const esik of PUAN.yildizEsik) if (fazla > esik) yildiz -= 1;
  return Math.max(1, yildiz);
}

// Bitmiş bir deliğin rozetleri. ceza: o delikte alınan ceza vuruşu sayısı.
export function rozetler(no: number, vurus: number, ceza: number): RozetTuru[] {
  if (vurus <= 0) return [];
  const liste: RozetTuru[] = [];
  if (vurus === 1) liste.push('tekVurus');
  if (vurus < parDegeri(no)) liste.push('parAlti');
  if (ceza === 0) liste.push('cezasiz');
  return liste;
}
