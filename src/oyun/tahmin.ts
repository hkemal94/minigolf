import { VURUS } from './ayarlar';
import { durana, vur, yeniTop, type Dunya, type Top } from './fizik';

// OYNANABİLİR PROTOTİP · vuruşun hızı ve kolay moddaki tahmin (Kemal, 19 Kasım 2026).

// Güçten (0–1) topun hızı (m/s). Oyundaki vuruş ve tahmin aynı yoldan geçer.
export const vurusHizi = (guc: number): number => VURUS.enCokHiz * Math.pow(guc, VURUS.us);

export type Tahmin = { x: number; y: number; z: number; delikte: boolean; disarida: boolean };

// Topun duracağı yer: oyunun kendi fizik koduyla, aynı adımlarla (sekmeler, düşme, delik dahil).
// Top dışarı çıkıyorsa çıktığı yer verilir.
export function tahminEt(dunya: Dunya, top: Pick<Top, 'x' | 'y' | 'z'>, yonX: number, yonZ: number, guc: number): Tahmin {
  const t = yeniTop(top.x, top.y, top.z);
  vur(t, yonX, yonZ, vurusHizi(guc));
  durana(t, dunya, 40);
  return { x: t.x, y: t.y, z: t.z, delikte: t.delikte, disarida: t.disarida };
}
