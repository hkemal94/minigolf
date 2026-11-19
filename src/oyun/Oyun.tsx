import { Suspense, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Canvas } from '@react-three/fiber';
import { m, type MetinAnahtari } from '../metinler';
import { metre } from '../maket/metre';
import { HALKA_RENKLERI, KAMERA, KURAL, KUTLAMA, OYUNCU, PUAN, VURUS, type HalkaRengi } from './ayarlar';
import { renk } from '../sahne/renkler';
import { OYUN_SIRASI, oyunDeligi } from './dunya';
import { vur, yeniTop } from './fizik';
import { vurusHizi } from './tahmin';
import { KucukPlan, planNoktasi } from './KucukPlan';
import { OyunSahnesi, delikYonu, ekranNoktasi, yeniDurum, yerNoktasi, type Durum, type Olay } from './Sahne';
import { parDegeri, rozetler, yildizSayisi, type RozetTuru } from './puan';
import './oyun.css';

// OYNANABİLİR PROTOTİP (Kemal, 19 Kasım 2026: telefonda denenecek ilk oynanış). ?oyna=1 ile açılır.
// Üç delik: 3 (kale), 1 (orta yuvarlak), 7 (tribün sıraları). Değerler DENEME (ayarlar.ts).
// Ekrandaki her yazı src/metinler'den; ses yok.

type Asama = 'oyun' | 'kutlama' | 'delikSonu' | 'turSonu';
type Parmak = { x: number; y: number };
type Hareket =
  | { tur: 'yok' }
  | { tur: 'nisan'; kimlik: number; bas: Parmak }
  | { tur: 'cevir'; kimlik: number; son: Parmak }
  | { tur: 'iki'; aralik: number; yon: number; yakinlik: number; aci: number };

const yerAdi = (no: number) => m(`maket.yer.${no}` as MetinAnahtari);

// Kolay mod oyuncunun telefonunda hatırlanır (yalnız bu ayar; kaldığı yerden devam bu prototipte yok).
const KOLAY_ANAHTARI = 'minigolf.kolayMod';
function kolayOku(): boolean {
  try {
    const v = window.localStorage.getItem(KOLAY_ANAHTARI);
    return v === null ? OYUNCU.kolayMod : v === '1';
  } catch {
    return OYUNCU.kolayMod;
  }
}
// Engelin arkasındaki topun halkasının rengi de hatırlanır (Kemal, 19 Kasım).
const HALKA_ANAHTARI = 'minigolf.halkaRengi';
function halkaOku(): HalkaRengi {
  try {
    const v = window.localStorage.getItem(HALKA_ANAHTARI);
    return (HALKA_RENKLERI as readonly string[]).includes(v ?? '') ? (v as HalkaRengi) : OYUNCU.halkaRengi;
  } catch {
    return OYUNCU.halkaRengi;
  }
}
const sinirla = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

// Yıldızlar: dolu lacivert, boş ince çizgi (sayı PUAN.yildizSayisi; DENEME).
function Yildizlar({ adet, kucuk = false }: { adet: number; kucuk?: boolean }) {
  const boy = kucuk ? 13 : 26;
  return (
    <div className={kucuk ? 'oy-yildizlar oy-yildizlar-kucuk' : 'oy-yildizlar'} role="img" aria-label={m('oyna.yildiz', adet, PUAN.yildizSayisi)} data-deneme="yildiz" data-adet={adet}>
      {Array.from({ length: PUAN.yildizSayisi }, (_, i) => (
        <svg key={i} viewBox="0 0 24 24" width={boy} height={boy} className={i < adet ? 'oy-yildiz-dolu' : 'oy-yildiz-bos'} aria-hidden="true">
          <path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

// Rozet simgeleri (DENEME; adları ve seçimi Kemal'in): tek vuruşta delik, par altı, cezasız.
function RozetSimgesi({ tur }: { tur: RozetTuru }) {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" className={`oy-rozet-simge oy-rozet-${tur}`} role="img" aria-label={m(`oyna.rozet.${tur}` as MetinAnahtari)} data-rozet={tur}>
      <circle cx="12" cy="12" r="10" />
      {tur === 'tekVurus' && <path d="M9.6 9.4l3-2v9.4" />}
      {tur === 'parAlti' && <path d="M7 7.6h10M12 10.6v6.6M8.8 14.2l3.2 3.2 3.2-3.2" />}
      {tur === 'cezasiz' && <path d="M7.4 12.4l3.2 3.2 6-6.6" />}
    </svg>
  );
}

export default function Oyun() {
  // Deneme için (yalnız ?bot=1 ile): ?delik=3|1|7 turu o delikten açar (görüntü almak için).
  const [sira, setSira] = useState(() => {
    const adres = new URLSearchParams(window.location.search);
    const i = adres.has('bot') ? OYUN_SIRASI.indexOf(Number(adres.get('delik'))) : -1;
    return i < 0 ? 0 : i;
  });
  const [tekrar, setTekrar] = useState(0);
  const [vuruslar, setVuruslar] = useState<number[]>(() => OYUN_SIRASI.map(() => 0));
  // Her delikte alınan ceza vuruşu (rozet için: cezasız bitirme).
  const [cezalar, setCezalar] = useState<number[]>(() => OYUN_SIRASI.map(() => 0));
  const [asama, setAsama] = useState<Asama>('oyun');
  const [disari, setDisari] = useState(false);
  const [yuklendi, setYuklendi] = useState(false);
  const [kolay, setKolay] = useState(kolayOku);
  const [halkaRengi, setHalkaRengi] = useState(halkaOku);
  const [ayarAcik, setAyarAcik] = useState(false);

  const no = OYUN_SIRASI[sira];
  // Her delik (ve her "yeniden") için yeni bir oyun hâli.
  // tekrar: "yeniden" denince aynı delik baştan kurulur.
  const durum = useMemo<Durum>(() => yeniDurum(oyunDeligi(no)), [no, tekrar]);
  durum.kolay = kolay;
  durum.halkaRengi = halkaRengi;
  useEffect(() => {
    try {
      window.localStorage.setItem(KOLAY_ANAHTARI, kolay ? '1' : '0');
    } catch {
      // Tarayıcı saklamaya izin vermiyorsa ayar yalnız bu açılışta geçerli.
    }
  }, [kolay]);
  useEffect(() => {
    try {
      window.localStorage.setItem(HALKA_ANAHTARI, halkaRengi);
    } catch {
      // Saklanamazsa seçim yalnız bu açılışta geçerli.
    }
  }, [halkaRengi]);

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
        cezalar,
        kutlama: durum.kutlama,
        bayrakKalkis: durum.bayrakKalkis,
        ortam: durum.ortam,
        top: { ...durum.top },
        onceki: durum.onceki,
        aci: durum.aci,
        egim: durum.egim,
        takip: durum.takip,
        hedefAci: durum.hedefAci,
        kolay: durum.kolay,
        halkaRengi: durum.halkaRengi,
        tahmin: durum.tahmin,
        tahminGorunur: durum.tahminGorunur,
        delikYonu: delikYonu(durum),
        yakinlik: durum.yakinlik,
        topEkran: durum.topEkran,
        nisan: { ...durum.nisan },
        hazir: durum.kamera !== null && yuklendi,
        cizim: durum.cizim,
        alan: alanRef.current?.getBoundingClientRect().toJSON(),
      }),
      ekran: (x: number, y: number, z: number) => ekranNoktasi(durum, x, y, z),
      // Görüntü almak için kamerayı yerleştirir (oyunda parmakla yapılanın aynısı; fiziğe dokunmaz).
      kamera: (k: { aci?: number; egim?: number; yakinlik?: number; bak?: [number, number, number] | null }) => {
        if (k.bak !== undefined) durum.bakisNoktasi = k.bak;
        if (k.aci !== undefined) durum.aci = k.aci;
        if (k.egim !== undefined) durum.egim = k.egim;
        if (k.yakinlik !== undefined) durum.yakinlik = k.yakinlik;
      },
      // Görüntü almak için kutlamayı verilen saniyede bekletir (kart açılmaz); oyunda kullanılmaz.
      kutlamaDur: (sn: number | null) => {
        durum.kutlamaDur = sn;
      },
    };
    return () => {
      delete w.__minigolf;
    };
  }, [durum, no, sira, asama, vuruslar, cezalar, yuklendi]);

  // --- Sahnedeki olaylar
  const olay = useCallback(
    (o: Olay) => {
      if (o === 'delik') {
        // Kısa kutlama (bayrak kalkar, dalgalanır); delik sonu kartı ondan sonra açılır.
        durum.kilitli = true;
        durum.kutlama = 0;
        setAsama('kutlama');
      } else if (o === 'disari') {
        // Top dışarı çıktı (Kemal, 19 Kasım): son vuruşun yerine döner; vuruş sayıldı, üstüne KURAL.disariCeza ceza vuruşu.
        const [x, y, z] = durum.onceki;
        durum.top = yeniTop(x, y, z);
        durum.birikim = 0;
        if (KURAL.disariCeza > 0) setVuruslar((v) => v.map((n, i) => (i === sira ? n + KURAL.disariCeza : n)));
        setCezalar((v) => v.map((n, i) => (i === sira ? n + 1 : n)));
        setDisari(true);
      }
    },
    [durum, sira],
  );
  useEffect(() => {
    if (asama !== 'kutlama' || durum.kutlamaDur !== null) return;
    const z = window.setTimeout(() => setAsama('delikSonu'), KUTLAMA.sure * 1000);
    return () => window.clearTimeout(z);
  }, [asama, durum]);
  useEffect(() => {
    if (!disari) return;
    const z = window.setTimeout(() => setDisari(false), 3500);
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
  // Oyuncu kamerayı eliyle oynatınca otomatik dönüşler o an bırakılır.
  const kameraElde = () => {
    durum.takip = false;
    durum.hedefAci = null;
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
      kameraElde();
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
      // Tek parmak boşta: sağa sola sürüklemek kamerayı topun çevresinde çevirir (sınırsız, tam tur),
      // yukarı aşağı sürüklemek eğer (aşağı: daha tepeden, yukarı: daha yandan; sınırlı).
      const dx = p.x - h.son.x;
      const dy = p.y - h.son.y;
      if (dx !== 0 || dy !== 0) kameraElde();
      durum.aci -= dx * KAMERA.cevirHizi;
      durum.egim = sinirla(durum.egim + dy * KAMERA.egimHizi, KAMERA.enAzEgim, KAMERA.enCokEgim);
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
        vur(t, n.yonX, n.yonZ, vurusHizi(n.guc));
        // Kamera top durana kadar topu izler.
        durum.takip = true;
        durum.hedefAci = null;
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
  // Deliğe bak: kamera topun arkasına döner, delik topun önünde kalır.
  const deligeBak = () => {
    durum.takip = false;
    durum.hedefAci = delikYonu(durum);
  };
  const temizle = () => {
    parmaklar.current.clear();
    hareket.current = { tur: 'yok' };
    sonUzaklik.current = '';
    setDisari(false);
    setAyarAcik(false);
  };
  const delikYeniden = () => {
    temizle();
    setVuruslar((v) => v.map((s, i) => (i === sira ? 0 : s)));
    setCezalar((v) => v.map((s, i) => (i === sira ? 0 : s)));
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
    setCezalar(OYUN_SIRASI.map(() => 0));
    setSira(0);
    setTekrar((n) => n + 1);
    setAsama('oyun');
  };

  const toplam = vuruslar.reduce((a, b) => a + b, 0);
  const toplamPar = OYUN_SIRASI.reduce((a, d) => a + parDegeri(d), 0);
  const toplamYildiz = OYUN_SIRASI.reduce((a, d, i) => a + yildizSayisi(d, vuruslar[i]), 0);

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
            <span data-deneme="par">{m('oyna.par', parDegeri(no))}</span>
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
          {m('oyna.disari', KURAL.disariCeza)}
        </div>
      )}

      {/* Alt: ipucu ya da güç; deliği baştan düğmesi */}
      <div className="oy-alt" style={{ visibility: asama === 'oyun' ? 'visible' : 'hidden' }}>
        <div className="oy-guc" ref={gucRef} style={{ visibility: 'hidden' }}>
          <div className="oy-guc-cubuk">
            <div className="oy-guc-dolu" ref={gucDoluRef} />
            {/* Barem: %25, %50, %75 çentikleri */}
            {[25, 50, 75].map((c) => (
              <i key={c} className="oy-guc-centik" style={{ left: `${c}%` }} data-deneme="guc-centik" />
            ))}
          </div>
          <span ref={gucYaziRef} />
        </div>
        <div className="oy-arac">
          <button type="button" className="oy-dugme-kucuk" onClick={deligeBak} data-deneme="delige-bak">
            <svg viewBox="0 0 24 24" width="14" height="14" aria-hidden="true">
              <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="12" cy="12" r="2.4" fill="currentColor" />
            </svg>
            {m('oyna.deligeBak')}
          </button>
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
          <button type="button" className="oy-dugme-simge" onClick={() => setAyarAcik((a) => !a)} aria-label={m('oyna.ayarlar')} data-deneme="ayarlar">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M4 7h10M18 7h2M4 17h2M10 17h10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <circle cx="16" cy="7" r="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
              <circle cx="8" cy="17" r="2.2" fill="none" stroke="currentColor" strokeWidth="2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Küçük ayar menüsü: kolay mod, engelin arkasındaki topun halkasının rengi */}
      {ayarAcik && asama === 'oyun' && (
        <div className="oy-ayar" data-deneme="ayar-menusu">
          <div className="oy-ayar-baslik">{m('oyna.ayarlar')}</div>
          <label className="oy-ayar-satir">
            <span>
              <b>{m('oyna.kolayMod')}</b>
              <small>{m('oyna.kolayModAciklama')}</small>
            </span>
            <input type="checkbox" checked={kolay} onChange={(e) => setKolay(e.target.checked)} data-deneme="kolay-mod" />
            <i className="oy-anahtar" aria-hidden="true" />
          </label>
          <div className="oy-ayar-satir" data-deneme="halka-rengi">
            <span>
              <b>{m('oyna.halkaRengi')}</b>
              <small>{m('oyna.halkaRengiAciklama')}</small>
            </span>
            <span className="oy-renkler" role="radiogroup" aria-label={m('oyna.halkaRengi')}>
              {HALKA_RENKLERI.map((r) => (
                <button
                  key={r}
                  type="button"
                  role="radio"
                  aria-checked={halkaRengi === r}
                  aria-label={m(`oyna.renk.${r}` as MetinAnahtari)}
                  title={m(`oyna.renk.${r}` as MetinAnahtari)}
                  className={`oy-renk${halkaRengi === r ? ' secili' : ''}`}
                  style={{ background: renk[r] }}
                  onClick={() => setHalkaRengi(r)}
                  data-renk={r}
                />
              ))}
            </span>
          </div>
          <button type="button" className="oy-dugme-ince" onClick={() => setAyarAcik(false)}>
            {m('oyna.kapat')}
          </button>
        </div>
      )}

      {asama === 'delikSonu' && (
        <div className="oy-perde">
          <div className="oy-kart" data-deneme="delik-sonu">
            <div className="oy-kart-ust">{m('oyna.delikBitti', no)}</div>
            <div className="oy-kart-sayi">{vuruslar[sira]}</div>
            <div className="oy-kart-alt">
              {m('oyna.vurus')} · <span data-deneme="delik-par">{m('oyna.par', parDegeri(no))}</span>
            </div>
            <Yildizlar adet={yildizSayisi(no, vuruslar[sira])} />
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
              <thead>
                <tr>
                  <th>{m('oyna.liste.delik')}</th>
                  <th className="oy-tablo-orta">{m('oyna.liste.par')}</th>
                  <th className="oy-tablo-orta">{m('oyna.vurus')}</th>
                  <th className="oy-tablo-sag">{m('oyna.liste.yildiz')}</th>
                </tr>
              </thead>
              <tbody>
                {OYUN_SIRASI.map((d, i) => (
                  <tr key={d} data-deneme="liste-satir">
                    <td>
                      <div className="oy-tablo-delik">
                        <b>{m('oyna.delik', d)}</b>
                        {/* Rozetler: küçük simge, yalnız listede (pulun yerine geçmez) */}
                        <span className="oy-rozetler" data-deneme="rozetler">
                          {rozetler(d, vuruslar[i], cezalar[i]).map((r) => (
                            <RozetSimgesi key={r} tur={r} />
                          ))}
                        </span>
                      </div>
                      <div className="oy-tablo-yer">{yerAdi(d)}</div>
                    </td>
                    <td className="oy-tablo-orta">{parDegeri(d)}</td>
                    <td className="oy-tablo-orta oy-tablo-sayi">{vuruslar[i]}</td>
                    <td className="oy-tablo-sag">
                      <Yildizlar adet={yildizSayisi(d, vuruslar[i])} kucuk />
                    </td>
                  </tr>
                ))}
                <tr className="oy-tablo-toplam">
                  <td>{m('oyna.toplam')}</td>
                  <td className="oy-tablo-orta">{toplamPar}</td>
                  <td className="oy-tablo-orta oy-tablo-sayi" data-deneme="toplam">
                    {toplam}
                  </td>
                  <td className="oy-tablo-sag" data-deneme="toplam-yildiz">
                    <svg viewBox="0 0 24 24" width="12" height="12" className="oy-yildiz-dolu oy-yildiz-toplam" aria-hidden="true">
                      <path d="M12 3.2l2.6 5.5 6 .8-4.4 4.2 1.1 6-5.3-2.9-5.3 2.9 1.1-6-4.4-4.2 6-.8z" strokeWidth="1.6" strokeLinejoin="round" />
                    </svg>
                    {m('oyna.yildizToplam', toplamYildiz, OYUN_SIRASI.length * PUAN.yildizSayisi)}
                  </td>
                </tr>
              </tbody>
            </table>
            {/* Rozetlerin açıklaması: ad değil, ne olduğu (adlar Kemal'in); değerler deneme */}
            <div className="oy-rozet-aciklama" data-deneme="rozet-aciklama">
              <span>{m('oyna.rozet.baslik')}</span>
              {PUAN.rozetler.map((r) => (
                <span key={r}>
                  <RozetSimgesi tur={r} />
                  {m(`oyna.rozet.${r}` as MetinAnahtari)}
                </span>
              ))}
            </div>
            <button type="button" className="oy-dugme" onClick={bastan}>
              {m('oyna.bastan')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
