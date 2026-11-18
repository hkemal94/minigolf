import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

import { renk } from '../sahne/renkler';
import { StatSahnesi, EkranKonumu } from './StatSahnesi';
import { Bordur, Baslangic, Top, BayrakliDelik, KesikNisan, KalinCizgi, GucHalkasi } from './Pist';
import { DENEME, IFAB, MODEL, TOP_YARICAP } from './olculer';
import {
  ornekDelik,
  siraOn,
  siraY,
  TRIBUN_X1,
  MERDIVEN_X0,
  BOS_KOLTUK,
  koltukX,
  koltukZ,
  DUS_BOY,
  DUS_EN,
  DUS_BOLMELER,
  KOSE,
  ORTA,
  PENALTI,
  type N3,
  type OrnekDelik,
} from './ornekDelikler';

// MAKET (öneri): yeni dille çizilen deliklerin 3B sahnesi. Oynanış değil; top atılmaz.

// Kamera topu yakından izler (Kemal, 18 Kasım 2026): top ve delik gerçek ölçüde olduğu için delik tek
// ekrana sığmaz; kamera topun yanındadır, deliğin yeri ekran kenarındaki okla ve küçük planla gösterilir.
// uzak: kameranın hedefe göre durduğu yön; ileri: hedefin toptan oyun yönüne kayması. Hepsi DENEME.
type Bakis = { uzak: N3; ileri: N3; zoom: number; golge: number };
// Adım 1 delikleri 3. delikle aynı uzaklık ve açıda; yalnız oyun yönüne göre çevrildi (-x ya da -z).
const eksiX = {
  genel: { uzak: [12.3, 17, 5.5], ileri: [-1.15, 0, -0.52], zoom: 200, golge: 5 },
  atis: { uzak: [12.3, 17, 5.5], ileri: [-0.42, 0, -0.19], zoom: 340, golge: 3 },
} satisfies { genel: Bakis; atis: Bakis };
const eksiZ = {
  genel: { uzak: [-5.5, 17, 12.3], ileri: [0.52, 0, -1.15], zoom: 200, golge: 5 },
  atis: { uzak: [-5.5, 17, 12.3], ileri: [0.19, 0, -0.42], zoom: 340, golge: 3 },
} satisfies { genel: Bakis; atis: Bakis };
const BAKISLAR: Record<number, { genel: Bakis; atis: Bakis }> = {
  1: eksiX,
  2: eksiZ,
  // 4: kamera topun tam arkasına yakın; dönüş, köşe bayrağı ve köşe yayı aynı ekrana girsin diye.
  4: {
    genel: { uzak: [13.3, 17, 1.5], ileri: [-1.2, 0, -0.15], zoom: 200, golge: 5 },
    atis: { uzak: [13.3, 17, 1.5], ileri: [-0.5, 0, -0.05], zoom: 340, golge: 3 },
  },
  5: eksiX,
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
// çizilir. Modelin tahtaları bu bölgede kesilir (StatSahnesi, kesim). Koltuk: oturak ve sırtlık; sırtlık
// bir üst basamağa bakan yanda. Boş bırakılan koltuklar topun alt sıraya geçtiği yerlerdir.
const KOLTUK_BOLGE = { x0: MERDIVEN_X0 - 4.5, x1: TRIBUN_X1 + 3.5 };
function TribunKoltuklari() {
  const koltuklar = useMemo(() => {
    const liste: { x: number; sira: number }[] = [];
    for (let sira = 1; sira <= MODEL.acikTribunSira; sira++) {
      // merdivenin doğusu
      for (let i = 0; koltukX(i)[1] <= KOLTUK_BOLGE.x1; i++) {
        if (BOS_KOLTUK[sira] !== i) liste.push({ x: (koltukX(i)[0] + koltukX(i)[1]) / 2, sira });
      }
      // merdivenin batısı
      for (let x = MERDIVEN_X0 - DENEME.koltukAralik / 2; x - DENEME.koltukEn / 2 >= KOLTUK_BOLGE.x0; x -= DENEME.koltukAralik) {
        liste.push({ x, sira });
      }
    }
    return liste;
  }, []);
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

// Adım 1 (delik 1, 2, 4, 5): zemin sahanın çimi.
// Modelde sahanın çimi çevredeki çimden 4 cm yüksek (basamak). Taç ve kale çizgisinin üstünden geçen
// pistte top bu basamağa takılır; makette çevre çim sahanın düzeyine getirilir. Model dosyasına
// dokunulmaz; modelin kendisinde de düzeltilmesi iyi olur. Renk modeldeki çimin rengi.
const SAHA_ESYALI = [1, 2, 4, 5];
function CevreCimi() {
  // Modeldeki çevre çim: x -4 … 94, z -62 … 4. Sahanın şeritli çiminin hemen altında durur.
  return (
    <mesh position={[45, MODEL.cimUstu - 0.001, -29]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[98, 66]} />
      <meshStandardMaterial color="#7E9A55" roughness={1} />
    </mesh>
  );
}

const CIZGI_RENGI = '#EEE8DC'; // modeldeki saha çizgisinin rengi

// Köşe bayrağı ve köşe yayı (modelde yok; tasarım belgesi 4.7 "eklenecek saha eşyası"). Kodla çizilir.
// Direk en az 1,5 m, köşe yayı 1 m (IFAB, Kural 1). Direğin kalınlığı ve bayrağın ölçüsü DENEME.
function KoseBayragi() {
  const boy = IFAB.koseBayragiEnAz;
  const r = DENEME.koseDirekYaricap;
  const yay = IFAB.koseYayiYaricap;
  const en = MODEL.cizgiEn;
  return (
    <group position={[KOSE[0], 0, KOSE[1]]}>
      <mesh position={[0, MODEL.cizgiUstu - 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <ringGeometry args={[yay - en / 2, yay + en / 2, 32, 1, -Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color={CIZGI_RENGI} roughness={1} />
      </mesh>
      <mesh position={[0, MODEL.cimUstu + boy / 2, 0]} castShadow>
        <cylinderGeometry args={[r, r, boy, 12]} />
        <meshStandardMaterial color={renk.krem} roughness={0.8} />
      </mesh>
      <mesh position={[DENEME.koseBayrakEn / 2 + r, MODEL.cimUstu + boy - DENEME.koseBayrakBoy / 2, 0]} castShadow>
        <boxGeometry args={[DENEME.koseBayrakEn, DENEME.koseBayrakBoy, 0.008]} />
        <meshStandardMaterial color={renk.lacivert} roughness={1} />
      </mesh>
    </group>
  );
}

// Orta yuvarlak modelde kesik parçalarla çizilmiş; yakından kare kare görünüyor. Makette üstüne aynı
// yarıçapta (IFAB 9,15 m), parçaların eninde düz bir çizgi çizilir; modelin kendisinde de düzeltilmesi iyi olur.
function OrtaYuvarlakCizgisi() {
  const r = IFAB.ortaYuvarlakYaricap;
  return (
    <mesh position={[ORTA[0], MODEL.cizgiUstu + 0.001, ORTA[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <ringGeometry args={[r - MODEL.ortaYuvarlakCizgiEn / 2, r + MODEL.ortaYuvarlakCizgiEn / 2, 160]} />
      <meshStandardMaterial color={CIZGI_RENGI} roughness={1} />
    </mesh>
  );
}

// Penaltı noktası (modelde yok; tasarım belgesi 4.7). Yeri IFAB: kale çizgisinden 11 m. Çapı DENEME.
function PenaltiNoktasi() {
  return (
    <mesh position={[PENALTI[0], MODEL.cimUstu + 0.003, PENALTI[1]]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <circleGeometry args={[DENEME.penaltiNoktasiCap / 2, 32]} />
      <meshStandardMaterial color={CIZGI_RENGI} roughness={1} />
    </mesh>
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
  const kesim = useMemo(
    () => (delik.no === 7 ? { x0: KOLTUK_BOLGE.x0, x1: KOLTUK_BOLGE.x1, z0: siraOn(MODEL.acikTribunSira) - 0.7, z1: siraOn(1) } : undefined),
    [delik.no],
  );
  return (
    <StatSahnesi
      konum={konum}
      hedef={hedef}
      zoom={bakis.zoom}
      golgeMerkez={hedef}
      golgeYaricap={bakis.golge}
      modelsiz={delik.no === 14}
      kesim={kesim}
      arkaPlan={delik.no === 14 ? renk.kremKoyu : renk.krem}
    >
      {SAHA_ESYALI.includes(delik.no) && <CevreCimi />}
      {delik.no === 1 && <OrtaYuvarlakCizgisi />}
      {delik.no === 4 && <KoseBayragi />}
      {delik.no === 5 && <PenaltiNoktasi />}
      {delik.no === 7 && <TribunKoltuklari />}
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
