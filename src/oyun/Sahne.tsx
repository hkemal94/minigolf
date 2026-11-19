import { useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import { BoxGeometry, BufferGeometry, Color, DirectionalLight, DoubleSide, Float32BufferAttribute, Mesh, MeshStandardMaterial, Object3D, Plane, Quaternion, TextureLoader, Vector3, type Group, type InstancedMesh, type Material, type OrthographicCamera } from 'three';
import { renk } from '../sahne/renkler';
import { DENEME, GOLF, MODEL, TOP_YARICAP, WMF } from '../maket/olculer';
import { BOS_KOLTUK, MERDIVEN_X0, TRIBUN_X1, koltukX, koltukZ, siraOn, siraY } from '../maket/ornekDelikler';
import { FIZIK, GORUNTU, GORUNUS, KAMERA, SEFFAFLIK, VURUS } from './ayarlar';
import { engelArkasinda, seffafDegerler, seffafYap } from './seffaflik';
import { DOKU_DOSYALARI, dokuBellegi, dokulariHazirla, dunyaYerlesimi, fileDokusu, fileGeometrisi, gokYansimasi, modelDokusu, modelMalzemesi, modelYerlesimi, topKabartisi, type Dokular } from './dokular';
import { adimAt, yeniTop, type Top } from './fizik';
import { tahminEt, type Tahmin } from './tahmin';
import type { OyunDeligi } from './dunya';

// OYNANABİLİR PROTOTİP · 3B sahne. Stat modeli maketle aynı dosya (public/modeller/dirlik-stadi.glb);
// saha işaretleri modelin kendisinde (19 Kasım 2026), burada kodla çizilmez.
const STAT_MODELI = `${import.meta.env.BASE_URL}modeller/dirlik-stadi.glb`;

// Oyunun her karede değişen hâli. React'in dışında tutulur (her karede ekran yeniden kurulmasın diye).
export type Durum = {
  delik: OyunDeligi;
  top: Top;
  onceki: [number, number, number]; // son vuruştan önce topun yeri
  birikim: number; // hesaplanmayı bekleyen süre
  aci: number; // kameranın baktığı yön (radyan; x'ten z'ye)
  egim: number; // kameranın yerden açısı (radyan)
  hedefAci: number | null; // "Deliğe bak": kameranın döneceği yön
  takip: boolean; // vuruştan sonra kamera topu izliyor (top durana ya da oyuncu kamerayı elle çevirene kadar)
  yakinlik: number;
  hedef: Vector3; // kameranın izlediği nokta (topu yumuşak izler)
  nisan: { aktif: boolean; yonX: number; yonZ: number; guc: number };
  kolay: boolean; // kolay mod: çekerken topun duracağı yer görünür
  // Kolay moddaki tahmin ve hangi nişan için hesaplandığı (nişan değişmedikçe yeniden hesaplanmaz).
  tahmin: (Tahmin & { yonX: number; yonZ: number; guc: number }) | null;
  tahminGorunur: boolean; // işaret şu an ekranda mı (deneme için)
  topEkran: [number, number]; // topun ekrandaki yeri (piksel)
  kamera: OrthographicCamera | null;
  en: number;
  boy: number;
  kilitli: boolean; // delik bitti: vuruş alınmaz
  // Son karenin çizim yükü ve süresi (deneme için); doku sayısı, dokuların yaklaşık belleği (MB), gölge açık mı.
  // engel: top bir engelin arkasında mı (0–1; şeffaflığın o anki gücü).
  cizim: { cagri: number; ucgen: number; kare: number; doku: number; dokuMB: number; golge: boolean; engel: number };
  bakisNoktasi: [number, number, number] | null; // deneme için (?bot=1): kamera topu değil bu noktayı izler
};

export function yeniDurum(delik: OyunDeligi): Durum {
  const [x, y, z] = delik.baslangic;
  return {
    delik,
    top: yeniTop(x, y, z),
    onceki: [x, y, z],
    birikim: 0,
    aci: Math.atan2(delik.bakis[1], delik.bakis[0]),
    egim: KAMERA.egim,
    hedefAci: null,
    takip: false,
    yakinlik: KAMERA.yakinlik,
    hedef: new Vector3(x, y, z),
    nisan: { aktif: false, yonX: 0, yonZ: 0, guc: 0 },
    kolay: false,
    tahmin: null,
    tahminGorunur: false,
    topEkran: [-1, -1],
    kamera: null,
    en: 1,
    boy: 1,
    kilitli: false,
    cizim: { cagri: 0, ucgen: 0, kare: 0, doku: 0, dokuMB: 0, golge: true, engel: 0 },
    bakisNoktasi: null,
  };
}

// İki yön arasındaki en kısa dönüş (radyan, -π…π).
export function aciFarki(a: number, b: number): number {
  let f = (a - b) % (2 * Math.PI);
  if (f > Math.PI) f -= 2 * Math.PI;
  if (f < -Math.PI) f += 2 * Math.PI;
  return f;
}

// "Deliğe bak": kameranın topun arkasından deliğe bakan yönü.
export const delikYonu = (d: Durum): number => Math.atan2(d.delik.dunya.delik.z - d.top.z, d.delik.dunya.delik.x - d.top.x);

// Ekrandaki bir noktanın, verilen yükseklikteki yatay düzlemde denk geldiği yer.
export function yerNoktasi(d: Durum, px: number, py: number, y: number): [number, number] | null {
  const k = d.kamera;
  if (!k) return null;
  const bas = new Vector3((px / d.en) * 2 - 1, -((py / d.boy) * 2 - 1), -1).unproject(k);
  const yon = k.getWorldDirection(new Vector3());
  if (Math.abs(yon.y) < 1e-6) return null;
  const t = (y - bas.y) / yon.y;
  return [bas.x + yon.x * t, bas.z + yon.z * t];
}

// Dünyadaki bir noktanın ekrandaki yeri (piksel).
export function ekranNoktasi(d: Durum, x: number, y: number, z: number): [number, number] {
  if (!d.kamera) return [-1, -1];
  const v = new Vector3(x, y, z).project(d.kamera);
  return [((v.x + 1) / 2) * d.en, ((1 - v.y) / 2) * d.boy];
}

// ---------- Stat modeli ----------
// Tribün deliğinde modelin oturma tahtaları bu kutunun içinde çizilmez; yerlerine tek tek koltuk gelir
// (Kemal, 18 Kasım 2026). Model dosyasına dokunulmaz. (Maketteki OrnekDelik.tsx ile aynı bölge.)
const KOLTUK_BOLGE = { x0: MERDIVEN_X0 - 4.5, x1: TRIBUN_X1 + 3.5, z0: siraOn(MODEL.acikTribunSira) - 0.7, z1: siraOn(1) };

// Modelin zemin malzemeleri: topun üstünde durduğu yer; engel sayılmaz, şeffaflaşmaz. File oyunda çizilmez.
const ZEMIN_MALZEMELERI = new Set(['zemin', 'cim', 'cim2', 'cizgi', 'file']);

function StatModeli({ koltuklu, dokular }: { koltuklu: boolean; dokular: Dokular }) {
  const gltf = useLoader(GLTFLoader, STAT_MODELI);
  const sahne = useMemo(() => {
    const kopya = gltf.scene.clone(true);
    const duzlemler = [
      new Plane(new Vector3(-1, 0, 0), KOLTUK_BOLGE.x0),
      new Plane(new Vector3(1, 0, 0), -KOLTUK_BOLGE.x1),
      new Plane(new Vector3(0, 0, -1), KOLTUK_BOLGE.z0),
      new Plane(new Vector3(0, 0, 1), -KOLTUK_BOLGE.z1),
    ];
    kopya.traverse((o: Object3D) => {
      if (!(o instanceof Mesh)) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const ad = (o.material as Material).name;
      // Dokulu gerçekçi görünüş (Kemal, 19 Kasım): çim, toprak, beton, taş, ahşap. Modelde doku yerleşimi yok;
      // dünyadaki yerinden verilir. Modelin kendi rengi korunur (dokular.ts).
      const dokulu = modelMalzemesi(dokular, o.material as Material);
      const doku = modelDokusu(ad);
      if (dokulu && doku) {
        o.geometry = modelYerlesimi(o, GORUNUS.dokuBoyu[doku]);
        o.material = dokulu;
      } else if (ad === 'demir') {
        const demir = (o.material as Material).clone() as Material & { metalness: number; roughness: number };
        demir.metalness = 0.5;
        demir.roughness = 0.55;
        o.material = demir;
      }
      if (ad === 'zemin') {
        // Toprak zemin ile çimin tabanı üst üste titremesin diye zemin geriye itilir.
        const zemin = (o.material as Material).clone();
        zemin.polygonOffset = true;
        zemin.polygonOffsetFactor = 2;
        zemin.polygonOffsetUnits = 8;
        o.material = zemin;
      }
      if (ad === 'file') {
        // Kale filesi modelde dolu kutu (yerde ince bir levha ve arkada bir duvar): saydam çizilince cam gibi
        // görünüyor, yerdeki levha çimle üst üste binip titriyordu (Kemal, 19 Kasım). Oyunda çizilmez;
        // yerine KaleFilesi gelir. Model dosyasına dokunulmaz.
        o.visible = false;
      }
      if (koltuklu && (ad === 'krem' || ad === 'lacivert')) {
        const kesik = (o.material as Material).clone();
        kesik.clippingPlanes = duzlemler;
        kesik.clipIntersection = true;
        kesik.clipShadows = true;
        o.material = kesik;
      }
      // Engelin arkasında kalan top: zemin şeffaflaşmaz (top onun üstünde durur); öbür her şey engeldir.
      if (ZEMIN_MALZEMELERI.has(ad)) o.userData.engelDegil = true;
      else seffafYap(o.material as Material);
    });
    return kopya;
  }, [gltf, koltuklu, dokular]);
  return <primitive object={sahne} />;
}

// ---------- Kutu yığını: çok sayıda kutuyu tek çizimle çizer (telefonda akıcılık) ----------
type KutuCizimi = { x: number; y: number; z: number; sx: number; sy: number; sz: number; aci?: number; renk: string };
function KutuYigini({ kutular, golge = true }: { kutular: KutuCizimi[]; golge?: boolean }) {
  const ref = useRef<InstancedMesh>(null);
  useLayoutEffect(() => {
    const ag = ref.current;
    if (!ag) return;
    const o = new Object3D();
    const c = new Color();
    kutular.forEach((k, i) => {
      o.position.set(k.x, k.y, k.z);
      o.rotation.set(0, k.aci ?? 0, 0);
      o.scale.set(k.sx, k.sy, k.sz);
      o.updateMatrix();
      ag.setMatrixAt(i, o.matrix);
      ag.setColorAt(i, c.set(k.renk));
    });
    ag.instanceMatrix.needsUpdate = true;
    if (ag.instanceColor) ag.instanceColor.needsUpdate = true;
    ag.computeBoundingSphere();
    seffafYap(ag.material as Material);
  }, [kutular]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, kutular.length]} castShadow={golge} receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.7} />
    </instancedMesh>
  );
}

// Tribün koltukları: oturak, ayak, sırtlık (maketteki çizimle aynı ölçüler; koltuk ölçüsü DENEME).
function koltukKutulari(): KutuCizimi[] {
  const liste: KutuCizimi[] = [];
  const kalin = MODEL.tahtaKalinlik;
  const derin = MODEL.tahtaEn;
  const sirt = DENEME.koltukSirt;
  const oturakEn = DENEME.koltukEn - 0.07;
  for (let sira = 1; sira <= MODEL.acikTribunSira; sira++) {
    const acik = sira === 2 || sira === 5; // modeldeki tahtaların sırasıyla: 2. ve 5. sıra krem
    const koltukRengi = acik ? renk.krem : renk.lacivertAcik;
    const ayakRengi = acik ? renk.kremKoyu : renk.lacivert;
    const xler: number[] = [];
    for (let i = 0; koltukX(i)[1] <= KOLTUK_BOLGE.x1; i++) if (BOS_KOLTUK[sira] !== i) xler.push((koltukX(i)[0] + koltukX(i)[1]) / 2);
    for (let x = MERDIVEN_X0 - DENEME.koltukAralik / 2; x - DENEME.koltukEn / 2 >= KOLTUK_BOLGE.x0; x -= DENEME.koltukAralik) xler.push(x);
    const [z0, z1] = koltukZ(sira);
    const y = siraY(sira);
    for (const x of xler) {
      liste.push({ x, y: y + kalin / 4, z: (z0 + z1) / 2, sx: DENEME.koltukEn, sy: kalin / 2, sz: derin, renk: ayakRengi });
      liste.push({ x, y: y + kalin * 0.75, z: (z0 + z1) / 2 + 0.01, sx: oturakEn, sy: kalin / 2, sz: derin - 0.04, renk: koltukRengi });
      liste.push({ x, y: y + kalin + sirt / 2, z: z0 + 0.03, sx: oturakEn, sy: sirt, sz: 0.05, renk: koltukRengi });
    }
  }
  return liste;
}

function bordurKutulari(delik: OyunDeligi): KutuCizimi[] {
  const h = DENEME.bordurYukseklik;
  const e = DENEME.bordurEn;
  return delik.bordurler.flatMap((b) =>
    b.noktalar.slice(0, -1).map((a, i) => {
      const s = b.noktalar[i + 1];
      const dx = s[0] - a[0];
      const dz = s[1] - a[1];
      return { x: (a[0] + s[0]) / 2, y: b.y + h / 2, z: (a[1] + s[1]) / 2, sx: Math.hypot(dx, dz) + e, sy: h, sz: e, aci: Math.atan2(-dz, dx), renk: renk.kiremit };
    }),
  );
}

// Antrenman hunileri (1. delik; DENEME, Kemal onaylamadı): taban ve koni. Yeri delik verisinden.
function Huniler({ delik }: { delik: OyunDeligi }) {
  const huniler = delik.veri.kutular.filter((k) => k.tur === 'huni');
  const ref = useRef<Group>(null);
  useLayoutEffect(() => {
    ref.current?.traverse((o) => {
      if (o instanceof Mesh) seffafYap(o.material as Material);
    });
  }, [huniler]);
  return (
    <group ref={ref}>
      {huniler.map((k, i) => {
        const t = k.x1 - k.x0;
        return (
          <group key={i} position={[(k.x0 + k.x1) / 2, delik.zeminY + delik.kaldirma, (k.z0 + k.z1) / 2]}>
            <mesh position={[0, 0.01, 0]} castShadow receiveShadow>
              <boxGeometry args={[t, 0.02, t]} />
              <meshStandardMaterial color={renk.lacivertAcik} roughness={1} />
            </mesh>
            <mesh position={[0, 0.02 + GORUNTU.huniBoy / 2, 0]} castShadow>
              <cylinderGeometry args={[0.02, t / 2 - 0.02, GORUNTU.huniBoy, 16]} />
              <meshStandardMaterial color={renk.krem} roughness={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Kale filesi (Kemal, 19 Kasım: "titriyor, cam gibi"; sonra: "gerçek ağ"): ip dokulu, arası boş yüzeyler.
// Fizikteki ağlarla aynı yerde: iki yan file, arka file ve üstte kale direğinden arkaya inen file.
// Derinliğe yazmaz (yüzeyler birbirini kesmez, titremez); uzaktan ipler incelip solar.
// Göz aralığı ve ip kalınlığı DENEME (GORUNTU.fileGoz, GORUNUS.fileIp).
function KaleFilesi() {
  const geo = useMemo(() => fileGeometrisi(), []);
  const doku = useMemo(() => fileDokusu(), []);
  return (
    <mesh geometry={geo} renderOrder={2}>
      <meshBasicMaterial map={doku} transparent depthWrite={false} side={DoubleSide} />
    </mesh>
  );
}

// Bordür: kiremit rengi korunur (düz renk); yüzeyi boyalı beton gibi hafif pürüzlü (beton kabartısı). Tek çizim.
function Bordurler({ kutular, dokular }: { kutular: KutuCizimi[]; dokular: Dokular }) {
  const geo = useMemo(() => {
    const parcalar = kutular.map((k) => {
      const g = new BoxGeometry(k.sx, k.sy, k.sz);
      g.rotateY(k.aci ?? 0);
      g.translate(k.x, k.y, k.z);
      return g;
    });
    const hepsi = mergeGeometries(parcalar);
    parcalar.forEach((g) => g.dispose());
    const sonuc = dunyaYerlesimi(hepsi, null, GORUNUS.dokuBoyu.beton);
    hepsi.dispose();
    return sonuc;
  }, [kutular]);
  const malzeme = useMemo(() => {
    const m = new MeshStandardMaterial({ color: renk.kiremit, roughness: 0.8, normalMap: dokular.beton.normal });
    m.normalScale.setScalar(GORUNUS.kabarti.bordur);
    seffafYap(m);
    return m;
  }, [dokular]);
  useEffect(() => () => geo.dispose(), [geo]);
  useEffect(() => () => malzeme.dispose(), [malzeme]);
  return <mesh geometry={geo} material={malzeme} castShadow receiveShadow />;
}

// Delik bayrağı: donuk durmaz, hafif rüzgârda dalgalanır (Kemal, 19 Kasım). Büyük kutlama dalgası sonraki adımda.
// Bez direğe bağlı kenarda durur, uca doğru daha çok oynar. Genlik ve hız DENEME (GORUNUS).
const BAYRAK = { boy: 0.22, en: 0.16, dilim: 10, sira: 3 };
function bayrakGeometrisi(): BufferGeometry {
  const g = new BufferGeometry();
  const { dilim, sira } = BAYRAK;
  const sira1 = sira + 1;
  g.setAttribute('position', new Float32BufferAttribute(new Float32Array((dilim + 1) * sira1 * 3), 3));
  const sirala: number[] = [];
  for (let i = 0; i < dilim; i++) {
    for (let j = 0; j < sira; j++) {
      const a = i * sira1 + j;
      sirala.push(a, a + sira1, a + 1, a + 1, a + sira1, a + sira1 + 1);
    }
  }
  g.setIndex(sirala);
  return g;
}
function bayrakDalgalandir(g: BufferGeometry, t: number) {
  const p = g.getAttribute('position');
  const { boy, en, dilim, sira } = BAYRAK;
  for (let i = 0; i <= dilim; i++) {
    const u = i / dilim; // 0 direk, 1 uç
    const dalga = Math.sin(u * GORUNUS.bayrakDalga * 2 * Math.PI - t * GORUNUS.bayrakHiz) + 0.4 * Math.sin(u * 5.1 - t * GORUNUS.bayrakHiz * 1.7 + 1);
    const yana = GORUNUS.bayrakGenlik * u * dalga;
    for (let j = 0; j <= sira; j++) {
      // Uç hafifçe sarkar (dalgayla birlikte)
      const sarkma = 0.006 * u * u * (1 + 0.5 * Math.sin(t * GORUNUS.bayrakHiz * 0.6));
      p.setXYZ(i * (sira + 1) + j, yana, (j / sira - 0.5) * en - sarkma, u * boy);
    }
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
}

// Nişan okunun ucu: yere yatık üçgen.
function useUcgen() {
  return useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute('position', new Float32BufferAttribute([0, 0, -0.045, 0, 0, 0.045, 0.1, 0, 0], 3));
    g.computeVertexNormals();
    return g;
  }, []);
}

// Güneşin hedefe uzaklığı (m). Gölge kutusunun derinliği bunun 25 m önü ve arkası: dar tutulur ki küçük
// eşyaların (top 4 cm, bordür 8 cm) gölgesi kaybolmasın.
const GUNES_UZAKLIK = Math.hypot(...GORUNUS.gunesYon);

// Kalite (yalnız deneme için adresle): ?kalite=yuksek gölgeleri hep açık tutar, ?kalite=dusuk baştan kapatır.
// Yazılmazsa oyun kare hızını ölçüp kendisi karar verir.
const KALITE = new URLSearchParams(window.location.search).get('kalite');
// Gölgeler bir kez kapandıysa sonraki deliklerde de kapalı kalır (her delikte yeniden ölçülüp takılmasın).
let golgeKapandi = KALITE === 'dusuk';

export type Olay = 'durdu' | 'delik' | 'disari';

type Ozellik = {
  durum: Durum;
  olay: (o: Olay) => void;
  // Her karede ekrandaki yazı ve işaretleri günceller (React'i yormadan).
  kare: (d: Durum) => void;
};

export function OyunSahnesi({ durum, olay, kare }: Ozellik) {
  const delik = durum.delik;
  const topRef = useRef<Mesh>(null);
  const okRef = useRef<Group>(null);
  const govdeRef = useRef<Mesh>(null);
  const ucRef = useRef<Mesh>(null);
  const cekmeRef = useRef<Mesh>(null);
  const bayrakRef = useRef<Group>(null);
  const engelRef = useRef<Group>(null);
  const halkaRef = useRef<Mesh>(null);
  // Engelin arkasında kalan top: ışının zamanlayıcısı, sonucu ve şeffaflığın o anki gücü (SEFFAFLIK; DENEME).
  const seffaf = useMemo(() => ({ bekle: 0, arkada: false, guc: 0, yon: new Vector3(), top: new Vector3(), ara: new Vector3(), sonTop: new Vector3(1e9, 0, 0), sonYon: new Vector3() }), []);
  const gl = useThree((s) => s.gl);
  // Dokular (Poly Haven, ambientCG; docs/lisanslar.md) ve kodla hesaplananlar (top gamzeleri, file, gök yansıması).
  const yuklenen = useLoader(TextureLoader, DOKU_DOSYALARI);
  const dokular = useMemo(() => dokulariHazirla(yuklenen, gl), [yuklenen, gl]);
  const gamze = useMemo(() => topKabartisi(), []);
  const gok = useMemo(() => gokYansimasi(gl), [gl]);
  const bayrakGeo = useMemo(() => bayrakGeometrisi(), []);
  useEffect(() => () => bayrakGeo.dispose(), [bayrakGeo]);
  const isik = useMemo(() => new DirectionalLight(), []);
  // Kalite ölçümü: kare hızı düşükse gölgeler kapanır (GORUNUS.golgeKapatFps; DENEME).
  const olcum = useRef({ sure: 0, kare: 0, bekleme: GORUNUS.olcumBekleme as number, dusuk: 0, bitti: KALITE === 'yuksek' || golgeKapandi });
  const donus = useMemo(() => ({ eksen: new Vector3(), q: new Quaternion() }), []);
  useLayoutEffect(() => {
    durum.cizim.golge = !golgeKapandi;
    durum.cizim.dokuMB = dokuBellegi([...yuklenen, gamze, fileDokusu()], golgeKapandi ? 0 : GORUNUS.golgeBoyu);
  }, [durum, yuklenen, gamze]);
  useEffect(() => () => isik.dispose(), [isik]);
  const tahminRef = useRef<Group>(null);
  const tahminHalkaRef = useRef<Mesh>(null);
  const ucgen = useUcgen();
  const bordurler = useMemo(() => bordurKutulari(delik), [delik]);
  const koltuklar = useMemo(() => (delik.no === 7 ? koltukKutulari() : []), [delik]);
  const c = delik.dunya.delik;
  const r = GOLF.delikCap / 2;
  const isaretY = delik.zeminY + delik.kaldirma;

  // Gölge kutusu deliğin tamamını kaplar (sabit; top ilerledikçe gölge titremesin).
  const ox = (delik.cerceve.x0 + delik.cerceve.x1) / 2;
  const oz = (delik.cerceve.z0 + delik.cerceve.z1) / 2;
  const yari = Math.hypot(delik.cerceve.x1 - delik.cerceve.x0, delik.cerceve.z1 - delik.cerceve.z0) / 2 + 2;

  useFrame((s, gecen) => {
    const d = durum;
    const t = d.top;
    // --- Fizik: sabit adımlarla
    if (!t.duruyor && !t.disarida) {
      d.birikim += Math.min(gecen, 1 / 15);
      while (d.birikim >= FIZIK.adim && !t.duruyor && !t.disarida) {
        adimAt(t, d.delik.dunya);
        d.birikim -= FIZIK.adim;
      }
      if (t.disarida) olay('disari');
      else if (t.duruyor) olay(t.delikte ? 'delik' : 'durdu');
    }

    // --- Kamera: topu yumuşak izler; top ekranın ortasının biraz altında durur.
    const kam = s.camera as OrthographicCamera;
    d.kamera = kam;
    d.en = s.size.width;
    d.boy = s.size.height;
    // Vuruştan sonra top durana kadar: daha sıkı izler, yavaşça topun gittiği yöne döner (topun arkasından bakar).
    if (d.takip && (t.duruyor || t.disarida)) d.takip = false;
    if (d.takip) {
      const hiz = Math.hypot(t.vx, t.vz);
      if (hiz > 0.05) {
        const oran = Math.min(1, hiz / KAMERA.takipHizi);
        const kd = 1 - Math.exp(-KAMERA.takipDonme * oran * gecen);
        d.aci += aciFarki(Math.atan2(t.vz, t.vx), d.aci) * kd;
      }
    }
    // "Deliğe bak": kamera yumuşakça topun arkasına, deliğe bakan yöne döner.
    if (d.hedefAci !== null) {
      const fark = aciFarki(d.hedefAci, d.aci);
      if (Math.abs(fark) < 1e-3) {
        d.aci = d.hedefAci;
        d.hedefAci = null;
      } else {
        d.aci += fark * (1 - Math.exp(-KAMERA.delikBakisi * gecen));
      }
    }
    const k = 1 - Math.exp(-(d.takip ? KAMERA.takipIzleme : KAMERA.izleme) * gecen);
    d.hedef.x += (t.x - d.hedef.x) * k;
    d.hedef.y += (Math.max(t.y, d.delik.zeminY) - d.hedef.y) * k;
    d.hedef.z += (t.z - d.hedef.z) * k;
    if (d.bakisNoktasi) d.hedef.set(...d.bakisNoktasi);
    const fx = Math.cos(d.aci);
    const fz = Math.sin(d.aci);
    const ileri = (KAMERA.topAsagi * d.boy) / (d.yakinlik * Math.sin(d.egim));
    const hx = d.hedef.x + fx * ileri;
    const hz = d.hedef.z + fz * ileri;
    // Uzaklaşınca ve kamera yere yaklaşınca ekranın alt ucundaki yer kameranın gerisine düşüp kesiliyordu: kamera o
    // zaman kendi bakış çizgisinde geri çekilir (dik izdüşüm: görüntü küçülmez, yalnız kesilme kalkar).
    // Başlangıç yakınlığında kamera eskisi gibi KAMERA.uzaklik'ta durur.
    const altUc = (d.boy * (0.5 + KAMERA.topAsagi)) / d.yakinlik / Math.tan(d.egim) + KAMERA.kesilmePayi;
    const uzaklik = Math.max(KAMERA.uzaklik, altUc);
    const yatay = uzaklik * Math.cos(d.egim);
    kam.position.set(hx - fx * yatay, d.hedef.y + uzaklik * Math.sin(d.egim), hz - fz * yatay);
    kam.zoom = d.yakinlik;
    kam.lookAt(hx, d.hedef.y, hz);
    kam.updateProjectionMatrix();
    kam.updateMatrixWorld();

    // --- Top
    const ty = t.y + d.delik.kaldirma;
    const topAgi = topRef.current;
    if (topAgi) {
      topAgi.position.set(t.x, ty, t.z);
      // Top yuvarlanırken döner (yalnız görüntü; gamzeler kayıyor gibi durmasın). Fiziğe dokunmaz.
      const hiz = Math.hypot(t.vx, t.vz);
      if (hiz > 1e-4 && !t.duruyor) {
        donus.eksen.set(t.vz / hiz, 0, -t.vx / hiz);
        donus.q.setFromAxisAngle(donus.eksen, (hiz * gecen) / TOP_YARICAP);
        topAgi.quaternion.premultiply(donus.q);
      }
    }
    d.topEkran = ekranNoktasi(d, t.x, ty, t.z);

    // --- Engelin arkasında kalan top: saniyede birkaç kez toptan kameraya ışın; arkadaysa aradaki engel topun
    // çevresinde yumuşakça şeffaflaşır, topun çevresine halka çıkar (SEFFAFLIK; DENEME).
    seffaf.yon.copy(kam.getWorldDirection(seffaf.yon)).negate();
    seffaf.top.set(t.x, ty, t.z);
    seffaf.bekle -= gecen;
    if (seffaf.bekle <= 0 && engelRef.current) {
      seffaf.bekle = 1 / SEFFAFLIK.bakisSikligi;
      // Top da kamera da yerinde duruyorsa (nişan alırken) sonuç değişmez; ışın yeniden atılmaz.
      const degisti = seffaf.top.distanceToSquared(seffaf.sonTop) > 1e-8 || seffaf.yon.distanceToSquared(seffaf.sonYon) > 1e-8;
      if (degisti) {
        seffaf.sonTop.copy(seffaf.top);
        seffaf.sonYon.copy(seffaf.yon);
        // Kameranın yakın kesme düzlemine kadar (onun gerisi zaten çizilmez).
        const derinlik = -seffaf.yon.dot(seffaf.ara.copy(seffaf.top).sub(kam.position)) - kam.near;
        seffaf.arkada = !t.delikte && engelArkasinda(engelRef.current, seffaf.top, seffaf.yon, Math.max(0, derinlik), TOP_YARICAP);
      }
    }
    const adim = gecen / SEFFAFLIK.sure;
    seffaf.guc = seffaf.arkada ? Math.min(1, seffaf.guc + adim) : Math.max(0, seffaf.guc - adim);
    const yumusak = seffaf.guc * seffaf.guc * (3 - 2 * seffaf.guc);
    seffafDegerler.uGuc.value = yumusak;
    seffafDegerler.uTopMerkez.value.copy(seffaf.top);
    seffafDegerler.uKameraYonu.value.copy(seffaf.yon);
    seffafDegerler.uYaricap.value = SEFFAFLIK.pencere / d.yakinlik;
    seffafDegerler.uTopYaricap.value = TOP_YARICAP;
    d.cizim.engel = yumusak;
    const halka = halkaRef.current;
    if (halka) {
      halka.visible = yumusak > 0.01;
      if (halka.visible) {
        halka.position.copy(seffaf.top);
        halka.quaternion.copy(kam.quaternion);
        halka.scale.setScalar(Math.max(1, KAMERA.yakinlik / d.yakinlik));
        (halka.material as Material).opacity = SEFFAFLIK.halkaOpaklik * yumusak;
      }
    }

    // --- Nişan oku: yön ve güç
    const ok = okRef.current;
    if (ok) {
      const n = d.nisan;
      ok.visible = n.aktif && n.guc > 0;
      if (ok.visible) {
        ok.position.set(t.x, ty - TOP_YARICAP + 0.006, t.z);
        ok.rotation.y = Math.atan2(-n.yonZ, n.yonX);
        const boy = VURUS.okEnAz + (VURUS.okEnCok - VURUS.okEnAz) * n.guc;
        const bas = TOP_YARICAP * 1.6;
        if (govdeRef.current) {
          govdeRef.current.scale.x = boy;
          govdeRef.current.position.x = bas + boy / 2;
        }
        if (ucRef.current) ucRef.current.position.x = bas + boy;
        if (cekmeRef.current) {
          const cek = 0.05 + 0.3 * n.guc;
          cekmeRef.current.scale.x = cek;
          cekmeRef.current.position.x = -TOP_YARICAP - cek / 2;
        }
      }
    }

    // --- Kolay mod: çekerken topun duracağı yer (aynı fizikle; nişan değişince karede bir kez hesaplanır).
    const nis = d.nisan;
    const tg = tahminRef.current;
    d.tahminGorunur = d.kolay && nis.aktif && nis.guc > 0 && t.duruyor;
    if (d.tahminGorunur) {
      const eski = d.tahmin;
      if (!eski || eski.guc !== nis.guc || eski.yonX !== nis.yonX || eski.yonZ !== nis.yonZ) {
        d.tahmin = { ...tahminEt(d.delik.dunya, t, nis.yonX, nis.yonZ, nis.guc), yonX: nis.yonX, yonZ: nis.yonZ, guc: nis.guc };
      }
      const th = d.tahmin!;
      if (tg) {
        tg.visible = true;
        const [px, pz] = th.delikte ? [c.x, c.z] : [th.x, th.z];
        const py = th.delikte ? c.y : th.y - TOP_YARICAP;
        tg.position.set(px, py + d.delik.kaldirma + 0.004, pz);
        // Uzaklaşınca halka küçülüp kaybolmasın: ekranda en az başlangıç yakınlığındaki boyunda kalır.
        tg.scale.setScalar(Math.max(1, KAMERA.yakinlik / d.yakinlik));
      }
      const halka = tahminHalkaRef.current;
      if (halka) (halka.material as Material & { color: Color }).color.set(th.disarida ? renk.kiremit : renk.krem);
    } else if (tg) {
      tg.visible = false;
    }

    // --- Bayrak: top deliğin dibindeyken kalkar (topun önünü kapatmasın)
    if (bayrakRef.current) bayrakRef.current.visible = Math.hypot(t.x - c.x, t.z - c.z) > 0.45;

    // --- Bayrak: hafif rüzgâr
    if (bayrakRef.current?.visible) bayrakDalgalandir(bayrakGeo, s.clock.elapsedTime);

    // --- Kalite: kare hızı düşükse gölgeler kapanır (bir kez; o açılış için)
    const o = olcum.current;
    if (!o.bitti) {
      if (o.bekleme > 0) o.bekleme -= gecen;
      else {
        o.sure += gecen;
        o.kare += 1;
        if (o.sure >= GORUNUS.olcumSuresi) {
          o.dusuk = o.kare / o.sure < GORUNUS.golgeKapatFps ? o.dusuk + 1 : 0;
          o.sure = 0;
          o.kare = 0;
          if (o.dusuk >= 2) {
            o.bitti = true;
            golgeKapandi = true;
            isik.castShadow = false;
            isik.shadow.map?.dispose();
            isik.shadow.map = null;
            d.cizim.golge = false;
            d.cizim.dokuMB = dokuBellegi([...yuklenen, gamze, fileDokusu()], 0);
          }
        }
      }
    }

    d.cizim.doku = s.gl.info.memory.textures;
    d.cizim.cagri = s.gl.info.render.calls;
    d.cizim.ucgen = s.gl.info.render.triangles;
    d.cizim.kare = gecen;
    kare(d);
  });

  return (
    <>
      <color attach="background" args={[renk.krem]} />
      {/* Işık: sakin gün ışığı. Tek güneş (gölge veren tek ışık) ve gökten, yerden gelen dolgu. Değerler DENEME. */}
      <hemisphereLight args={[GORUNUS.gokRenk, GORUNUS.yerRenk, GORUNUS.dolguGuc]} />
      <primitive
        object={isik}
        position={[ox + GORUNUS.gunesYon[0], GORUNUS.gunesYon[1], oz + GORUNUS.gunesYon[2]]}
        color={GORUNUS.gunesRenk}
        intensity={GORUNUS.gunesGuc}
        castShadow={!golgeKapandi}
        shadow-mapSize={[GORUNUS.golgeBoyu, GORUNUS.golgeBoyu]}
        shadow-camera-left={-yari}
        shadow-camera-right={yari}
        shadow-camera-top={yari}
        shadow-camera-bottom={-yari}
        shadow-camera-near={GUNES_UZAKLIK - 25}
        shadow-camera-far={GUNES_UZAKLIK + 25}
        shadow-bias={-0.0001}
        shadow-normalBias={0.008}
      />
      {/* Işığın baktığı yer sahnede durmalı; yoksa güneş deliğe değil stadın köşesine bakar (gölge kutusu kayar). */}
      <primitive object={isik.target} position={[ox, 0, oz]} />
      {/* Engeller: top arkalarında kalınca topun çevresinde şeffaflaşır (seffaflik.ts). File zaten ağ; dışarıda. */}
      <group ref={engelRef}>
        <StatModeli koltuklu={delik.no === 7} dokular={dokular} />
        {koltuklar.length > 0 && <KutuYigini kutular={koltuklar} />}
        <Bordurler kutular={bordurler} dokular={dokular} />
        <Huniler delik={delik} />
      </group>
      <KaleFilesi />

      {/* Başlangıç işareti: krem halka (çap WMF beton pistteki gibi 30 cm) */}
      <mesh position={[delik.baslangic[0], delik.baslangicY + delik.kaldirma + 0.003, delik.baslangic[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[WMF.baslangicDairesi / 2 - 0.012, WMF.baslangicDairesi / 2, 40]} />
        <meshBasicMaterial color={renk.krem} />
      </mesh>

      {/* Delik: koyu daire ve çevresinde ince halka; bayrak */}
      <mesh position={[c.x, isaretY + 0.002, c.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 32]} />
        <meshBasicMaterial color={renk.lacivert} />
      </mesh>
      <mesh position={[c.x, isaretY + 0.003, c.z]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r, r + 0.008, 32]} />
        <meshBasicMaterial color={renk.krem} />
      </mesh>
      <group ref={bayrakRef}>
        <mesh position={[c.x, isaretY + DENEME.bayrakBoy / 2, c.z]} castShadow>
          <cylinderGeometry args={[0.008, 0.008, DENEME.bayrakBoy, 8]} />
          <meshStandardMaterial color={renk.lacivert} />
        </mesh>
        <mesh position={[c.x, isaretY + DENEME.bayrakBoy - 0.08, c.z]} geometry={bayrakGeo} castShadow frustumCulled={false}>
          <meshStandardMaterial color={renk.kiremit} roughness={0.9} side={DoubleSide} />
        </mesh>
      </group>

      {/* Kolay mod: topun duracağı yer (halka; top dışarı çıkacaksa kiremit). Engellerin arkasında da görünür. */}
      <group ref={tahminRef} visible={false} renderOrder={10}>
        <mesh ref={tahminHalkaRef} rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
          <ringGeometry args={[TOP_YARICAP * 2.2, TOP_YARICAP * 3.2, 32]} />
          <meshBasicMaterial color={renk.krem} depthTest={false} transparent />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} renderOrder={10}>
          <circleGeometry args={[TOP_YARICAP * 0.7, 16]} />
          <meshBasicMaterial color={renk.lacivert} depthTest={false} transparent />
        </mesh>
      </group>

      {/* Top */}
      <mesh ref={topRef} castShadow>
        <sphereGeometry args={[TOP_YARICAP, 40, 28]} />
        <meshStandardMaterial color="#FFFFFF" roughness={0.38} normalMap={gamze} envMap={gok} envMapIntensity={0.55} />
      </mesh>

      {/* Engelin arkasındaki top: topun çevresinde ince krem halka, engellerin önünde çizilir. */}
      <mesh ref={halkaRef} visible={false} renderOrder={11}>
        <ringGeometry args={[TOP_YARICAP * (SEFFAFLIK.halkaBoy - 0.35), TOP_YARICAP * SEFFAFLIK.halkaBoy, 32]} />
        <meshBasicMaterial color={renk.krem} depthTest={false} depthWrite={false} transparent opacity={0} />
      </mesh>

      {/* Nişan oku (kiremit) ve geri çekme çizgisi (lacivert) */}
      <group ref={okRef} visible={false}>
        <mesh ref={govdeRef}>
          <boxGeometry args={[1, 0.004, DENEME.nisanKalinlik]} />
          <meshBasicMaterial color={renk.kiremit} />
        </mesh>
        <mesh ref={ucRef} geometry={ucgen}>
          <meshBasicMaterial color={renk.kiremit} side={DoubleSide} />
        </mesh>
        <mesh ref={cekmeRef}>
          <boxGeometry args={[1, 0.004, 0.01]} />
          <meshBasicMaterial color={renk.lacivert} transparent opacity={0.7} />
        </mesh>
      </group>
    </>
  );
}
