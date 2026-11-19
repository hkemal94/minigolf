import type { RefObject } from 'react';
import { m } from '../metinler';
import { renk } from '../sahne/renkler';
import type { OyunDeligi } from './dunya';

// Köşedeki küçük plan: deliğin tamamı, topun ve deliğin yeri (Kemal, 18 Kasım 2026).
// Oyun yönü yukarı bakar (başlangıç altta). Çizim delik verisinden; ölçekli.
const EN = 78;
const BOY = 108;
const PAY = 7;

type Yerlesim = { ox: number; oz: number; olcek: number; fx: number; fz: number };
const onbellek = new WeakMap<OyunDeligi, Yerlesim>();

function yerlesim(d: OyunDeligi): Yerlesim {
  const var_ = onbellek.get(d);
  if (var_) return var_;
  const [fx, fz] = d.yon;
  const c = d.cerceve;
  const koseler: [number, number][] = [
    [c.x0, c.z0],
    [c.x1, c.z0],
    [c.x0, c.z1],
    [c.x1, c.z1],
  ];
  // Oyun yönüne göre: u sağa, v ileri.
  const us = koseler.map(([x, z]) => -x * fz + z * fx);
  const vs = koseler.map(([x, z]) => x * fx + z * fz);
  const du = Math.max(...us) - Math.min(...us);
  const dv = Math.max(...vs) - Math.min(...vs);
  const y: Yerlesim = { ox: (c.x0 + c.x1) / 2, oz: (c.z0 + c.z1) / 2, olcek: Math.min((EN - 2 * PAY) / du, (BOY - 2 * PAY) / dv), fx, fz };
  onbellek.set(d, y);
  return y;
}

// Dünyadaki (x, z) noktasının plandaki yeri.
export function planNoktasi(d: OyunDeligi, x: number, z: number): [number, number] {
  const y = yerlesim(d);
  const dx = x - y.ox;
  const dz = z - y.oz;
  return [EN / 2 + (-dx * y.fz + dz * y.fx) * y.olcek, BOY / 2 - (dx * y.fx + dz * y.fz) * y.olcek];
}

export function KucukPlan({ delik, topRef }: { delik: OyunDeligi; topRef: RefObject<SVGCircleElement | null> }) {
  const n = (x: number, z: number) => planNoktasi(delik, x, z).map((v) => v.toFixed(1)).join(',');
  const c = delik.dunya.delik;
  const [cx, cy] = planNoktasi(delik, c.x, c.z);
  const [bx, by] = planNoktasi(delik, delik.baslangic[0], delik.baslangic[2]);
  return (
    <svg className="oy-plan" viewBox={`0 0 ${EN} ${BOY}`} width={EN} height={BOY} role="img" aria-label={m('oyna.plan')} data-deneme="plan">
      {delik.veri.cizgiler
        .filter((c2) => c2.tur === 'ag')
        .map((c2, i) => (
          <polyline key={`a${i}`} points={`${n(c2.a[0], c2.a[1])} ${n(c2.b[0], c2.b[1])}`} fill="none" stroke={renk.lacivert} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="2 2" />
        ))}
      {delik.veri.kutular.map((k, i) => (
        <polygon key={`k${i}`} points={`${n(k.x0, k.z0)} ${n(k.x1, k.z0)} ${n(k.x1, k.z1)} ${n(k.x0, k.z1)}`} fill={renk.lacivert} fillOpacity="0.35" />
      ))}
      {delik.bordurler.map((b, i) => (
        <polyline key={`b${i}`} points={b.noktalar.map(([x, z]) => n(x, z)).join(' ')} fill="none" stroke={renk.kiremit} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      ))}
      <circle cx={bx} cy={by} r="2.6" fill="none" stroke={renk.lacivert} strokeWidth="1" />
      <circle cx={cx} cy={cy} r="3" fill={renk.lacivert} />
      <circle ref={topRef} cx={bx} cy={by} r="2.4" fill="#FFFFFF" stroke={renk.kiremit} strokeWidth="1.2" />
    </svg>
  );
}
