import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, Shape, SRGBColorSpace } from 'three';

import { renk } from '../sahne/renkler';
import { StatSahnesi, EkranKonumu, type Kesim } from './StatSahnesi';
import { Bordur, Baslangic, Top, BayrakliDelik, KesikNisan, KalinCizgi, GucHalkasi } from './Pist';
import { DENEME, ESYA, MODEL, TOP_YARICAP } from './olculer';
import {
  ornekDelik,
  siraOn,
  siraY,
  MERDIVEN_X0,
  MERDIVEN_X1,
  KOPRU,
  KOPRU_BOY,
  KOPRU_INIS,
  KOPRU_AYAKLAR,
  TAS_SIRASI,
  kopruY,
  BOS_KOLTUK,
  koltukX,
  koltukZ,
  DUS_BOY,
  DUS_EN,
  DUS_BOLMELER,
  HUNILER,
  SULAMA,
  MANKENLER,
  type N3,
  type OrnekDelik,
} from './ornekDelikler';

// MAKET (öneri): yeni dille çizilen deliklerin 3B sahnesi. Oynanış değil; top atılmaz.

// Kamera topu yakından izler (Kemal, 18 Kasım 2026): top ve delik gerçek ölçüde olduğu için delik tek
// ekrana sığmaz; kamera topun yanındadır, deliğin yeri ekran kenarındaki okla ve küçük planla gösterilir.
// uzak: kameranın hedefe göre durduğu yön; ileri: hedefin toptan oyun yönüne kayması. Hepsi DENEME.
type Bakis = { uzak: N3; ileri: N3; zoom: number; golge: number };
// Adım 1 delikleri 3. delikle aynı uzaklıkta; kamera topun tam arkasına yakın durur ki ilerideki eşya
// (huniler, sulama başlıkları, köşe bayrağı, baraj) aynı ekrana girsin. Oyun yönü: 1, 4, 5 için -x; 2 için -z.
const eksiX = {
  genel: { uzak: [13.3, 17, 1.5], ileri: [-1.2, 0, -0.15], zoom: 200, golge: 6 },
  atis: { uzak: [13.3, 17, 1.5], ileri: [-0.5, 0, -0.05], zoom: 340, golge: 3 },
} satisfies { genel: Bakis; atis: Bakis };
const eksiZ = {
  genel: { uzak: [-1.5, 17, 13.3], ileri: [0.15, 0, -1.2], zoom: 200, golge: 6 },
  atis: { uzak: [-1.5, 17, 13.3], ileri: [0.05, 0, -0.5], zoom: 340, golge: 3 },
} satisfies { genel: Bakis; atis: Bakis };
const BAKISLAR: Record<number, { genel: Bakis; atis: Bakis }> = {
  1: eksiX,
  2: eksiZ,
  4: eksiX,
  // 5: baraj 2,75 m ileride; ekrana girsin diye kamera biraz daha ileriye bakar.
  5: { genel: { ...eksiX.genel, ileri: [-1.75, 0, -0.1] }, atis: eksiX.atis },
  // 6: başlangıçta oyun yönü -z (tribüne doğru); korkuluk ve ilk basamak ekrana girsin diye ileriye bakar.
  // Atış anında oyun yönü +x (tribün boyunca).
  6: {
    genel: { ...eksiZ.genel, ileri: [0.1, 0, -1.8] },
    atis: { uzak: [-12, 17, 4.45], ileri: [0.42, 0, -0.16], zoom: 340, golge: 3 },
  },
  // 8: başlangıçta oyun yönü +x (oluk boyunca); atış anında -z (köprü boyunca).
  8: {
    genel: { uzak: [-12, 17, 4.45], ileri: [1.75, 0, -0.55], zoom: 200, golge: 6 },
    atis: { uzak: [-1.5, 17, 13.3], ileri: [0.05, 0, -0.6], zoom: 340, golge: 4 },
  },
  // 9: başlangıçta oyun yönü +x (koridor boyunca; köprünün ayağı ekrana girsin diye ileriye bakar);
  // atış anı ilk vuruş: nişan taş sırasındaki boşluğa.
  9: {
    genel: { uzak: [-12, 17, 4.45], ileri: [1.3, 0, -0.1], zoom: 200, golge: 7 },
    atis: { uzak: [-12, 17, 4.45], ileri: [0.42, 0, -0.35], zoom: 340, golge: 4 },
  },
  3: {
    genel: { uzak: [5.5, 17, -12.3], ileri: [-0.52, 0, 1.15], zoom: 200, golge: 5 },
    atis: { uzak: [5.5, 17, -12.3], ileri: [-0.19, 0, 0.42], zoom: 340, golge: 3 },
  },
  7: {
    genel: { uzak: [11.2, 19, 2.45], ileri: [-1.25, -0.25, -0.2], zoom: 200, golge: 5 },
    atis: { uzak: [11.2, 19, 2.45], ileri: [-0.4, 0, -0.085], zoom: 340, golge: 3 },
  },
  14: {
    genel: { uzak: [-12, 17, 4.45], ileri: [1.2, 0, -0.45], zoom: 200, golge: 5 },
    atis: { uzak: [-12, 17, 4.45], ileri: [0.42, 0, -0.16], zoom: 340, golge: 3 },
  },
};

// Tribün koltukları (Kemal, 18 Kasım 2026: oturma tahtası yerine tek tek koltuk). Modelde yok; kodla
// çizilir. Modelin tahtaları bu bölgede kesilir (StatSahnesi, kesimler). Koltuk: oturak ve sırtlık; sırtlık
// bir üst basamağa bakan yanda. Boş bırakılan koltuklar topun alt sıraya geçtiği yerlerdir (yalnız 7. delik).
// Koltuk dizisi merdivenden merdivene: ortadaki merdivenin doğusunda B ucundaki merdivene, batısında A ucundakine kadar.
type KoltukBolge = { x0: number; x1: number };
const KOLTUK_BOLGELERI: Record<number, KoltukBolge> = {
  6: { x0: 35.5, x1: 50.5 },
  7: { x0: MERDIVEN_X0 - 4.5, x1: MERDIVEN_X1 + 9.75 },
  8: { x0: 51, x1: MODEL.yanDuvarX0 },
};
const tahtaKesimi = (b: KoltukBolge): Kesim => ({ x0: b.x0, x1: b.x1, z0: siraOn(MODEL.acikTribunSira) - 0.7, z1: siraOn(1) });
function TribunKoltuklari({ bolge, bos = {} }: { bolge: KoltukBolge; bos?: Record<number, number> }) {
  const koltuklar = useMemo(() => {
    const liste: { x: number; sira: number }[] = [];
    for (let sira = 1; sira <= MODEL.acikTribunSira; sira++) {
      // merdivenin doğusu
      for (let i = 0; koltukX(i)[1] <= Math.min(bolge.x1, MODEL.bMerdivenX0); i++) {
        if (bos[sira] !== i && koltukX(i)[0] >= bolge.x0) liste.push({ x: (koltukX(i)[0] + koltukX(i)[1]) / 2, sira });
      }
      // merdivenin batısı
      for (let x = MERDIVEN_X0 - DENEME.koltukAralik / 2; x - DENEME.koltukEn / 2 >= bolge.x0; x -= DENEME.koltukAralik) {
        if (x + DENEME.koltukEn / 2 <= bolge.x1) liste.push({ x, sira });
      }
    }
    return liste;
  }, [bolge, bos]);
  const kalin = MODEL.tahtaKalinlik;
  const derin = MODEL.tahtaEn;
  const sirt = DENEME.koltukSirt;
  // Renkler modeldeki tahtaların sırasıyla: 2. ve 5. sıra krem, öbürleri lacivert.
  const acik = (sira: number) => sira === 2 || sira === 5;
  const koltukRengi = (sira: number) => (acik(sira) ? renk.krem : renk.lacivertAcik);
  const ayakRengi = (sira: number) => (acik(sira) ? renk.kremKoyu : renk.lacivert);
  const oturakEn = DENEME.koltukEn - 0.07;
  return (
    <group>
      {koltuklar.map((k, i) => {
        const [z0, z1] = koltukZ(k.sira);
        const y = siraY(k.sira);
        return (
          <group key={i}>
            {/* Ayak: koltuğun altı dolu, top aradan geçmez */}
            <mesh position={[k.x, y + kalin / 4, (z0 + z1) / 2]} castShadow receiveShadow>
              <boxGeometry args={[DENEME.koltukEn, kalin / 2, derin]} />
              <meshStandardMaterial color={ayakRengi(k.sira)} roughness={1} />
            </mesh>
            {/* Oturak ve sırtlık: ayaktan dar, koltuklar tek tek okunur */}
            <mesh position={[k.x, y + kalin * 0.75, (z0 + z1) / 2 + 0.01]} castShadow receiveShadow>
              <boxGeometry args={[oturakEn, kalin / 2, derin - 0.04]} />
              <meshStandardMaterial color={koltukRengi(k.sira)} roughness={1} />
            </mesh>
            <mesh position={[k.x, y + kalin + sirt / 2, z0 + 0.03]} castShadow receiveShadow>
              <boxGeometry args={[oturakEn, sirt, 0.05]} />
              <meshStandardMaterial color={koltukRengi(k.sira)} roughness={1} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

// Karo dokusu: tek karo ve derzi; zemine ve duvara tekrarlanır. Karo ölçüsü DENEME.
function useKaro(zeminRengi: string, derzRengi: string, tekrarX: number, tekrarY: number) {
  return useMemo(() => {
    const tuval = document.createElement('canvas');
    tuval.width = 64;
    tuval.height = 64;
    const c = tuval.getContext('2d')!;
    c.fillStyle = derzRengi;
    c.fillRect(0, 0, 64, 64);
    c.fillStyle = zeminRengi;
    c.fillRect(2, 2, 60, 60);
    const doku = new CanvasTexture(tuval);
    doku.wrapS = RepeatWrapping;
    doku.wrapT = RepeatWrapping;
    doku.repeat.set(tekrarX, tekrarY);
    doku.colorSpace = SRGBColorSpace;
    doku.anisotropy = 8;
    return doku;
  }, [zeminRengi, derzRengi, tekrarX, tekrarY]);
}

// Duşlar: oda 3B modelde yok (kapalı tribünün altına eklenecek); maket için kodla çizildi.
// Zemin karo, duvarlar içi görünsün diye kesik. Bütün ölçüler DENEME (oda boyu dışında).
function DusOdasi() {
  const k = DENEME.karo;
  const h = DENEME.dusDuvarYukseklik;
  const hb = DENEME.dusBolmeYukseklik;
  const d = 0.12; // duvar kalınlığı, DENEME
  const zemin = useKaro('#E9E4DA', '#B9B2A4', DUS_BOY / k, DUS_EN / k);
  const duvarUzun = useKaro('#F4F1EA', '#C9C2B4', (DUS_BOY + 2 * d) / k, h / k);
  const duvarKisa = useKaro('#F4F1EA', '#C9C2B4', DUS_EN / k, h / k);
  const bolmeDoku = useKaro('#F4F1EA', '#C9C2B4', DENEME.dusBolmeBoy / k, hb / k);
  const kapi0 = 0.25;
  const kapi1 = 1.25; // kapı aralığı, DENEME
  // Duş başlıkları: bölmelerin arasındaki duvarlarda (yalnız görüntü).
  const basliklar: [number, number][] = [
    [0.75, 0],
    [3.1, 0],
    [5.5, 0],
    [2.3, DUS_EN],
    [3.9, DUS_EN],
  ];
  return (
    <group>
      {/* Duvarların kameraya bakan yüzü karanlık kalmasın diye dolgu ışığı */}
      <directionalLight position={[-6, 5, 7]} intensity={1.1} />
      <mesh position={[DUS_BOY / 2, 0, DUS_EN / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[DUS_BOY, DUS_EN]} />
        <meshStandardMaterial map={zemin} roughness={0.85} />
      </mesh>
      {/* Çevre zemini: odanın dışı (tribün altı betonu) */}
      <mesh position={[DUS_BOY / 2, -0.02, DUS_EN / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[DUS_BOY + 6, DUS_EN + 6]} />
        <meshStandardMaterial color="#C8C0AF" roughness={1} />
      </mesh>
      {/* Uzak iki duvar tam (kesik yükseklikte), yakın iki duvar alçak */}
      <mesh position={[DUS_BOY / 2, h / 2, -d / 2]} castShadow receiveShadow>
        <boxGeometry args={[DUS_BOY + 2 * d, h, d]} />
        <meshStandardMaterial map={duvarUzun} roughness={0.9} />
      </mesh>
      <mesh position={[DUS_BOY + d / 2, h / 2, DUS_EN / 2]} castShadow receiveShadow>
        <boxGeometry args={[d, h, DUS_EN]} />
        <meshStandardMaterial map={duvarKisa} roughness={0.9} />
      </mesh>
      <mesh position={[DUS_BOY / 2, 0.09, DUS_EN + d / 2]} receiveShadow>
        <boxGeometry args={[DUS_BOY + 2 * d, 0.18, d]} />
        <meshStandardMaterial color="#DAD4C7" roughness={1} />
      </mesh>
      {[
        [0, kapi0],
        [kapi1, DUS_EN],
      ].map(([z0, z1]) => (
        <mesh key={z0} position={[-d / 2, 0.09, (z0 + z1) / 2]} receiveShadow>
          <boxGeometry args={[d, 0.18, z1 - z0]} />
          <meshStandardMaterial color="#DAD4C7" roughness={1} />
        </mesh>
      ))}
      {DUS_BOLMELER.map((b) => (
        <mesh key={b.x} position={[b.x, hb / 2, (b.z0 + b.z1) / 2]} castShadow receiveShadow>
          <boxGeometry args={[DENEME.dusBolmeKalinlik, hb, b.z1 - b.z0]} />
          <meshStandardMaterial map={bolmeDoku} roughness={0.9} />
        </mesh>
      ))}
      {basliklar.map(([x, z]) => {
        const yon = z === 0 ? 1 : -1;
        const yuk = z === 0 ? h + 0.25 : 0.55;
        return (
          <group key={`${x}-${z}`}>
            <mesh position={[x, yuk / 2, z + yon * 0.03]}>
              <cylinderGeometry args={[0.02, 0.02, yuk, 8]} />
              <meshStandardMaterial color="#8C9299" roughness={0.5} />
            </mesh>
            <mesh position={[x, yuk, z + yon * 0.12]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.02, 0.02, 0.22, 8]} />
              <meshStandardMaterial color="#8C9299" roughness={0.5} />
            </mesh>
            <mesh position={[x, yuk - 0.03, z + yon * 0.22]}>
              <cylinderGeometry args={[0.07, 0.05, 0.05, 12]} />
              <meshStandardMaterial color="#8C9299" roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

function Birikinti({ n, r }: { n: [number, number]; r: number }) {
  return (
    <mesh position={[n[0], 0.006, n[1]]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 0.85, 1]}>
      <circleGeometry args={[r, 36]} />
      <meshStandardMaterial color="#7FB0C8" transparent opacity={0.75} roughness={0.15} />
    </mesh>
  );
}

// Adım 1 (delik 1, 2, 4, 5): zemin sahanın çimi. Model 19 Kasım 2026'da düzeltildi: sahanın çimi çevre
// çimle aynı düzeyde, orta yuvarlak sürekli çizgi; köşe yayı, köşe bayrağı, penaltı ve orta noktası modelde.
// Bunlar artık kodla çizilmez.

// Antrenman hunileri (1. delik). Kemal, 19 Kasım 2026: kalsın, gerçeğe yakın. Biçim gerçek huni: kare taban,
// kesik uçlu koni, ortasında açık renk kuşak. Boy 30,5 cm (ESYA; kaynak olculer.ts); taban ve uç DENEME.
// Renk marka paletinden (kiremit, krem). Yazı, logo yok.
function Huniler() {
  const t = DENEME.huniTaban;
  const b = ESYA.huniBoy;
  const tabanKalin = 0.015;
  const altR = t / 2 - 0.02;
  const ustR = DENEME.huniUc / 2;
  const govde = b - tabanKalin;
  // Kuşak: gövdenin yüzde 45–70'i arasında, koninin o yükseklikteki yarıçapıyla.
  const rAt = (o: number) => altR + (ustR - altR) * o;
  return (
    <group>
      {HUNILER.map((n, i) => (
        <group key={i} position={[n[0], MODEL.cizgiUstu, n[1]]}>
          <mesh position={[0, tabanKalin / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[t, tabanKalin, t]} />
            <meshStandardMaterial color={renk.kiremit} roughness={0.9} />
          </mesh>
          <mesh position={[0, tabanKalin + govde / 2, 0]} castShadow>
            <cylinderGeometry args={[ustR, altR, govde, 28]} />
            <meshStandardMaterial color={renk.kiremit} roughness={0.9} />
          </mesh>
          <mesh position={[0, tabanKalin + govde * 0.575, 0]}>
            <cylinderGeometry args={[rAt(0.7) + 0.002, rAt(0.45) + 0.002, govde * 0.25, 28]} />
            <meshStandardMaterial color={renk.krem} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Sulama başlıkları (2. delik). Kemal, 19 Kasım 2026: kalsın, gerçeğe yakın. Yerden çıkan (pop-up) başlık:
// çimde yuvası, yerle bir gövde ağzı, ince yükselen boru ve üstünde kapak. Görünen çap 4,1 cm, çıkma boyu
// 10,2 cm (ESYA; kaynak olculer.ts). Yuvanın ölçüsü DENEME.
function SulamaBasliklari() {
  const r = ESYA.sulamaCap / 2;
  const b = ESYA.sulamaBoy;
  const kapak = 0.022;
  return (
    <group>
      {SULAMA.map((n, i) => (
        <group key={i} position={[n[0], MODEL.cimUstu, n[1]]}>
          <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[DENEME.sulamaYuva, 28]} />
            <meshStandardMaterial color="#8E7F62" roughness={1} />
          </mesh>
          <mesh position={[0, 0.006, 0]} castShadow>
            <cylinderGeometry args={[r + 0.012, r + 0.012, 0.012, 24]} />
            <meshStandardMaterial color="#2B2A28" roughness={0.7} />
          </mesh>
          <mesh position={[0, (b - kapak) / 2, 0]} castShadow>
            <cylinderGeometry args={[r * 0.72, r * 0.72, b - kapak, 20]} />
            <meshStandardMaterial color="#8C9299" roughness={0.45} />
          </mesh>
          <mesh position={[0, b - kapak / 2, 0]} castShadow>
            <cylinderGeometry args={[r, r, kapak, 24]} />
            <meshStandardMaterial color="#2B2A28" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Baraj mankenleri (5. delik). Kemal, 19 Kasım 2026: kalsın, gerçeğe yakın. Gerçek antrenman mankeni biçimi:
// baş, omuz ve gövde silueti tek parça düz kalıp (insan yüzü yok), altta direk ve yuvarlak ayak tabanı.
// Boy 1,80 m (ESYA; kaynak olculer.ts); en, kalınlık ve taban DENEME. Renk lacivert. Yazı, logo yok.
function BarajMankenleri() {
  const en = DENEME.mankenEn;
  const boy = ESYA.mankenBoy;
  const kalin = DENEME.mankenKalinlik;
  const siluet = useMemo(() => {
    // Silüet (z, y) düzleminde çizilir: z yana, y yukarı. Oranlar DENEME.
    const w = en / 2;
    const s = new Shape();
    s.moveTo(-w * 0.34, boy * 0.3); // kalça
    s.lineTo(-w * 0.62, boy * 0.52); // bel
    s.lineTo(-w, boy * 0.74); // koltuk altı
    s.quadraticCurveTo(-w, boy * 0.845, -w * 0.5, boy * 0.855); // omuz
    s.lineTo(-w * 0.3, boy * 0.87); // boyun
    s.quadraticCurveTo(-w * 0.48, boy * 0.94, -w * 0.3, boy * 0.985); // baş
    s.quadraticCurveTo(0, boy * 1.012, w * 0.3, boy * 0.985);
    s.quadraticCurveTo(w * 0.48, boy * 0.94, w * 0.3, boy * 0.87);
    s.lineTo(w * 0.5, boy * 0.855);
    s.quadraticCurveTo(w, boy * 0.845, w, boy * 0.74);
    s.lineTo(w * 0.62, boy * 0.52);
    s.lineTo(w * 0.34, boy * 0.3);
    s.closePath();
    return s;
  }, [en, boy]);
  return (
    <group>
      {MANKENLER.map((n, i) => (
        <group key={i} position={[n[0], MODEL.cimUstu, n[1]]}>
          {/* Ayak tabanı ve direk */}
          <mesh position={[0, 0.02, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[DENEME.mankenTaban / 2 - 0.02, DENEME.mankenTaban / 2, 0.04, 28]} />
            <meshStandardMaterial color="#2B2A28" roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.04 + (boy * 0.3) / 2, 0]} castShadow>
            <boxGeometry args={[kalin * 0.8, boy * 0.3, 0.07]} />
            <meshStandardMaterial color={renk.lacivert} roughness={0.9} />
          </mesh>
          {/* Gövde silueti: düz kalıp, kaleye ve topa dönük */}
          <mesh position={[-kalin / 2, 0.04, 0]} rotation={[0, -Math.PI / 2, 0]} castShadow>
            <extrudeGeometry args={[siluet, { depth: kalin, bevelEnabled: false, curveSegments: 10 }]} />
            <meshStandardMaterial color={renk.lacivertAcik} roughness={0.9} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// Taş duvarın dibindeki taş sırası (9. delik). Modelde ve künyede yok: DENEME, Kemal onaylamadı.
// Renkler modeldeki duvar taşlarının renkleri.
const TAS_TONLARI = ['#D6C7A8', '#C9B48F', '#BFA987', '#DDD0B4'];
function TasSirasi() {
  return (
    <group>
      {TAS_SIRASI.map((t, i) => (
        <mesh key={i} position={[(t.x0 + t.x1) / 2, t.boy / 2, MODEL.tasDuvarIcZ + t.derinlik / 2]} castShadow receiveShadow>
          <boxGeometry args={[t.x1 - t.x0, t.boy, t.derinlik]} />
          <meshStandardMaterial color={TAS_TONLARI[t.ton]} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

// Köprü (8. delik; 9. delikte üstte ve ayaklarıyla). Modelde yok, kodla çizilir. Yeri karar (Kemal: açık
// tribünün kulüp binası ucunda, tribünün arkasından taş duvara). Biçimi ve ölçüsü DENEME, Kemal onaylamadı:
// düz beton döşeme, kenarsız ve korkuluksuz; koridorda iki ayak. Tribünün arka duvarında köprünün eninde
// bir geçit açılır (modelin duvarı orada kesilir, basamak düzeyine kadar olan altı kodla doldurulur).
// Döşeme tribünden (2,52 m) taş duvarın üstüne (2,40 m) hafif iner; duvarın üstünde düz bir sahanlık olur.
const KOPRU_KESIMI: Kesim = { x0: KOPRU.x0, x1: KOPRU.x1, z0: MODEL.arkaDuvarDisZ - 0.05, z1: MODEL.arkaDuvarIcZ, malzemeler: ['tas2'] };
function Kopru() {
  const en = KOPRU.x1 - KOPRU.x0;
  const x = (KOPRU.x0 + KOPRU.x1) / 2;
  const k = DENEME.kopruKalinlik;
  const duvarKalin = MODEL.arkaDuvarIcZ - MODEL.arkaDuvarDisZ;
  const tasKalin = MODEL.tasDuvarIcZ - MODEL.tasDuvarDisZ;
  const egik = Math.hypot(KOPRU_BOY, KOPRU_INIS);
  const aci = -Math.atan2(KOPRU_INIS, KOPRU_BOY);
  const beton = '#C9C1B0';
  return (
    <group>
      {/* Geçidin altı: arka duvarın basamak düzeyine kadar olan kısmı (modeldeki duvarın rengi) */}
      <mesh position={[x, KOPRU.y0 / 2, MODEL.arkaDuvarDisZ + duvarKalin / 2]} castShadow receiveShadow>
        <boxGeometry args={[en, KOPRU.y0, duvarKalin]} />
        <meshStandardMaterial color="#C9B48F" roughness={1} />
      </mesh>
      {/* Döşeme: koridorun üstünde, tribünden duvara iner */}
      <mesh position={[x, (KOPRU.y0 + KOPRU.y1) / 2 - k / 2, (MODEL.arkaDuvarDisZ + MODEL.tasDuvarIcZ) / 2]} rotation={[aci, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[en, k, egik]} />
        <meshStandardMaterial color={beton} roughness={1} />
      </mesh>
      {/* Sahanlık: taş duvarın üstünde düz */}
      <mesh position={[x, KOPRU.y1 - 0.11, MODEL.tasDuvarDisZ + tasKalin / 2]} castShadow receiveShadow>
        <boxGeometry args={[en, 0.22, tasKalin]} />
        <meshStandardMaterial color={beton} roughness={1} />
      </mesh>
      {/* Ayaklar: koridorda, açıklığın üçte birlerinde */}
      {KOPRU_AYAKLAR.map((a, i) => {
        const ayakBoy = kopruY(a[1]) - k;
        return (
          <mesh key={i} position={[a[0], ayakBoy / 2, a[1]]} castShadow receiveShadow>
            <boxGeometry args={[DENEME.kopruAyak, ayakBoy, DENEME.kopruAyak]} />
            <meshStandardMaterial color="#B9B09D" roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// Öne çıkarılan kenar (4. delikteki eğik sektirme kenarı): öbür kenardan yüksek, üstü krem şerit.
function VurguKenar({ a, b, y }: { a: [number, number]; b: [number, number]; y: number }) {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const boy = Math.hypot(dx, dz);
  const yuk = DENEME.vurguKenarYukseklik;
  const en = DENEME.bordurEn + 0.02;
  return (
    <group position={[(a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2]} rotation={[0, Math.atan2(-dz, dx), 0]}>
      <mesh position={[0, yuk / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[boy + en, yuk, en]} />
        <meshStandardMaterial color={renk.kiremit} roughness={1} />
      </mesh>
      <mesh position={[0, yuk + 0.006, 0]}>
        <boxGeometry args={[boy + en, 0.012, en]} />
        <meshStandardMaterial color={renk.krem} roughness={1} />
      </mesh>
    </group>
  );
}

// Atış maketinin 3B parçaları: nişan çizgisi, parmağa giden çizgi, güç halkası.
function AtisIsaretleri({ delik, parmakBildir }: { delik: OrnekDelik; parmakBildir: (x: number, y: number) => void }) {
  const { top, yon, boy } = delik.atis;
  const y = top[1] + 0.008;
  const bas: N3 = [top[0] + yon[0] * TOP_YARICAP * 2, y, top[2] + yon[1] * TOP_YARICAP * 2];
  const son: N3 = [top[0] + yon[0] * boy, y, top[2] + yon[1] * boy];
  const parmak: N3 = [top[0] - yon[0] * boy * 0.3, y, top[2] - yon[1] * boy * 0.3]; // çekme boyu DENEME
  return (
    <>
      <KesikNisan bas={bas} son={son} />
      <KalinCizgi bas={[top[0], y, top[2]]} son={parmak} kalinlik={0.01} renkKodu={renk.lacivert} saydam={0.7} />
      <GucHalkasi merkez={top} oran={0.45} />
      <EkranKonumu nokta={parmak} bildir={parmakBildir} />
    </>
  );
}

type SahneOzellik = {
  no: number;
  atis?: boolean;
  parmakBildir?: (x: number, y: number) => void;
  // Deliğin ekrandaki yeri (ekranın dışındaysa kenarda ok çizilir).
  delikBildir?: (x: number, y: number) => void;
};

export function OrnekSahne({ no, atis = false, parmakBildir, delikBildir }: SahneOzellik) {
  const delik = ornekDelik(no);
  const bakis = BAKISLAR[delik.no][atis ? 'atis' : 'genel'];
  const top = atis ? delik.atis.top : delik.baslangic;
  const hedef: N3 = [top[0] + bakis.ileri[0], top[1] + bakis.ileri[1], top[2] + bakis.ileri[2]];
  const konum: N3 = [hedef[0] + bakis.uzak[0], hedef[1] + bakis.uzak[1], hedef[2] + bakis.uzak[2]];
  const kesimler = useMemo(() => {
    const liste: Kesim[] = [];
    if (KOLTUK_BOLGELERI[delik.no]) liste.push(tahtaKesimi(KOLTUK_BOLGELERI[delik.no]));
    if (delik.no === 8 || delik.no === 9) liste.push(KOPRU_KESIMI);
    return liste.length ? liste : undefined;
  }, [delik.no]);
  return (
    <StatSahnesi
      konum={konum}
      hedef={hedef}
      zoom={bakis.zoom}
      golgeMerkez={hedef}
      golgeYaricap={bakis.golge}
      modelsiz={delik.no === 14}
      kesimler={kesimler}
      arkaPlan={delik.no === 14 ? renk.kremKoyu : renk.krem}
    >
      {delik.no === 1 && <Huniler />}
      {delik.no === 2 && <SulamaBasliklari />}
      {delik.no === 5 && <BarajMankenleri />}
      {delik.vurguKenar && <VurguKenar a={delik.vurguKenar[0]} b={delik.vurguKenar[1]} y={delik.bordurler[0].y} />}
      {KOLTUK_BOLGELERI[delik.no] && <TribunKoltuklari bolge={KOLTUK_BOLGELERI[delik.no]} bos={delik.no === 7 ? BOS_KOLTUK : undefined} />}
      {(delik.no === 8 || delik.no === 9) && <Kopru />}
      {delik.no === 9 && <TasSirasi />}
      {delik.no === 14 && <DusOdasi />}
      {delik.birikinti && <Birikinti n={delik.birikinti.n} r={delik.birikinti.r} />}
      {delik.bordurler.map((b, i) => (
        <Bordur key={i} noktalar={b.noktalar} y={b.y} />
      ))}
      <Baslangic konum={delik.baslangic} />
      <BayrakliDelik konum={delik.cukur} izgara={delik.no === 14} />
      {atis && parmakBildir && <AtisIsaretleri delik={delik} parmakBildir={parmakBildir} />}
      {delikBildir && <EkranKonumu nokta={delik.cukur} bildir={delikBildir} />}
      <Top konum={top} />
    </StatSahnesi>
  );
}
