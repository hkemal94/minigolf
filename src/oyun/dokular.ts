import {
  BackSide,
  BufferGeometry,
  Color,
  DataTexture,
  Float32BufferAttribute,
  LinearFilter,
  LinearMipmapLinearFilter,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PMREMGenerator,
  RGBAFormat,
  RepeatWrapping,
  SRGBColorSpace,
  Scene,
  SphereGeometry,
  UnsignedByteType,
  Vector2,
  Vector3,
  type Material,
  type Texture,
  type WebGLRenderer,
} from 'three';
import { renk } from '../sahne/renkler';
import { IFAB, MODEL } from '../maket/olculer';
import { GORUNTU, GORUNUS } from './ayarlar';

// OYNANABİLİR PROTOTİP · dokulu gerçekçi görünüş (Karar: Kemal, 19 Kasım 2026; tasarım belgesi 5.2).
// Dokular Poly Haven ve ambientCG'den (CC0; docs/lisanslar.md). Stat modelinin dosyasına dokunulmaz:
// malzemeleri yüklenirken burada değiştirilir. Top ve file dokusu fotoğraf değil, kodla hesaplanır.

export type DokuAdi = keyof typeof GORUNUS.dokuBoyu;
export const DOKU_ADLARI: DokuAdi[] = ['cim', 'toprak', 'beton', 'tas', 'ahsap'];
const TABAN = `${import.meta.env.BASE_URL}dokular/`;
// Yüklenecek dosyalar: her doku için renk ve kabartı (normal).
export const DOKU_DOSYALARI = DOKU_ADLARI.flatMap((a) => [`${TABAN}${a}-renk.webp`, `${TABAN}${a}-normal.webp`]);

export type Dokular = Record<DokuAdi, { renk: Texture; normal: Texture }>;

export function dokulariHazirla(yuklenen: Texture[], gl: WebGLRenderer): Dokular {
  const netlik = Math.min(GORUNUS.netlik, gl.capabilities.getMaxAnisotropy());
  const d = {} as Dokular;
  DOKU_ADLARI.forEach((ad, i) => {
    const r = yuklenen[i * 2];
    const n = yuklenen[i * 2 + 1];
    for (const t of [r, n]) {
      t.wrapS = t.wrapT = RepeatWrapping;
      t.anisotropy = netlik;
      t.needsUpdate = true;
    }
    r.colorSpace = SRGBColorSpace;
    d[ad] = { renk: r, normal: n };
  });
  return d;
}

// Modeldeki hangi malzeme hangi dokuyu alır (malzeme adı → doku, pürüz).
const MODEL_DOKUSU: Record<string, { doku: DokuAdi; puruz: number }> = {
  cim: { doku: 'cim', puruz: 0.95 },
  cim2: { doku: 'cim', puruz: 0.95 },
  zemin: { doku: 'toprak', puruz: 1 },
  beton: { doku: 'beton', puruz: 0.9 },
  beton2: { doku: 'beton', puruz: 0.9 },
  badana: { doku: 'beton', puruz: 0.95 },
  tas1: { doku: 'tas', puruz: 0.95 },
  tas2: { doku: 'tas', puruz: 0.95 },
  tas3: { doku: 'tas', puruz: 0.95 },
  tas4: { doku: 'tas', puruz: 0.95 },
  tas_koyu: { doku: 'tas', puruz: 0.95 },
  ahsap: { doku: 'ahsap', puruz: 0.8 },
  ahsap_koyu: { doku: 'ahsap', puruz: 0.8 },
};

// Dokulu malzeme: yüzeyin ortalama rengi verilen renk olur (doku kendi ortalamasına bölünür).
export function dokuluMalzeme(dokular: Dokular, doku: DokuAdi, hedefRenk: Color, puruz: number, kabarti: number = GORUNUS.kabarti[doku]): MeshStandardMaterial {
  const [r, g, b] = GORUNUS.dokuOrtalama[doku];
  const m = new MeshStandardMaterial({
    map: dokular[doku].renk,
    normalMap: dokular[doku].normal,
    roughness: puruz,
    metalness: 0,
  });
  m.color.setRGB(hedefRenk.r / r, hedefRenk.g / g, hedefRenk.b / b);
  m.normalScale = new Vector2(kabarti, kabarti);
  return m;
}

// Stat modelinin bir malzemesinin dokulu hâli (dokusu yoksa null: model kendi malzemesiyle kalır).
const malzemeDeposu = new WeakMap<Dokular, Map<string, Material>>();
export function modelMalzemesi(dokular: Dokular, asil: Material): Material | null {
  const tarif = MODEL_DOKUSU[asil.name];
  if (!tarif) return null;
  let depo = malzemeDeposu.get(dokular);
  if (!depo) malzemeDeposu.set(dokular, (depo = new Map()));
  let m = depo.get(asil.name);
  if (!m) {
    m = dokuluMalzeme(dokular, tarif.doku, (asil as MeshStandardMaterial).color, tarif.puruz);
    m.name = asil.name;
    depo.set(asil.name, m);
  }
  return m;
}
export const modelDokusu = (ad: string): DokuAdi | null => MODEL_DOKUSU[ad]?.doku ?? null;

// Modelde doku yerleşimi (UV) yok: her üçgene dünyadaki yerinden yerleşim verilir. Yatay yüzeyde (x, z),
// dik yüzeyde (yüzey boyunca yatay yol, y). boy: dokunun kapladığı kenar (m). Yeni geometri döner.
export function dunyaYerlesimi(geo: BufferGeometry, donusum: Matrix4 | null, boy: number): BufferGeometry {
  const g = geo.index ? geo.toNonIndexed() : geo.clone();
  const p = g.getAttribute('position');
  const uv = new Float32Array(p.count * 2);
  const a = new Vector3();
  const b = new Vector3();
  const c = new Vector3();
  const n = new Vector3();
  const kose = [a, b, c];
  for (let i = 0; i + 2 < p.count; i += 3) {
    kose.forEach((v, k) => {
      v.fromBufferAttribute(p, i + k);
      if (donusum) v.applyMatrix4(donusum);
    });
    n.copy(b).sub(a).cross(c.clone().sub(a)).normalize();
    const yatay = Math.abs(n.y) > 0.7;
    const boyu = Math.hypot(n.x, n.z) || 1;
    // Dik yüzeyde yüzey boyunca yatay yön: (-nz, 0, nx)
    const tx = -n.z / boyu;
    const tz = n.x / boyu;
    kose.forEach((v, k) => {
      uv[(i + k) * 2] = (yatay ? v.x : v.x * tx + v.z * tz) / boy;
      uv[(i + k) * 2 + 1] = (yatay ? v.z : v.y) / boy;
    });
  }
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  return g;
}
const yerlesimDeposu = new WeakMap<BufferGeometry, BufferGeometry>();
export function modelYerlesimi(o: Mesh, boy: number): BufferGeometry {
  let g = yerlesimDeposu.get(o.geometry);
  if (!g) {
    o.updateWorldMatrix(true, false);
    g = dunyaYerlesimi(o.geometry, o.matrixWorld, boy);
    yerlesimDeposu.set(o.geometry, g);
  }
  return g;
}

// ---------- Golf topu: gamzeler (kabartı dokusu; kodla hesaplanır) ----------
// Gamzeler kürede eşit aralıklı dizilir (Fibonacci sarmalı); her gamze yumuşak bir çukur.
let gamzeDokusu: DataTexture | null = null;
export function topKabartisi(): DataTexture {
  if (gamzeDokusu) return gamzeDokusu;
  const N = GORUNUS.gamzeSayisi;
  const en = 512;
  const boy = 256;
  // Gamzenin açısal yarıçapı: küre yüzeyini altıgen dizilişte dolduran dairenin yarıçapının %92'si.
  const yaricap = Math.sqrt(3.6276 / N) * 0.92;
  const altin = Math.PI * (3 - Math.sqrt(5));
  const merkez = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    const y = 1 - (2 * (i + 0.5)) / N;
    const r = Math.sqrt(1 - y * y);
    merkez[i * 3] = Math.cos(i * altin) * r;
    merkez[i * 3 + 1] = y;
    merkez[i * 3 + 2] = Math.sin(i * altin) * r;
  }
  const veri = new Uint8Array(en * boy * 4);
  const cosYaricap = Math.cos(yaricap);
  for (let j = 0; j < boy; j++) {
    // three.js küresi: v = 1 - theta / π (v = 0 alt kutup), y = cos(theta)
    const theta = (1 - (j + 0.5) / boy) * Math.PI;
    const y = Math.cos(theta);
    const st = Math.sin(theta);
    // Yalnız bu enleme yakın gamzelere bakılır (sıralı oldukları için aralık hesapla bulunur).
    const i0 = Math.max(0, Math.floor(((1 - (y + yaricap * 1.05)) * N) / 2 - 1));
    const i1 = Math.min(N - 1, Math.ceil(((1 - (y - yaricap * 1.05)) * N) / 2 + 1));
    for (let i = 0; i < en; i++) {
      const phi = ((i + 0.5) / en) * 2 * Math.PI;
      const cp = Math.cos(phi);
      const sp = Math.sin(phi);
      const x = -cp * st;
      const z = sp * st;
      let enIyi = -1;
      let enCos = cosYaricap;
      for (let k = i0; k <= i1; k++) {
        const c = x * merkez[k * 3] + y * merkez[k * 3 + 1] + z * merkez[k * 3 + 2];
        if (c > enCos) {
          enCos = c;
          enIyi = k;
        }
      }
      let nx = 0;
      let ny = 0;
      if (enIyi >= 0) {
        const a = Math.acos(Math.min(1, enCos)) / yaricap; // 0 merkez, 1 kenar
        // Çukurun kesiti: h = -(1 - a²)²; eğimi 4a(1 - a²). Yüzey merkezden uzaklaştıkça yükselir.
        const egim = 4 * a * (1 - a * a) * GORUNUS.gamzeGucu * 0.5;
        // Merkezden uzaklaşan yön (yüzeye teğet)
        let ux = x - merkez[enIyi * 3] * enCos;
        let uy = y - merkez[enIyi * 3 + 1] * enCos;
        let uz = z - merkez[enIyi * 3 + 2] * enCos;
        // (x,y,z) - c·cos: c'den uzaklaşan yönün teğet bileşeni için noktaya dik hâle getir
        const d = ux * x + uy * y + uz * z;
        ux -= x * d;
        uy -= y * d;
        uz -= z * d;
        const ub = Math.hypot(ux, uy, uz) || 1;
        // Teğet (u artan yön): (sin phi, 0, cos phi); öbür teğet (v artan yön, kuzey): (cp·cosθ, sinθ, -sp·cosθ)
        const tU = (ux * sp + uz * cp) / ub;
        const tV = (ux * cp * y + uy * st - uz * sp * y) / ub;
        nx = -egim * tU;
        ny = -egim * tV;
      }
      const b = 1 / Math.hypot(nx, ny, 1);
      const o = (j * en + i) * 4;
      veri[o] = Math.round((nx * b * 0.5 + 0.5) * 255);
      veri[o + 1] = Math.round((ny * b * 0.5 + 0.5) * 255);
      veri[o + 2] = Math.round((b * 0.5 + 0.5) * 255);
      veri[o + 3] = 255;
    }
  }
  const t = new DataTexture(veri, en, boy, RGBAFormat, UnsignedByteType);
  t.wrapS = RepeatWrapping;
  t.generateMipmaps = true;
  t.minFilter = LinearMipmapLinearFilter;
  t.magFilter = LinearFilter;
  t.needsUpdate = true;
  gamzeDokusu = t;
  return t;
}

// ---------- Kale filesi: gerçek ağ (ip dokusu, arası boş) ----------
// Dokunun bir karesi filenin bir gözü: kenarlarda ip, köşede düğüm; arası saydam. Uzaktan bakınca doku
// küçülürken ipler incelip solar (titremez). Renk her yerde aynı, yalnız saydamlık değişir.
let fileDokusuDepo: DataTexture | null = null;
export function fileDokusu(): DataTexture {
  if (fileDokusuDepo) return fileDokusuDepo;
  const c = new Color(renk.krem);
  const [kr, kg, kb] = [c.r, c.g, c.b].map((v) => Math.round(v * 255));
  // Bir düzeyin saydamlığı: n × n piksellik karede ipin kapladığı pay (ince örneklemeyle).
  const duzey = (n: number, us: number) => {
    const veri = new Uint8Array(n * n * 4);
    const ornek = Math.max(1, Math.round(128 / n)) * 2; // piksel başına örnek (her yönde)
    const ip = GORUNUS.fileIp / GORUNTU.fileGoz; // ipin kalınlığı (karenin oranı)
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        let dolu = 0;
        for (let b = 0; b < ornek; b++) {
          for (let a = 0; a < ornek; a++) {
            const u = (i + (a + 0.5) / ornek) / n;
            const v = (j + (b + 0.5) / ornek) / n;
            const du = Math.min(u, 1 - u);
            const dv = Math.min(v, 1 - v);
            // İp karenin kenarında (yarısı bu karede, yarısı komşuda); köşede düğüm.
            if (Math.min(du, dv) < ip / 2 || Math.hypot(du, dv) < ip * 1.1) dolu++;
          }
        }
        const o = (j * n + i) * 4;
        veri[o] = kr;
        veri[o + 1] = kg;
        veri[o + 2] = kb;
        veri[o + 3] = Math.round(Math.pow(dolu / (ornek * ornek), us) * 255);
      }
    }
    return veri;
  };
  const t = new DataTexture(duzey(128, 1), 128, 128, RGBAFormat, UnsignedByteType);
  // Küçültülmüş kopyalar elle: ip uzaktan tamamen solmasın diye saydamlık biraz güçlendirilir (GORUNUS.fileUzakUs).
  const kopyalar = t.mipmaps as unknown as { data: Uint8Array; width: number; height: number }[];
  for (let n = 128, k = 0; n >= 1; n /= 2, k++) {
    kopyalar.push({ data: k === 0 ? (t.image.data as Uint8Array) : duzey(n, GORUNUS.fileUzakUs), width: n, height: n });
  }
  t.wrapS = t.wrapT = RepeatWrapping;
  t.generateMipmaps = false;
  t.minFilter = LinearMipmapLinearFilter;
  t.magFilter = LinearFilter;
  t.anisotropy = 8;
  t.needsUpdate = true;
  fileDokusuDepo = t;
  return t;
}

// Filenin yüzeyleri (fizikteki ağlarla aynı yerde): iki kalede arka, üst ve iki yan. Yerleşim metre / göz.
export function fileGeometrisi(): BufferGeometry {
  const yer: number[] = [];
  const uv: number[] = [];
  const g = GORUNTU.fileGoz;
  // Dörtgen: dört köşe (yer) ve doku yerleşimi (metre)
  const dortgen = (k: [number, number, number][], y: [number, number][]) => {
    for (const i of [0, 1, 2, 0, 2, 3]) {
      yer.push(...k[i]);
      uv.push(y[i][0] / g, y[i][1] / g);
    }
  };
  const h = IFAB.kaleYukseklik;
  const hb = GORUNTU.fileArkaBoy;
  const D = MODEL.agDerinlik;
  const z0 = MODEL.yakinDirekZ;
  const z1 = MODEL.uzakDirekZ;
  const alt = 0.006; // çimin hemen üstü
  const egik = Math.hypot(D, h - hb); // üst filenin eğik boyu
  for (const [xk, s] of [[MODEL.kaleCizgisiX, -1], [MODEL.kaleCizgisiX + MODEL.sahaBoy, 1]] as const) {
    const xa = xk + s * D;
    // Arka
    dortgen([[xa, alt, z0], [xa, alt, z1], [xa, hb, z1], [xa, hb, z0]], [[z0, alt], [z1, alt], [z1, hb], [z0, hb]]);
    // Üst: kale direğinden arka filenin üstüne iner
    dortgen([[xk, h, z0], [xk, h, z1], [xa, hb, z1], [xa, hb, z0]], [[z0, 0], [z1, 0], [z1, egik], [z0, egik]]);
    // Yanlar
    for (const z of [z0, z1]) dortgen([[xk, alt, z], [xa, alt, z], [xa, hb, z], [xk, h, z]], [[0, alt], [D, alt], [D, hb], [0, h]]);
  }
  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(yer, 3));
  geo.setAttribute('uv', new Float32BufferAttribute(uv, 2));
  geo.computeVertexNormals();
  return geo;
}

// ---------- Gökyüzü yansıması (yalnız topta): sade bir gündüz göğü, kodla; dosya indirilmez ----------
let gokDeposu: Texture | null = null;
export function gokYansimasi(gl: WebGLRenderer): Texture {
  if (gokDeposu) return gokDeposu;
  const sahne = new Scene();
  const kure = new SphereGeometry(10, 32, 16);
  const p = kure.getAttribute('position');
  const renkler = new Float32Array(p.count * 3);
  const gok = new Color(GORUNUS.gokRenk);
  const ufuk = new Color('#FFFFFF');
  const yer = new Color(GORUNUS.yerRenk);
  const c = new Color();
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i) / 10;
    if (y >= 0) c.copy(ufuk).lerp(gok, Math.min(1, y * 1.6));
    else c.copy(ufuk).lerp(yer, Math.min(1, -y * 6));
    renkler.set([c.r, c.g, c.b], i * 3);
  }
  kure.setAttribute('color', new Float32BufferAttribute(renkler, 3));
  sahne.add(new Mesh(kure, new MeshBasicMaterial({ vertexColors: true, side: BackSide })));
  const uretici = new PMREMGenerator(gl);
  gokDeposu = uretici.fromScene(sahne, 0.04).texture;
  uretici.dispose();
  kure.dispose();
  return gokDeposu;
}

// Dokuların ekran kartında kapladığı yer (yaklaşık; MB): en × boy × 4 bayt, küçültülmüş kopyalarıyla (× 4/3).
export function dokuBellegi(dokular: Texture[], golgeBoyu: number): number {
  let bayt = 0;
  for (const t of dokular) {
    const g = t.image as { width?: number; height?: number } | undefined;
    if (g?.width && g.height) bayt += g.width * g.height * 4 * (4 / 3);
  }
  bayt += golgeBoyu * golgeBoyu * 4;
  return Math.round((bayt / 1048576) * 10) / 10;
}

