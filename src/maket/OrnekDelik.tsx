import { useMemo } from 'react';
import { CanvasTexture, RepeatWrapping, SRGBColorSpace } from 'three';

import { renk } from '../sahne/renkler';
import { StatSahnesi, EkranKonumu } from './StatSahnesi';
import { Bordur, Baslangic, Top, BayrakliDelik, KesikNisan, KalinCizgi, GucHalkasi } from './Pist';
import { DENEME, MODEL, TOP_YARICAP } from './olculer';
import {
  ornekDelik,
  siraOn,
  siraY,
  TRIBUN_X0,
  TRIBUN_X1,
  TRIBUN_TAHTALAR,
  tahtaZ,
  DUS_BOY,
  DUS_EN,
  DUS_BOLMELER,
  type N3,
  type OrnekDelik,
} from './ornekDelikler';

// MAKET (öneri): üç örnek deliğin 3B sahnesi. Oynanış değil; top atılmaz.

// Kamera: her delik tek ekranda (genel) ve topun yakınından (atış). Açılar ve yakınlık DENEME.
type Bakis = { konum: N3; hedef: N3; zoom: number; golge: number };
const BAKISLAR: Record<number, { genel: Bakis; atis: Bakis }> = {
  3: {
    genel: { konum: [6.5, 20, -47], hedef: [-0.2, 0, -31.7], zoom: 45, golge: 14 },
    atis: { konum: [4.9, 17, -50.1], hedef: [-0.6, 0, -37.8], zoom: 88, golge: 10 },
  },
  7: {
    genel: { konum: [56.2, 20.7, -63.5], hedef: [45, 1.7, -65.95], zoom: 84, golge: 9 },
    atis: { konum: [57.8, 21.1, -64.3], hedef: [46.6, 2.1, -66.75], zoom: 170, golge: 7 },
  },
  14: {
    genel: { konum: [-8.9, 17.2, 5.85], hedef: [3.1, 0.2, 1.4], zoom: 78, golge: 8 },
    atis: { konum: [-10.6, 17.2, 5.55], hedef: [1.4, 0.2, 1.1], zoom: 122, golge: 6 },
  },
};

// Tribün: oturma tahtaları. Pistin geçtiği yerde modelin tahtaları kesilir (StatSahnesi, kesim);
// burada pistin dışında kalan parçalar yerine konur ve pistte bırakılan iki engel parçası çizilir.
function TribunEsyasi() {
  const t = MODEL.tahtaKalinlik;
  const e = MODEL.tahtaEn;
  return (
    <group>
      {TRIBUN_TAHTALAR.map((p, i) => (
        <mesh key={i} position={[(p.x0 + p.x1) / 2, siraY(p.sira) + t / 2, (tahtaZ(p.sira)[0] + tahtaZ(p.sira)[1]) / 2]} castShadow receiveShadow>
          <boxGeometry args={[p.x1 - p.x0, t, e]} />
          <meshStandardMaterial color={p.sira === 5 ? renk.krem : renk.lacivert} roughness={1} />
        </mesh>
      ))}
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

// Atış maketinin 3B parçaları: nişan çizgisi, parmağa giden çizgi, güç halkası.
function AtisIsaretleri({ delik, parmakBildir }: { delik: OrnekDelik; parmakBildir: (x: number, y: number) => void }) {
  const { top, yon, boy } = delik.atis;
  const y = top[1] + 0.02;
  const bas: N3 = [top[0] + yon[0] * TOP_YARICAP * 1.6, y, top[2] + yon[1] * TOP_YARICAP * 1.6];
  const son: N3 = [top[0] + yon[0] * boy, y, top[2] + yon[1] * boy];
  const parmak: N3 = [top[0] - yon[0] * boy * 0.36, y, top[2] - yon[1] * boy * 0.36]; // çekme boyu DENEME
  return (
    <>
      <KesikNisan bas={bas} son={son} />
      <KalinCizgi bas={[top[0], y, top[2]]} son={parmak} kalinlik={0.03} renkKodu={renk.lacivert} saydam={0.7} />
      <GucHalkasi merkez={top} oran={0.45} />
      <EkranKonumu nokta={parmak} bildir={parmakBildir} />
    </>
  );
}

export function OrnekSahne({ no, atis = false, parmakBildir }: { no: number; atis?: boolean; parmakBildir?: (x: number, y: number) => void }) {
  const delik = ornekDelik(no);
  const bakis = BAKISLAR[delik.no][atis ? 'atis' : 'genel'];
  const top = atis ? delik.atis.top : delik.baslangic;
  const kesim = useMemo(
    () => (delik.no === 7 ? { x0: TRIBUN_X0, x1: TRIBUN_X1, z0: siraOn(5) - 0.6, z1: siraOn(3) - 0.05 } : undefined),
    [delik.no],
  );
  return (
    <StatSahnesi
      konum={bakis.konum}
      hedef={bakis.hedef}
      zoom={bakis.zoom}
      golgeMerkez={bakis.hedef}
      golgeYaricap={bakis.golge}
      modelsiz={delik.no === 14}
      kesim={kesim}
      arkaPlan={delik.no === 14 ? renk.kremKoyu : renk.krem}
    >
      {delik.no === 7 && <TribunEsyasi />}
      {delik.no === 14 && <DusOdasi />}
      {delik.birikinti && <Birikinti n={delik.birikinti.n} r={delik.birikinti.r} />}
      {delik.bordurler.map((b, i) => (
        <Bordur key={i} noktalar={b.noktalar} y={b.y} />
      ))}
      <Baslangic konum={delik.baslangic} />
      <BayrakliDelik konum={delik.cukur} izgara={delik.no === 14} />
      {atis && parmakBildir && <AtisIsaretleri delik={delik} parmakBildir={parmakBildir} />}
      <Top konum={top} />
    </StatSahnesi>
  );
}


