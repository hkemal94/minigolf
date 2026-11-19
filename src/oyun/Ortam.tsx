import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BoxGeometry, BufferGeometry, CircleGeometry, Color, CylinderGeometry, DoubleSide, Float32BufferAttribute, IcosahedronGeometry, Matrix4, Object3D, type InstancedMesh, type Material } from 'three';
import { GORUNUS, ORTAM } from './ayarlar';
import type { OyunDeligi } from './dunya';

// OYNANABİLİR PROTOTİP · ortam: maç olmayan, sakin bir gün (Karar: Kemal, 19 Kasım 2026: rüzgâr, kuşlar, uzakta
// birkaç kişi; ad ve hikâye yok). 19 Kasım, Kemal: insanlar bir müddet kapalı (ORTAM.insanlarAcik). Hepsi kodla çizilir; dış model, doku, ses yok. Fizikle ilgisi yok: top hiçbirine
// çarpmaz, hiçbiri pistin içinde durmaz. Sayılar ve yerler DENEME (ayarlar.ts → ORTAM).
// Telefonda hafif kalsın diye: kuşların hepsi tek çizim, insanlar dört çizim (gövde, baş, bacak, yerdeki gölge);
// ağaç ve çim hareketi yeni çizim getirmez (modelin kendi malzemesinde hesaplanır).

// ---------- Rüzgâr: bayrak, ağaç ve çim aynı esintiyi paylaşır ----------
export const RUZGAR = {
  zaman: { value: 0 },
  esinti: { value: 0.5 },
  agac: { value: ORTAM.agacSalinim as number },
  cim: { value: ORTAM.cimEsinti as number },
};
// Esinti: yavaşça artıp azalır (0…1).
export const esinti = (t: number): number => 0.5 + 0.3 * Math.sin(t * ORTAM.esintiHizi) + 0.2 * Math.sin(t * ORTAM.esintiHizi * 2.7 + 1.3);

const sayi = (v: number) => v.toFixed(4);

// Modeldeki ağaçların (zeytin) yaprakları: tepeye doğru daha çok salınır. Gövde ve model dosyası aynı kalır.
export function agacMalzemesi(asil: Material): Material {
  const m = asil.clone();
  m.onBeforeCompile = (s) => {
    s.uniforms.uZaman = RUZGAR.zaman;
    s.uniforms.uSalinim = RUZGAR.agac;
    s.uniforms.uEsinti = RUZGAR.esinti;
    s.vertexShader =
      'uniform float uZaman;\nuniform float uSalinim;\nuniform float uEsinti;\n' +
      s.vertexShader.replace(
        '#include <begin_vertex>',
        `#include <begin_vertex>
        float ruzgarBoy = clamp((position.y - ${sayi(ORTAM.agacAltY)}) / ${sayi(ORTAM.agacBoy)}, 0.0, 1.0);
        float ruzgarSal = sin(uZaman * 0.9 + position.x * 0.35 + position.z * 0.27) + 0.35 * sin(uZaman * 2.3 + position.x * 1.7 + position.y * 2.1);
        transformed.x += uSalinim * (0.5 + uEsinti) * ruzgarBoy * ruzgarSal;
        transformed.z += uSalinim * 0.5 * (0.5 + uEsinti) * ruzgarBoy * sin(uZaman * 0.7 + position.z * 0.4 + position.x * 0.2);`,
      );
  };
  m.customProgramCacheKey = () => 'agac-ruzgar';
  return m;
}

// Çim: üstünden esinti geçer (hafif açılıp koyulan bantlar). Çimin doku yerleşimi dünyadaki yerinden verildiği
// için (dokular.ts) bantların yeri oradan okunur. Aynı malzeme bir kez işlenir.
export function cimeRuzgar(m: Material): void {
  if (m.userData.ruzgar) return;
  m.userData.ruzgar = true;
  const k = (2 * Math.PI) / ORTAM.cimDalgaBoyu;
  const h = k * ORTAM.cimHiz;
  m.onBeforeCompile = (s) => {
    s.uniforms.uZaman = RUZGAR.zaman;
    s.uniforms.uCim = RUZGAR.cim;
    s.uniforms.uEsinti = RUZGAR.esinti;
    s.fragmentShader =
      'uniform float uZaman;\nuniform float uCim;\nuniform float uEsinti;\n' +
      s.fragmentShader.replace(
        '#include <map_fragment>',
        `#include <map_fragment>
        vec2 ruzgarYer = vMapUv * ${sayi(GORUNUS.dokuBoyu.cim)};
        float ruzgarBant = 0.65 * sin(dot(ruzgarYer, vec2(0.87, 0.5)) * ${sayi(k)} - uZaman * ${sayi(h)})
          + 0.35 * sin(dot(ruzgarYer, vec2(0.6, -0.8)) * ${sayi(k * 2.7)} - uZaman * ${sayi(h * 1.6)});
        diffuseColor.rgb *= 1.0 + uCim * (0.5 + uEsinti) * ruzgarBant;`,
      );
  };
  m.customProgramCacheKey = () => 'cim-ruzgar';
}

// ---------- Deneme için okunan hâl (yalnız ?bot=1): kaç kuş, kaç insan çiziliyor ve nerede ----------
export type OrtamDurumu = { kus: number; insan: number; kuslar: [number, number, number][]; insanlar: [number, number][]; dusuk: boolean };
export const yeniOrtamDurumu = (): OrtamDurumu => ({ kus: 0, insan: 0, kuslar: [], insanlar: [], dusuk: false });

// ---------- Kuşlar: iki küçük küme, deliğin üstünde geniş dönüşlerle uçar; kanat çırpar, arada süzülür ----------
const KUS_KOSE = 18; // bir kuş: gövde 2 üçgen, iki kanat 2'şer üçgen (dirsekten geriye kırık)
function kusYeri(i: number, t: number, ox: number, oz: number, hedef: [number, number, number]) {
  const kume = i < 3 ? 0 : 1;
  const yaricap = ORTAM.kusYaricap[kume] + (i % 3) * 1.7;
  const yon = kume === 0 ? 1 : -1;
  const a = yon * ((t * ORTAM.kusHiz) / ORTAM.kusYaricap[kume]) + kume * 2.4 - yon * (i % 3) * 0.3;
  // Dönüşün ortası deliğin yanında: kuşlar her turda bir kez deliğin üstünden geçer, çoğu zaman uzaktadır.
  const kay = 0.9 * ORTAM.kusYaricap[kume];
  hedef[0] = ox + (kume === 0 ? kay : 0) + yaricap * Math.cos(a) + 3 * Math.sin(0.13 * t + kume);
  hedef[1] = ORTAM.kusYukseklik[kume] + 0.4 * Math.sin(0.5 * t + i * 1.7) + (i % 3) * 0.35;
  hedef[2] = oz + (kume === 1 ? 0.75 * kay : 0) + yaricap * 0.75 * Math.sin(a) + 2.5 * Math.cos(0.11 * t + 2 * kume);
}
function Kuslar({ ox, oz, hal }: { ox: number; oz: number; hal: OrtamDurumu }) {
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute(new Float32Array(ORTAM.kusSayisi * KUS_KOSE * 3), 3));
    return g;
  }, []);
  useEffect(() => () => geo.dispose(), [geo]);
  const gecici = useMemo(() => ({ p: [0, 0, 0] as [number, number, number], q: [0, 0, 0] as [number, number, number] }), []);
  useFrame(() => {
    const t = RUZGAR.zaman.value;
    const adet = hal.dusuk ? Math.min(ORTAM.dusukKus, ORTAM.kusSayisi) : ORTAM.kusSayisi;
    const konum = geo.getAttribute('position');
    const { p, q } = gecici;
    const boy = ORTAM.kusKanat * 0.42;
    const yari = ORTAM.kusKanat / 2;
    hal.kus = adet;
    hal.kuslar.length = adet;
    for (let i = 0; i < adet; i++) {
      kusYeri(i, t, ox, oz, p);
      kusYeri(i, t + 0.05, ox, oz, q);
      // Uçuş yönü (yatay) ve sağı
      let fx = q[0] - p[0];
      let fz = q[2] - p[2];
      const fb = Math.hypot(fx, fz) || 1;
      fx /= fb;
      fz /= fb;
      const rx = -fz;
      const rz = fx;
      // Kanat: çırpar, arada süzülür (süzülürken kanat hafif yukarıda durur).
      const cirpma = Math.min(1, Math.max(0, (Math.sin(t * 0.8 + i * 1.9) + 0.2) / 0.5));
      const aci = 0.15 + cirpma * 0.75 * Math.sin(t * 13 + i * 2.3);
      const ya = Math.cos(aci) * yari;
      const yu = Math.sin(aci) * yari;
      const [x, y, z] = p;
      let k = i * KUS_KOSE;
      const yaz = (ileri: number, yana: number, yukari: number) => konum.setXYZ(k++, x + fx * ileri + rx * yana, y + yukari, z + fz * ileri + rz * yana);
      // Gövde: burun, iki yan, kuyruk
      yaz(boy * 0.5, 0, 0);
      yaz(-boy * 0.1, -yari * 0.09, 0);
      yaz(-boy * 0.62, 0, 0);
      yaz(boy * 0.5, 0, 0);
      yaz(-boy * 0.62, 0, 0);
      yaz(-boy * 0.1, yari * 0.09, 0);
      // Kanatlar: kökten dirseğe öne, dirsekten uca geriye (çırpınca uç yukarı aşağı)
      for (const s of [-1, 1]) {
        yaz(boy * 0.3, s * yari * 0.06, 0);
        yaz(boy * 0.38, s * ya * 0.5, yu * 0.45);
        yaz(-boy * 0.18, s * yari * 0.06, 0);
        yaz(boy * 0.38, s * ya * 0.5, yu * 0.45);
        yaz(-boy * 0.3, s * ya, yu);
        yaz(-boy * 0.18, s * yari * 0.06, 0);
      }
      hal.kuslar[i] = [x, y, z];
    }
    konum.needsUpdate = true;
    geo.setDrawRange(0, adet * KUS_KOSE);
  });
  return (
    <mesh geometry={geo} frustumCulled={false}>
      <meshBasicMaterial color="#4B5166" side={DoubleSide} />
    </mesh>
  );
}

// ---------- Uzaktaki insanlar: düşük çokgenli, yüzsüz figürler; birkaçı yürür, öbürleri durur ----------
// Figür +x yönüne bakar; boyu ORTAM.insanBoy. Giysi renkleri marka kitinin lacivert ve krem tonları ile nötr tonlar.
const FIGUR_BOY = 1.66; // aşağıdaki parçaların toplam boyu (ölçek buna göre)
const KALCA = 0.8;
const GIYSI = ['#2C3C72', '#E2DACB', '#5E6B7A', '#F3EFE8', '#0E1C4F'];
const PANTOLON = ['#3A3F4C', '#0E1C4F', '#4A4338', '#2C3C72', '#6B6457'];
const TEN = ['#C89F84', '#A9795C', '#D8B49A', '#8E6447', '#C39374'];
function govdeGeometrisi(): BufferGeometry {
  const govde = new CylinderGeometry(0.165, 0.125, 0.6, 6);
  govde.scale(0.62, 1, 1);
  govde.translate(0, KALCA + 0.3, 0);
  const kollar = [-1, 1].map((s) => {
    const kol = new BoxGeometry(0.075, 0.5, 0.06);
    kol.translate(0, KALCA + 0.33, s * 0.185);
    return kol;
  });
  const hepsi = mergeGeometries([govde, ...kollar]);
  [govde, ...kollar].forEach((g) => g.dispose());
  return hepsi;
}
function basGeometrisi(): BufferGeometry {
  const bas = new IcosahedronGeometry(0.1, 1);
  bas.translate(0, 1.56, 0);
  return bas;
}
function bacakGeometrisi(): BufferGeometry {
  const bacak = new BoxGeometry(0.11, KALCA, 0.1);
  bacak.translate(0, -KALCA / 2, 0); // döndürme noktası kalçada
  return bacak;
}
function Insanlar({ hal }: { hal: OrtamDurumu }) {
  const govdeRef = useRef<InstancedMesh>(null);
  const basRef = useRef<InstancedMesh>(null);
  const bacakRef = useRef<InstancedMesh>(null);
  const golgeRef = useRef<InstancedMesh>(null);
  const geo = useMemo(() => {
    const golge = new CircleGeometry(0.28, 16);
    golge.rotateX(-Math.PI / 2);
    return { govde: govdeGeometrisi(), bas: basGeometrisi(), bacak: bacakGeometrisi(), golge };
  }, []);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);
  const adetEnCok = ORTAM.insanlar.length;
  const arac = useMemo(() => ({ o: new Object3D(), b: new Object3D(), m: new Matrix4(), renk: new Color(), boyandi: false }), []);
  useFrame(() => {
    const [govde, bas, bacak, golge] = [govdeRef.current, basRef.current, bacakRef.current, golgeRef.current];
    if (!govde || !bas || !bacak || !golge) return;
    const t = RUZGAR.zaman.value;
    const adet = hal.dusuk ? Math.min(ORTAM.dusukInsan, adetEnCok) : adetEnCok;
    const olcek = ORTAM.insanBoy / FIGUR_BOY;
    const { o, b, m, renk } = arac;
    if (!arac.boyandi) {
      arac.boyandi = true;
      for (let i = 0; i < adetEnCok; i++) {
        govde.setColorAt(i, renk.set(GIYSI[i % GIYSI.length]));
        bas.setColorAt(i, renk.set(TEN[i % TEN.length]));
        bacak.setColorAt(i * 2, renk.set(PANTOLON[i % PANTOLON.length]));
        bacak.setColorAt(i * 2 + 1, renk.set(PANTOLON[i % PANTOLON.length]));
      }
      for (const ag of [govde, bas, bacak]) if (ag.instanceColor) ag.instanceColor.needsUpdate = true;
    }
    hal.insan = adet;
    hal.insanlar.length = adet;
    for (let i = 0; i < adet; i++) {
      const k = ORTAM.insanlar[i];
      let x = k.x;
      let z = k.z;
      let yon = k.yon ?? 0;
      let adim = 0;
      if (k.x2 !== undefined && k.z2 !== undefined) {
        // Yürüyen: iki uç arasında gidip gelir; adım boyu yaklaşık 1,4 m.
        const dx = k.x2 - k.x;
        const dz = k.z2 - k.z;
        const yol = Math.hypot(dx, dz) || 1;
        const gidilen = (t * ORTAM.yurumeHizi + i * 7.3) % (2 * yol);
        const donuste = gidilen > yol;
        const oran = (donuste ? 2 * yol - gidilen : gidilen) / yol;
        x += dx * oran;
        z += dz * oran;
        yon = Math.atan2(donuste ? -dz : dz, donuste ? -dx : dx);
        adim = 0.42 * Math.sin((gidilen / 1.4) * 2 * Math.PI);
      } else {
        yon += 0.06 * Math.sin(t * 0.4 + i * 2.1); // duran kişi çok hafif kıpırdar
      }
      o.position.set(x, 0, z);
      o.rotation.set(0, -yon, 0);
      o.scale.setScalar(olcek);
      o.updateMatrix();
      govde.setMatrixAt(i, o.matrix);
      bas.setMatrixAt(i, o.matrix);
      for (const s of [0, 1]) {
        b.position.set(0, KALCA, s === 0 ? -0.07 : 0.07);
        b.rotation.set(0, 0, s === 0 ? adim : -adim);
        b.updateMatrix();
        bacak.setMatrixAt(i * 2 + s, m.multiplyMatrices(o.matrix, b.matrix));
      }
      o.position.set(x - 0.1, 0.02, z - 0.12); // gölge güneşin tersine hafif kayık
      o.rotation.set(0, 0, 0);
      o.scale.set(1.25, 1, 0.9);
      o.updateMatrix();
      golge.setMatrixAt(i, o.matrix);
      hal.insanlar[i] = [x, z];
    }
    govde.count = bas.count = golge.count = adet;
    bacak.count = adet * 2;
    for (const ag of [govde, bas, bacak, golge]) ag.instanceMatrix.needsUpdate = true;
  });
  return (
    <>
      <instancedMesh ref={govdeRef} args={[geo.govde, undefined, adetEnCok]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>
      <instancedMesh ref={basRef} args={[geo.bas, undefined, adetEnCok]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.8} flatShading />
      </instancedMesh>
      <instancedMesh ref={bacakRef} args={[geo.bacak, undefined, adetEnCok * 2]} frustumCulled={false}>
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={golgeRef} args={[geo.golge, undefined, adetEnCok]} frustumCulled={false} renderOrder={1}>
        <meshBasicMaterial color="#0E1C4F" transparent opacity={0.18} depthWrite={false} polygonOffset polygonOffsetFactor={-2} polygonOffsetUnits={-4} />
      </instancedMesh>
    </>
  );
}

// ---------- Ortamın tamamı ----------
// dusuk(): kalite düştü mü (gölgeler kapandıysa ortam da azalır: az kuş, az insan; ağaç ve çim durur).
export function Ortam({ delik, hal, dusuk }: { delik: OyunDeligi; hal: OrtamDurumu; dusuk: () => boolean }) {
  const ox = (delik.cerceve.x0 + delik.cerceve.x1) / 2;
  const oz = (delik.cerceve.z0 + delik.cerceve.z1) / 2;
  // Öncelik -1: sahnenin kendi karesinden önce çalışır (bayrak aynı esintiyi okur).
  useFrame((s) => {
    const t = s.clock.elapsedTime;
    hal.dusuk = dusuk();
    RUZGAR.zaman.value = t;
    RUZGAR.esinti.value = esinti(t);
    RUZGAR.agac.value = hal.dusuk ? 0 : ORTAM.agacSalinim;
    RUZGAR.cim.value = hal.dusuk ? 0 : ORTAM.cimEsinti;
  }, -1);
  return (
    <>
      <Kuslar ox={ox} oz={oz} hal={hal} />
      {/* Kemal, 19 Kasım 2026: insanlar bir müddet kapalı (ORTAM.insanlarAcik); kapalıyken hiç çizilmez. */}
      {ORTAM.insanlarAcik && <Insanlar hal={hal} />}
    </>
  );
}
