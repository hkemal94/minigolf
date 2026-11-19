import { m, seciliDil, type MetinAnahtari } from '../metinler';
import { renk } from '../sahne/renkler';
import { metre } from './metre';
import { DENEME, GOLF, IFAB, MODEL, WMF } from './olculer';
import { ORNEK_DELIKLER, KALAN_DELIK_SAYISI, YAY_BOYU, OVAL_BOY, ornekDelik, DUS_BOY, DUS_EN, MERDIVEN_X1, KORIDOR_EN, type Kaynak, type N2, type OrnekDelik } from './ornekDelikler';

// MAKET (öneri): yeni dille çizilen deliklerin üstten şeması, ölçü çizgileriyle. Veri 3B maketle aynı (ornekDelikler.ts).

const CIM = '#7E9A55'; // modeldeki çimin rengi
const TOPRAK = '#BDB09A'; // modeldeki toprak zeminin rengi
const ZEMIN: Record<number, string> = { 1: CIM, 2: CIM, 3: CIM, 4: CIM, 5: CIM, 6: CIM, 7: '#C8C0AF', 8: '#C8C0AF', 9: TOPRAK, 14: '#C8C0AF' };
// Şemada eşyaların rengi (modeldeki renkler): tribün duvarı, taş duvar, taş merdiven, köprü ayağı.
const KUTU_RENGI: Partial<Record<OrnekDelik['kutular'][number]['tur'], string>> = {
  koltuk: renk.lacivert,
  koltukAcik: renk.krem,
  duvar: '#C9B48F',
  tas: '#D6C7A8',
  merdivenTas: '#BFA987',
  ayak: '#B9B09D',
};

// Uzun eksen ekranda dikey, başlangıç altta: 'z' (x, z) -> (-x, -z); '-z' -> (x, z); 'x' -> (z, -x); '-x' -> (-z, x).
const eksenCevir = (eksen: OrnekDelik['eksen']) => (n: N2): N2 =>
  eksen === 'z' ? [-n[0], -n[1]] : eksen === '-z' ? [n[0], n[1]] : eksen === 'x' ? [n[1], -n[0]] : [-n[1], n[0]];
const KAYNAK_ADI: Record<Kaynak, MetinAnahtari> = {
  ifab: 'maket.kaynak.ifab',
  wmf: 'maket.kaynak.wmf',
  model: 'maket.kaynak.model',
  deneme: 'maket.deneme',
};

// Önerilen yol (kesik kiremit) ve kestirme: bulmacayı anlatmak için; oynanışta çizilmez.
const YOLLAR: Record<number, N2[][]> = {
  3: [[[0, MODEL.kaleSahasiCizgisiZ], [0.4, -25.68], [-1.25, -25.64]]],
  7: [[[51.4, -67.075], [49.4, -67.075], [49.43, -66.225], [47.6, -66.225], [47.63, -65.375], [46.3, -65.375]]],
  14: [[[0.6, 0.75], [1.5, 2.2], [3.1, 0.5], [4.7, 2.2], [5.6, 0.75]]],
};

function Cizim({ delik, gen, yuk }: { delik: OrnekDelik; gen: number; yuk: number }) {
  const c = delik.cerceve;
  const cevir = eksenCevir(delik.eksen);
  const koseler = [cevir([c.x0, c.z0]), cevir([c.x1, c.z1])];
  const minX = Math.min(koseler[0][0], koseler[1][0]);
  const maxX = Math.max(koseler[0][0], koseler[1][0]);
  const minY = Math.min(koseler[0][1], koseler[1][1]);
  const maxY = Math.max(koseler[0][1], koseler[1][1]);
  const olcek = Math.min(gen / (maxX - minX), yuk / (maxY - minY));
  const ox = (gen - (maxX - minX) * olcek) / 2;
  const oy = (yuk - (maxY - minY) * olcek) / 2;
  const P = (n: N2): N2 => {
    const [a, b] = cevir(n);
    return [ox + (a - minX) * olcek, oy + (b - minY) * olcek];
  };
  const yol = (ns: N2[]) => ns.map((n, i) => `${i ? 'L' : 'M'}${P(n)[0].toFixed(1)} ${P(n)[1].toFixed(1)}`).join(' ');
  const kutu = (k: { x0: number; x1: number; z0: number; z1: number }) => {
    const [a, b] = [P([k.x0, k.z0]), P([k.x1, k.z1])];
    return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(a[0] - b[0]), height: Math.abs(a[1] - b[1]) };
  };
  const hiza = { sol: 'start', sag: 'end', orta: 'middle' } as const;
  const [bx, by] = P([delik.baslangic[0], delik.baslangic[2]]);
  const [cx, cy] = P([delik.cukur[0], delik.cukur[2]]);
  return (
    <svg viewBox={`0 0 ${gen} ${yuk}`} width="100%" height="100%" className="mk-sema-cizim">
      <rect x={ox} y={oy} width={(maxX - minX) * olcek} height={(maxY - minY) * olcek} rx="10" fill={ZEMIN[delik.no]} />
      {delik.alanlar?.map((a, i) => (
        <rect key={`a${i}`} {...kutu(a)} fill={a.renk} />
      ))}
      {delik.no === 14 && <rect {...kutu({ x0: 0, x1: DUS_BOY, z0: 0, z1: DUS_EN })} fill="#F4F1EA" />}
      {delik.no === 7 && <rect {...kutu({ x0: c.x0, x1: MERDIVEN_X1, z0: c.z0, z1: c.z1 })} fill="#B79A6E" opacity="0.55" />}
      {delik.cizgiler.map((l, i) => (
        <path
          key={i}
          d={yol([l.a, l.b])}
          stroke={l.tur === 'basamak' ? '#8F8776' : l.tur === 'merdiven' ? '#A58A5E' : l.tur === 'korkuluk' ? '#3F3B36' : '#FAF8F5'}
          strokeWidth={l.tur === 'saha' ? (delik.yollar ? Math.max(2.2, MODEL.cizgiEn * olcek) : 2.2) : 1.2}
          strokeLinecap={l.tur === 'saha' && delik.yollar ? 'round' : undefined}
          strokeDasharray={l.tur === 'ag' ? '3 3' : undefined}
          fill="none"
        />
      ))}
      {delik.birikinti && (
        <circle cx={P(delik.birikinti.n)[0]} cy={P(delik.birikinti.n)[1]} r={delik.birikinti.r * olcek} fill="#7FB0C8" opacity="0.8" />
      )}
      {delik.noktalar?.map((n, i) => (
        <circle key={i} cx={P(n.n)[0]} cy={P(n.n)[1]} r={n.r * olcek} fill="#FAF8F5" />
      ))}
      {delik.kutular.map((k, i) => (
        <rect key={i} {...kutu(k)} rx={k.tur.startsWith('koltuk') ? 2 : 0} fill={KUTU_RENGI[k.tur] ?? '#FAF8F5'} stroke={renk.lacivert} strokeWidth={k.tur === 'koltuk' ? 0 : 0.8} />
      ))}
      {delik.bordurler.map((b, i) => (
        <path key={i} d={yol(b.noktalar)} stroke={renk.kiremit} strokeWidth="2.6" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      ))}
      {delik.acikKenarlar?.map((b, i) => (
        <path key={`ak${i}`} d={yol(b)} stroke={renk.kiremit} strokeWidth="1.6" strokeDasharray="4 3" fill="none" />
      ))}
      {delik.vurguKenar && (
        <>
          <path d={yol(delik.vurguKenar)} stroke={renk.kiremit} strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d={yol(delik.vurguKenar)} stroke={renk.krem} strokeWidth="1.6" fill="none" strokeLinecap="round" />
        </>
      )}
      {(delik.yollar ?? YOLLAR[delik.no] ?? []).map((y, i) => (
        <path key={i} d={yol(y)} stroke={renk.lacivert} strokeWidth="1.4" strokeDasharray={i ? '2 3' : '5 3'} fill="none" strokeLinejoin="round" />
      ))}
      {/* Başlangıç ve delik */}
      <circle cx={bx} cy={by} r="4.5" fill="none" stroke={renk.lacivert} strokeWidth="0.9" />
      <circle cx={bx} cy={by} r={Math.max(1.4, (GOLF.topCap / 2) * olcek)} fill="#FFFFFF" stroke={renk.lacivert} strokeWidth="0.6" />
      <circle cx={cx} cy={cy} r={Math.max(2, (GOLF.delikCap / 2) * olcek)} fill={renk.lacivert} />
      <path d={`M${cx} ${cy} v-16 l9 4 -9 4`} stroke={renk.lacivert} strokeWidth="1.3" fill={renk.kiremit} />
      {/* Ölçü çizgileri */}
      {delik.olculer.map((o, i) => {
        const dx = o.b[0] - o.a[0];
        const dz = o.b[1] - o.a[1];
        const boy = Math.hypot(dx, dz);
        const dik: N2 = [(-dz / boy) * o.kaydir, (dx / boy) * o.kaydir];
        const a = P([o.a[0] + dik[0], o.a[1] + dik[1]]);
        const b = P([o.b[0] + dik[0], o.b[1] + dik[1]]);
        const a0 = P(o.a);
        const b0 = P(o.b);
        const orta: N2 = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        const dikey = Math.abs(a[0] - b[0]) < Math.abs(a[1] - b[1]);
        // Yazı çizginin dış yanına (deliğin dışına doğru) düşer.
        const disX = Math.sign(a[0] - a0[0]) || 1;
        const disY = Math.sign(a[1] - a0[1]) || 1;
        return (
          <g key={i} className={`mk-olcu ${o.kaynak === 'deneme' ? 'deneme' : ''}`}>
            <path d={`M${a0[0]} ${a0[1]} L${a[0]} ${a[1]} M${b0[0]} ${b0[1]} L${b[0]} ${b[1]}`} strokeWidth="0.6" strokeDasharray="2 2" />
            <path d={`M${a[0]} ${a[1]} L${b[0]} ${b[1]}`} strokeWidth="1.1" />
            <circle cx={a[0]} cy={a[1]} r="1.8" />
            <circle cx={b[0]} cy={b[1]} r="1.8" />
            {dikey ? (
              <text x={orta[0] + disX * 5} y={orta[1]} textAnchor={disX > 0 ? 'start' : 'end'}>
                <tspan x={orta[0] + disX * 5} dy="-1">{metre(o.deger)}</tspan>
                <tspan x={orta[0] + disX * 5} dy="10" className="mk-olcu-kaynak">{m(KAYNAK_ADI[o.kaynak])}</tspan>
              </text>
            ) : (
              <text x={orta[0]} y={orta[1] + (disY > 0 ? 11 : -5)} textAnchor="middle">
                {metre(o.deger)} <tspan className="mk-olcu-kaynak">{m(KAYNAK_ADI[o.kaynak])}</tspan>
              </text>
            )}
          </g>
        );
      })}
      {delik.etiketler.map((e, i) => (
        <text key={i} x={P(e.n)[0]} y={P(e.n)[1]} textAnchor={hiza[e.hiza ?? 'orta']} className="mk-sema-etiket">
          {e.metre || e.metin === 'maket.sema.basamakYukseklik' ? m(e.metin, metre(e.deger ?? 0)) : m(e.metin, e.deger ?? '')}
        </text>
      ))}
      <text x={bx} y={by + 16} textAnchor="middle" className="mk-sema-etiket koyu">{m('maket.sema.baslangic')}</text>
      {/* Ölçek çubuğu: 1 m */}
      <g className="mk-olcu">
        <path d={`M${ox + 10} ${oy + (maxY - minY) * olcek - 10} h${olcek}`} strokeWidth="2.4" />
        <text x={ox + 10 + olcek / 2} y={oy + (maxY - minY) * olcek - 15} textAnchor="middle">{metre(1)}</text>
      </g>
    </svg>
  );
}

// Yeni dille çizilen deliklerin stattaki yeri: saha, tribünler ve delikler aynı ölçekte.
function Yerlesim({ gen, yuk }: { gen: number; yuk: number }) {
  const x0 = -14, x1 = 104, z0 = -72, z1 = 18; // taş duvarın çevresi (model)
  const olcek = Math.min(gen / (z1 - z0), yuk / (x1 - x0));
  const ox = (gen - (z1 - z0) * olcek) / 2;
  const oy = (yuk - (x1 - x0) * olcek) / 2;
  const P = (x: number, z: number): N2 => [ox + (z - z0) * olcek, oy + (x1 - x) * olcek];
  const kutu = (ax: number, bx: number, az: number, bz: number) => {
    const [a, b] = [P(ax, az), P(bx, bz)];
    return { x: Math.min(a[0], b[0]), y: Math.min(a[1], b[1]), width: Math.abs(a[0] - b[0]), height: Math.abs(a[1] - b[1]) };
  };
  const cizgi = { fill: 'none', stroke: '#FAF8F5', strokeWidth: 1 };
  const orta = P(MODEL.sahaBoy / 2, -MODEL.sahaEn / 2);
  const kaleOrta = -MODEL.sahaEn / 2;
  const yanCeza = IFAB.kaleGenislik / 2 + IFAB.cezaSahasi;
  const yanKale = IFAB.kaleGenislik / 2 + IFAB.kaleSahasi;
  // Duşların yeri: kapalı tribünün altı (Kemal, 16 Kasım); tam yeri öneri.
  const dusX = 40, dusZ = 9.5;
  // sekil: deliğin kenarı gerçek biçimiyle (adım 1 delikleri); yoksa gerçek ölçüsünde kutu.
  type Isaret = { no: number; n: N2; boyut: [number, number]; yazi: N2; hiza: 'start' | 'end'; sekil?: N2[] };
  const sekil = (no: number) => (ornekDelik(no).dis ?? ornekDelik(no).bordurler[0].noktalar).map((q) => P(q[0], q[1]));
  const isaretler: Isaret[] = [
    { no: 1, n: P(40.4, -37), boyut: [YAY_BOYU, WMF.betonEn], yazi: P(31, -39), hiza: 'start', sekil: sekil(1) },
    { no: 2, n: P(22.5, -55), boyut: [WMF.minyaturBoy, WMF.betonEn], yazi: P(22.5, -45), hiza: 'start', sekil: sekil(2) },
    { no: 3, n: P(-0.7, -32), boyut: [2.6, 13.4], yazi: P(-9, -32), hiza: 'start' },
    { no: 4, n: P(0.4, -57.6), boyut: [WMF.minyaturBoy, WMF.betonEn], yazi: P(-9, -60), hiza: 'start', sekil: sekil(4) },
    { no: 5, n: P(13.75, -29), boyut: [OVAL_BOY, 2 * DENEME.ovalYariEn], yazi: P(13.75, -17), hiza: 'start', sekil: sekil(5) },
    { no: 6, n: P(43, -62.5), boyut: [WMF.minyaturBoy, WMF.betonEn], yazi: P(38, -50), hiza: 'start', sekil: sekil(6) },
    { no: 7, n: P(48.7, -66), boyut: [6.25, 2.55], yazi: P(48.7, -54), hiza: 'start' },
    { no: 8, n: P(60.5, -70), boyut: [MODEL.arkaDuvarIcZ - MODEL.tasDuvarDisZ, DENEME.kopruEn], yazi: P(60, -53), hiza: 'start', sekil: sekil(8) },
    { no: 9, n: P(63.5, -69.5), boyut: [ornekDelik(9).dis![4][0] - ornekDelik(9).dis![0][0], KORIDOR_EN], yazi: P(71, -60), hiza: 'start', sekil: sekil(9) },
    { no: 14, n: P(dusX + DUS_BOY / 2, dusZ + DUS_EN / 2), boyut: [DUS_BOY, DUS_EN], yazi: P(dusX + DUS_BOY / 2, -3), hiza: 'end' },
  ];
  return (
    <svg viewBox={`0 0 ${gen} ${yuk}`} width="100%" height="100%" className="mk-sema-cizim">
      <rect {...kutu(x0, x1, z0, z1)} fill="#C2A67A" rx="4" />
      <rect {...kutu(-4, 94, -62, 4)} fill="#7E9A55" />
      <rect {...kutu(0, MODEL.sahaBoy, -MODEL.sahaEn, 0)} {...cizgi} />
      <path d={`M${P(45, -58)[0]} ${P(45, -58)[1]} L${P(45, 0)[0]} ${P(45, 0)[1]}`} {...cizgi} />
      <circle cx={orta[0]} cy={orta[1]} r={IFAB.ortaYuvarlakYaricap * olcek} {...cizgi} />
      {[0, 1].map((u) => {
        const kx = u ? MODEL.sahaBoy : 0;
        const yon = u ? -1 : 1;
        return (
          <g key={u}>
            <rect {...kutu(kx, kx + yon * IFAB.cezaSahasi, kaleOrta - yanCeza, kaleOrta + yanCeza)} {...cizgi} />
            <rect {...kutu(kx, kx + yon * IFAB.kaleSahasi, kaleOrta - yanKale, kaleOrta + yanKale)} {...cizgi} />
            <rect {...kutu(kx, kx - yon * MODEL.agDerinlik, kaleOrta - IFAB.kaleGenislik / 2, kaleOrta + IFAB.kaleGenislik / 2)} fill="#FAF8F5" opacity="0.7" />
            <circle cx={P(kx + yon * IFAB.penaltiNoktasi, kaleOrta)[0]} cy={P(kx + yon * IFAB.penaltiNoktasi, kaleOrta)[1]} r="1" fill="#FAF8F5" />
          </g>
        );
      })}
      {/* Kapalı tribün, açık tribün, kulüp binası (modeldeki yerleri) */}
      <rect {...kutu(23, 67, 5, 13.5)} fill="#B9B2A4" stroke="#8F8776" />
      <rect {...kutu(28, 62, -68.1, -63)} fill="#B9B2A4" stroke="#8F8776" />
      <rect {...kutu(95, 102, -35, -23)} fill="#B85A3E" opacity="0.8" />
      <text x={P(45, 16)[0]} y={P(45, 16)[1]} className="mk-sema-etiket koyu" textAnchor="middle" transform={`rotate(90 ${P(45, 16)[0]} ${P(45, 16)[1]})`}>{m('maket.yerlesim.kapaliTribun')}</text>
      <text x={P(45, -70.2)[0]} y={P(45, -70.2)[1]} className="mk-sema-etiket koyu" textAnchor="middle" transform={`rotate(-90 ${P(45, -70.2)[0]} ${P(45, -70.2)[1]})`}>{m('maket.yerlesim.acikTribun')}</text>
      <text x={P(99, -29)[0]} y={P(99, -29)[1] - 12} className="mk-sema-etiket koyu" textAnchor="middle">{m('maket.yerlesim.kulupBinasi')}</text>
      <text x={P(-9, -71.4)[0]} y={P(-9, -71.4)[1] + 3.5} className="mk-sema-etiket koyu" textAnchor="start">{m('maket.yerlesim.aUcu')}</text>
      <text x={P(101, -68)[0]} y={P(101, -68)[1] - 16} className="mk-sema-etiket koyu" textAnchor="start">{m('maket.yerlesim.bUcu')}</text>
      {/* Yeni dille çizilen delikler: gerçek ölçüsünde kiremit biçim, yanında numara ve ölçü */}
      {isaretler.map((i) => (
        <g key={i.no}>
          {i.sekil ? (
            <path d={i.sekil.map((q, k) => `${k ? 'L' : 'M'}${q[0].toFixed(1)} ${q[1].toFixed(1)}`).join(' ')} fill={renk.kiremit} stroke={renk.lacivert} strokeWidth="0.8" strokeLinejoin="round" />
          ) : (
            <rect x={i.n[0] - (i.boyut[1] * olcek) / 2} y={i.n[1] - (i.boyut[0] * olcek) / 2} width={i.boyut[1] * olcek} height={i.boyut[0] * olcek} fill={renk.kiremit} stroke={renk.lacivert} strokeWidth="0.8" />
          )}
          <path d={`M${i.n[0]} ${i.n[1]} L${i.yazi[0]} ${i.yazi[1]}`} stroke={renk.lacivert} strokeWidth="0.8" />
          <circle cx={i.yazi[0]} cy={i.yazi[1]} r="9" fill={renk.lacivert} />
          <text x={i.yazi[0]} y={i.yazi[1] + 3.5} textAnchor="middle" className="mk-yerlesim-no">{i.no}</text>
          <text x={i.yazi[0] + (i.hiza === 'start' ? 13 : -13)} y={i.yazi[1] + 3.5} textAnchor={i.hiza} className="mk-sema-etiket koyu kalin">
            {m('maket.yerlesim.boyut', metre(Math.max(...i.boyut)), metre(Math.min(...i.boyut)))}
          </text>
        </g>
      ))}
      <g className="mk-olcu">
        <path d={`M${P(x0 + 5, z1 - 14)[0]} ${P(x0 + 5, 0)[1]} h${10 * olcek}`} strokeWidth="2.4" />
        <text x={P(x0 + 5, z1 - 14)[0] + 5 * olcek} y={P(x0 + 5, 0)[1] - 5} textAnchor="middle">{metre(10)}</text>
      </g>
    </svg>
  );
}

const santim = (n: number) => (n * 100).toLocaleString(seciliDil(), { maximumFractionDigits: 2 });

const KAYNAK_SATIRLARI: MetinAnahtari[] = ['maket.kaynak.ifabUzun', 'maket.kaynak.wmfUzun', 'maket.kaynak.modelUzun', 'maket.kaynak.denemeUzun'];

export function Sema({ no }: { no: number }) {
  if (no === 0) {
    return (
      <div className="mk-sema">
        <div className="mk-baslik">{m('maket.yerlesim.baslik')}</div>
        <div className="mk-alt-baslik">{m('maket.yerlesim.alt', metre(MODEL.sahaBoy), metre(MODEL.sahaEn))}</div>
        <div className="mk-sema-alan">
          <Yerlesim gen={362} yuk={476} />
        </div>
        <ul className="mk-sema-not mk-iki-sutun">
          {ORNEK_DELIKLER.map((d) => (
            <li key={d.no}>
              <b>{d.no}</b> {m(`maket.yer.${d.no}` as MetinAnahtari)}
            </li>
          ))}
        </ul>
        <div className="mk-sema-not">{m('maket.yerlesim.not', ORNEK_DELIKLER.length, KALAN_DELIK_SAYISI)}</div>
      </div>
    );
  }
  const delik = ornekDelik(no);
  return (
    <div className="mk-sema">
      <div className="mk-baslik">{m('maket.sema.baslik', delik.no, m(`maket.yer.${delik.no}` as MetinAnahtari))}</div>
      <div className="mk-alt-baslik">
        {m(`maket.zemin.${delik.no}` as MetinAnahtari)} · {m('maket.delik.zorluk', m(delik.zorluk))}
      </div>
      <div className="mk-sema-bulmaca">{m(`maket.bulmaca.${delik.no}` as MetinAnahtari)}</div>
      <div className="mk-sema-alan">
        <Cizim delik={delik} gen={362} yuk={520} />
      </div>
      <ul className="mk-sema-not">
        {KAYNAK_SATIRLARI.map((k) => (
          <li key={k}>{m(k)}</li>
        ))}
        <li>{m('maket.sema.topNotu', santim(GOLF.topCap), santim(GOLF.delikCap))}</li>
      </ul>
    </div>
  );
}

// Küçük plan: delik ekranının köşesinde deliğin tamamı; topun ve deliğin yeri (kamera topun yanındayken).
export function KucukHarita({ delik, top }: { delik: OrnekDelik; top: [number, number] }) {
  const c = delik.cerceve;
  const cevir = eksenCevir(delik.eksen);
  const k = [cevir([c.x0, c.z0]), cevir([c.x1, c.z1])];
  const minX = Math.min(k[0][0], k[1][0]);
  const minY = Math.min(k[0][1], k[1][1]);
  const gen = Math.abs(k[0][0] - k[1][0]);
  const yuk = Math.abs(k[0][1] - k[1][1]);
  const olcek = Math.min(70 / gen, 118 / yuk);
  const P = (n: N2): N2 => [(cevir(n)[0] - minX) * olcek, (cevir(n)[1] - minY) * olcek];
  const yol = (ns: N2[]) => ns.map((n, i) => `${i ? 'L' : 'M'}${P(n)[0].toFixed(1)} ${P(n)[1].toFixed(1)}`).join(' ');
  const [tx, ty] = P(top);
  const [dx, dy] = P([delik.cukur[0], delik.cukur[2]]);
  return (
    <svg className="mk-kucuk-harita" width={gen * olcek} height={yuk * olcek} viewBox={`0 0 ${gen * olcek} ${yuk * olcek}`} aria-hidden>
      {delik.kutular.map((q, i) => {
        const [a, b] = [P([q.x0, q.z0]), P([q.x1, q.z1])];
        return <rect key={i} x={Math.min(a[0], b[0])} y={Math.min(a[1], b[1])} width={Math.abs(a[0] - b[0])} height={Math.abs(a[1] - b[1])} fill={renk.lacivert} opacity="0.35" />;
      })}
      {delik.cizgiler.filter((l) => l.tur === 'ag').map((l, i) => (
        <path key={i} d={yol([l.a, l.b])} stroke={renk.lacivert} strokeWidth="0.8" strokeDasharray="2 2" fill="none" opacity="0.6" />
      ))}
      {/* Saha çizgileri yalnız adım 1 deliklerinde (yerin kendisi: yuvarlak, taç çizgisi, köşe, ceza sahası) */}
      {delik.yollar &&
        delik.cizgiler.filter((l) => l.tur === 'saha').map((l, i) => (
          <path key={`s${i}`} d={yol([l.a, l.b])} stroke={renk.lacivert} strokeWidth="1" fill="none" opacity="0.28" strokeLinecap="round" />
        ))}
      {delik.cizgiler.filter((l) => l.tur === 'korkuluk').map((l, i) => (
        <path key={`k${i}`} d={yol([l.a, l.b])} stroke={renk.lacivert} strokeWidth="0.8" fill="none" opacity="0.45" />
      ))}
      {delik.acikKenarlar?.map((b, i) => (
        <path key={`ak${i}`} d={yol(b)} stroke={renk.kiremit} strokeWidth="1.1" strokeDasharray="2.5 2" fill="none" />
      ))}
      {delik.bordurler.map((b, i) => (
        <path key={i} d={yol(b.noktalar)} stroke={renk.kiremit} strokeWidth="1.5" fill="none" strokeLinejoin="round" strokeLinecap="round" />
      ))}
      <path d={`M${dx} ${dy} v-9 l5 2.2 -5 2.2`} stroke={renk.lacivert} strokeWidth="1" fill={renk.kiremit} />
      <circle cx={dx} cy={dy} r="1.8" fill={renk.lacivert} />
      <circle cx={tx} cy={ty} r="3" fill="#FFFFFF" stroke={renk.lacivert} strokeWidth="1.2" />
    </svg>
  );
}
