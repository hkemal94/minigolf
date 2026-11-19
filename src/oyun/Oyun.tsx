import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Canvas } from '@react-three/fiber';
import { m, type MetinAnahtari } from '../metinler';
import { metre } from '../maket/metre';
import { KAMERA, KURAL, VURUS } from './ayarlar';
import { OYUN_SIRASI, oyunDeligi } from './dunya';
import { vur, yeniTop } from './fizik';
import { KucukPlan, planNoktasi } from './KucukPlan';
import { OyunSahnesi, ekranNoktasi, yeniDurum, yerNoktasi, type Durum, type Olay } from './Sahne';
import './oyun.css';

// OYNANABİLİR PROTOTİP (Kemal, 19 Kasım 2026: telefonda denenecek ilk oynanış). ?oyna=1 ile açılır.
// Üç delik: 3 (kale), 1 (orta yuvarlak), 7 (tribün sıraları). Değerler DENEME (ayarlar.ts).
// Ekrandaki her yazı src/metinler'den; ses yok.

type Asama = 'oyun' | 'delikSonu' | 'turSonu';
type Parmak = { x: number; y: number };
type Hareket =
  | { tur: 'yok' }
  | { tur: 'nisan'; kimlik: number; bas: Parmak }
  | { tur: 'cevir'; kimlik: number; son: Parmak }
  | { tur: 'iki'; aralik: number; yon: number; yakinlik: number; aci: number };

const yerAdi = (no: number) => m(`maket.yer.${no}` as MetinAnahtari);

export default function Oyun() {
  const [sira, setSira] = useState(0);
  const [tekrar, setTekrar] = useState(0);
  const [vuruslar, setVuruslar] = useState<number[]>(() => OYUN_SIRASI.map(() => 0));
  const [asama, setAsama] = useState<Asama>('oyun');
  const [disari, setDisari] = useState(false);
  const [yuklendi, setYuklendi] = useState(false);

  const no = OYUN_SIRASI[sira];
  // Her delik (ve her "yeniden") için yeni bir oyun hâli.
  // tekrar: "yeniden" denince aynı delik baştan kurulur.
  const durum = useMemo<Durum>(() => yeniDurum(oyunDeligi(no)), [no, tekrar]);

  const alanRef = useRef<HTMLDivElement>(null);
  const uzaklikRef = useRef<HTMLSpanElement>(null);
  const okRef = useRef<HTMLDivElement>(null);
  const okYaziRef = useRef<HTMLSpanElement>(null);
  const okSimgeRef = useRef<SVGSVGElement>(null);
  const gucRef = useRef<HTMLDivElement>(null);
  const gucDoluRef = useRef<HTMLDivElement>(null);
  const gucYaziRef = useRef<HTMLSpanElement>(null);
  const planTopRef = useRef<SVGCircleElement>(null);
  const parmaklar = useRef(new Map<number, Parmak>());
  const hareket = useRef<Hareket>({ tur: 'yok' });
  const sonUzaklik = useRef('');
  const yuklendiRef = useRef(false);

  // Deneme için (yalnız ?bot=1 ile): oyunun hâlini okumaya yarar; oyunu değiştirmez.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has('bot')) return;
    const w = window as unknown as Record<string, unknown>;
    w.__minigolf = {
      durum: () => ({
        no,
        sira,
        asama,
        vuruslar,
        top: { ...durum.top },
        onceki: durum.onceki,
        aci: durum.aci,
        yakinlik: durum.yakinlik,
        topEkran: durum.topEkran,
        nisan: { ...durum.nisan },
        hazir: durum.kamera !== null && yuklendi,
        cizim: durum.cizim,
        alan: alanRef.current?.getBoundingClientRect().toJSON(),
      }),
      ekran: (x: number, y: number, z: number) => ekranNoktasi(durum, x, y, z),
    };
    return () => {
      delete w.__minigolf;
    };
  }, [durum, no, sira, asama, vuruslar, yuklendi]);

  // --- Sahnedeki olaylar
  const olay = useCallback(
    (o: Olay) => {
      if (o === 'delik') {
        durum.kilitli = true;
        setAsama('delikSonu');
      } else if (o === 'disari') {
        // DENEME: top dışarı çıktı; vuruştan önceki yere döner. Vuruş sayıldı (KURAL.disariCeza ek ceza).
        const [x, y, z] = durum.onceki;
        durum.top = yeniTop(x, y, z);
        durum.birikim = 0;
        if (KURAL.disariCeza > 0) setVuruslar((v) => v.map((n, i) => (i === sira ? n + KURAL.disariCeza : n)));
        setDisari(true);
      }
    },
    [durum, sira],
  );
  useEffect(() => {
    if (!disari) return;
    const z = window.setTimeout(() => setDisari(false), 2600);
    return () => window.clearTimeout(z);
  }, [disari]);

  // --- Her karede: uzaklık yazısı, deliği gösteren ok, küçük plandaki top
  const kare = useCallback((d: Durum) => {
    const c = d.delik.dunya.delik;
    const t = d.top;
    const uzak = Math.hypot(c.x - t.x, c.z - t.z);
    const yazi = metre(Math.round(uzak * 10) / 10);
    if (yazi !== sonUzaklik.current) {
      sonUzaklik.current = yazi;
      if (uzaklikRef.current) uzaklikRef.current.textContent = m('oyna.uzaklik', yazi);
      if (okYaziRef.current) okYaziRef.current.textContent = yazi;
    }
    // Delik ekranın dışındaysa kenarda ona bakan ok; ekrandaysa bayrağın kendisi görünür.
    const ok = okRef.current;
    if (ok) {
      const [dx, dy] = ekranNoktasi(d, c.x, c.y + 0.3, c.z);
      const ust = 118; // üstteki bilgi şeridinin ve planın altı
      const alt = d.boy - 92;
      const disarida = dx < 12 || dx > d.en - 12 || dy < ust - 40 || dy > alt + 20;
      ok.style.display = disarida && !d.kilitli ? 'flex' : 'none';
      if (disarida) {
        const [tx, tyy] = d.topEkran;
        const x = Math.min(d.en - 46, Math.max(46, dx));
        const y = Math.min(alt, Math.max(ust + 28, dy));
        ok.style.left = `${x}px`;
        ok.style.top = `${y}px`;
        if (okSimgeRef.current) okSimgeRef.current.style.transform = `rotate(${Math.atan2(dy - tyy, dx - tx)}rad)`;
      }
    }
    const nokta = planTopRef.current;
    if (nokta) {
      const [px, py] = planNoktasi(d.delik, t.x, t.z);
      nokta.setAttribute('cx', px.toFixed(1));
      nokta.setAttribute('cy', py.toFixed(1));
    }
    if (!yuklendiRef.current && d.kamera) {
      yuklendiRef.current = true;
      setYuklendi(true);
    }
  }, []);

  // --- Parmak hareketleri. Tek parmak topun üstünde: vuruş. Tek parmak boşta: kamerayı çevir.
  // İki parmak: araları açılıp kapanınca yakınlaştır, döndürülünce çevir.
  const yer = (e: ReactPointerEvent): Parmak => {
    const k = alanRef.current!.getBoundingClientRect();
    return { x: e.clientX - k.left, y: e.clientY - k.top };
  };
  const gucGoster = (guc: number | null) => {
    if (!gucRef.current) return;
    gucRef.current.style.visibility = guc === null ? 'hidden' : 'visible';
    if (guc !== null) {
      if (gucDoluRef.current) gucDoluRef.current.style.width = `${Math.round(guc * 100)}%`;
      if (gucYaziRef.current) gucYaziRef.current.textContent = guc > 0 ? m('oyna.guc', Math.round(guc * 100)) : m('oyna.iptal');
    }
  };
  const ikiParmak = () => {
    const [a, b] = [...parmaklar.current.values()];
    return { aralik: Math.hypot(b.x - a.x, b.y - a.y), yon: Math.atan2(b.y - a.y, b.x - a.x) };
  };
  const nisanBirak = () => {
    durum.nisan.aktif = false;
    durum.nisan.guc = 0;
    gucGoster(null);
  };

  const basildi = (e: ReactPointerEvent) => {
    if (asama !== 'oyun') return;
    const p = yer(e);
    parmaklar.current.set(e.pointerId, p);
    alanRef.current?.setPointerCapture(e.pointerId);
    if (parmaklar.current.size === 1) {
      const [tx, ty] = durum.topEkran;
      const yakin = Math.hypot(p.x - tx, p.y - ty) <= VURUS.dokunmaPayi;
      if (yakin && durum.top.duruyor && !durum.kilitli) {
        hareket.current = { tur: 'nisan', kimlik: e.pointerId, bas: p };
        durum.nisan.aktif = true;
        durum.nisan.guc = 0;
        gucGoster(0);
      } else {
        hareket.current = { tur: 'cevir', kimlik: e.pointerId, son: p };
      }
    } else if (parmaklar.current.size === 2) {
      nisanBirak(); // ikinci parmak gelince vuruş iptal
      hareket.current = { tur: 'iki', ...ikiParmak(), yakinlik: durum.yakinlik, aci: durum.aci };
    }
  };

  const oynadi = (e: ReactPointerEvent) => {
    if (!parmaklar.current.has(e.pointerId)) return;
    const p = yer(e);
    parmaklar.current.set(e.pointerId, p);
    const h = hareket.current;
    if (h.tur === 'nisan' && h.kimlik === e.pointerId) {
      const cekme = Math.hypot(p.x - h.bas.x, p.y - h.bas.y);
      const a = yerNoktasi(durum, h.bas.x, h.bas.y, durum.top.y);
      const b = yerNoktasi(durum, p.x, p.y, durum.top.y);
      if (!a || !b) return;
      const dx = a[0] - b[0];
      const dz = a[1] - b[1];
      const boy = Math.hypot(dx, dz);
      if (cekme < VURUS.enAzCekme || boy < 1e-6) {
        durum.nisan.guc = 0;
        gucGoster(0);
        return;
      }
      durum.nisan.yonX = dx / boy;
      durum.nisan.yonZ = dz / boy;
      durum.nisan.guc = Math.min(1, cekme / VURUS.enCokCekme);
      gucGoster(durum.nisan.guc);
    } else if (h.tur === 'cevir' && h.kimlik === e.pointerId) {
      // Parmak topun çevresinde ne kadar döndüyse yer de o kadar döner (parmağın altındaki yer parmağı izler).
      const [tx, ty] = durum.topEkran;
      let fark = Math.atan2(p.y - ty, p.x - tx) - Math.atan2(h.son.y - ty, h.son.x - tx);
      if (fark > Math.PI) fark -= 2 * Math.PI;
      if (fark < -Math.PI) fark += 2 * Math.PI;
      if (Math.hypot(p.x - tx, p.y - ty) > VURUS.dokunmaPayi) durum.aci -= fark;
      h.son = p;
    } else if (h.tur === 'iki' && parmaklar.current.size === 2) {
      const simdi = ikiParmak();
      durum.yakinlik = Math.min(KAMERA.enYakin, Math.max(KAMERA.enUzak, h.yakinlik * (simdi.aralik / Math.max(1, h.aralik))));
      let fark = simdi.yon - h.yon;
      if (fark > Math.PI) fark -= 2 * Math.PI;
      if (fark < -Math.PI) fark += 2 * Math.PI;
      durum.aci = h.aci - fark; // yer parmaklarla birlikte döner
    }
  };

  const kalkti = (e: ReactPointerEvent) => {
    if (!parmaklar.current.has(e.pointerId)) return;
    parmaklar.current.delete(e.pointerId);
    const h = hareket.current;
    if (h.tur === 'nisan' && h.kimlik === e.pointerId) {
      const n = durum.nisan;
      if (e.type === 'pointerup' && n.guc > 0 && durum.top.duruyor && !durum.kilitli) {
        // Vuruş: güç çekme boyundan, sınırı var (VURUS.enCokHiz; DENEME).
        const t = durum.top;
        durum.onceki = [t.x, t.y, t.z];
        durum.birikim = 0;
        vur(t, n.yonX, n.yonZ, VURUS.enCokHiz * Math.pow(n.guc, VURUS.us));
        setVuruslar((v) => v.map((s, i) => (i === sira ? s + 1 : s)));
      }
      nisanBirak();
    }
    hareket.current = { tur: 'yok' };
    // İki parmaktan biri kalkınca kalan parmak kamerayı çevirmeye devam eder.
    if (parmaklar.current.size === 1) {
      const [kimlik, son] = [...parmaklar.current.entries()][0];
      hareket.current = { tur: 'cevir', kimlik, son };
    }
  };

  // Bilgisayarda deneme için: fare tekeri yakınlaştırır.
  const teker = (e: React.WheelEvent) => {
    durum.yakinlik = Math.min(KAMERA.enYakin, Math.max(KAMERA.enUzak, durum.yakinlik * Math.exp(-e.deltaY * 0.0015)));
  };

  // --- Düğmeler
  const temizle = () => {
    parmaklar.current.clear();
    hareket.current = { tur: 'yok' };
    sonUzaklik.current = '';
    setDisari(false);
  };
  const delikYeniden = () => {
    temizle();
    setVuruslar((v) => v.map((s, i) => (i === sira ? 0 : s)));
    setTekrar((n) => n + 1);
    setAsama('oyun');
  };
  const sonraki = () => {
    temizle();
    if (sira + 1 < OYUN_SIRASI.length) {
      setSira(sira + 1);
      setAsama('oyun');
    } else {
      setAsama('turSonu');
    }
  };
  const bastan = () => {
    temizle();
    setVuruslar(OYUN_SIRASI.map(() => 0));
    setSira(0);
    setTekrar((n) => n + 1);
    setAsama('oyun');
  };

  const toplam = vuruslar.reduce((a, b) => a + b, 0);

  return (
    <div className="oy">
      <div className="oy-alan" ref={alanRef} onPointerDown={basildi} onPointerMove={oynadi} onPointerUp={kalkti} onPointerCancel={kalkti} onWheel={teker}>
        <Canvas
          shadows
          orthographic
          dpr={[1, 2]}
          camera={{ position: [0, 20, 0], zoom: KAMERA.yakinlik, near: 0.1, far: 200 }}
          onCreated={({ gl }) => {
            gl.localClippingEnabled = true;
          }}
        >
          <Suspense fallback={null}>
            <OyunSahnesi key={`${no}-${tekrar}`} durum={durum} olay={olay} kare={kare} />
          </Suspense>
        </Canvas>
      </div>

      {!yuklendi && <div className="oy-yukleniyor">{m('oyna.yukleniyor')}</div>}

      {/* Üst bilgi: delik numarası, yer, vuruş, deliğe uzaklık */}
      <div className="oy-ust">
        <div className="oy-kunye">
          <div className="oy-delik">
            <b data-deneme="delik-no">{m('oyna.delik', no)}</b>
            <span>{m('oyna.sira', sira + 1, OYUN_SIRASI.length)}</span>
          </div>
          <div className="oy-yer">{yerAdi(no)}</div>
          <div className="oy-sayilar">
            <span className="oy-vurus">
              {m('oyna.vurus')} <b data-deneme="vurus">{vuruslar[sira]}</b>
            </span>
            <span ref={uzaklikRef} data-deneme="uzaklik" />
          </div>
        </div>
        <KucukPlan delik={durum.delik} topRef={planTopRef} />
      </div>

      {/* Deliği gösteren ok (delik ekranın dışındayken) */}
      <div className="oy-ok" ref={okRef} style={{ display: 'none' }} data-deneme="delik-oku">
        <svg ref={okSimgeRef} viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M4 12h13M12 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span ref={okYaziRef} />
      </div>

      {disari && (
        <div className="oy-bildirim" data-deneme="disari">
          {m('oyna.disari')}
        </div>
      )}

      {/* Alt: ipucu ya da güç; deliği baştan düğmesi */}
      <div className="oy-alt" style={{ visibility: asama === 'oyun' ? 'visible' : 'hidden' }}>
        <div className="oy-guc" ref={gucRef} style={{ visibility: 'hidden' }}>
          <div className="oy-guc-cubuk">
            <div className="oy-guc-dolu" ref={gucDoluRef} />
          </div>
          <span ref={gucYaziRef} />
        </div>
        <div className="oy-alt-satir">
          <button type="button" className="oy-dugme-ince" onClick={delikYeniden} data-deneme="delik-yeniden">
            {m('oyna.delikYeniden')}
          </button>
          <div className="oy-ipucu">
            <div>{m('oyna.ipucu')}</div>
            <div>{m('oyna.ipucuKamera')}</div>
          </div>
          <span className="oy-rozet">{m('oyna.deneme')}</span>
        </div>
      </div>

      {asama === 'delikSonu' && (
        <div className="oy-perde">
          <div className="oy-kart" data-deneme="delik-sonu">
            <div className="oy-kart-ust">{m('oyna.delikBitti', no)}</div>
            <div className="oy-kart-sayi">{vuruslar[sira]}</div>
            <div className="oy-kart-alt">{m('oyna.vurus')}</div>
            <button type="button" className="oy-dugme" onClick={sonraki} data-deneme="sonraki">
              {sira + 1 < OYUN_SIRASI.length ? m('oyna.sonraki') : m('oyna.sonuclar')}
            </button>
            <button type="button" className="oy-dugme-ince" onClick={delikYeniden}>
              {m('oyna.yeniden')}
            </button>
          </div>
        </div>
      )}

      {asama === 'turSonu' && (
        <div className="oy-perde">
          <div className="oy-kart" data-deneme="tur-sonu">
            <div className="oy-kart-ust">{m('oyna.turBitti')}</div>
            <table className="oy-tablo">
              <tbody>
                {OYUN_SIRASI.map((d, i) => (
                  <tr key={d}>
                    <td>{m('oyna.delik', d)}</td>
                    <td className="oy-tablo-yer">{yerAdi(d)}</td>
                    <td className="oy-tablo-sayi">{vuruslar[i]}</td>
                  </tr>
                ))}
                <tr className="oy-tablo-toplam">
                  <td colSpan={2}>{m('oyna.toplam')}</td>
                  <td className="oy-tablo-sayi" data-deneme="toplam">
                    {toplam}
                  </td>
                </tr>
              </tbody>
            </table>
            <button type="button" className="oy-dugme" onClick={bastan}>
              {m('oyna.bastan')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
