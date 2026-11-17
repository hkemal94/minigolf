import { renk } from '../sahne/renkler';

// MAKET (öneri): pist parçaları. Bütün ölçüler DENEME, Kemal onaylamadı.
const BANT_YUKSEKLIK = 0.35; // DENEME
const BANT_KALINLIK = 0.25; // DENEME
const PIST_KALINLIK = 0.12; // DENEME
export const TOP_CAP = 0.28; // DENEME (maket için büyütülmüş)
const DELIK_CAP = 0.42; // DENEME

// Dikdörtgen pist: x ekseninde uzanır. merkez = pistin ortası (zeminde).
export function Pist({ merkez, boy, en }: { merkez: [number, number, number]; boy: number; en: number }) {
  const [x, y, z] = merkez;
  const ust = y + PIST_KALINLIK;
  const bantlar: { k: [number, number, number]; b: [number, number, number] }[] = [
    { k: [x, ust + BANT_YUKSEKLIK / 2, z - en / 2 - BANT_KALINLIK / 2], b: [boy + BANT_KALINLIK * 2, BANT_YUKSEKLIK, BANT_KALINLIK] },
    { k: [x, ust + BANT_YUKSEKLIK / 2, z + en / 2 + BANT_KALINLIK / 2], b: [boy + BANT_KALINLIK * 2, BANT_YUKSEKLIK, BANT_KALINLIK] },
    { k: [x - boy / 2 - BANT_KALINLIK / 2, ust + BANT_YUKSEKLIK / 2, z], b: [BANT_KALINLIK, BANT_YUKSEKLIK, en] },
    { k: [x + boy / 2 + BANT_KALINLIK / 2, ust + BANT_YUKSEKLIK / 2, z], b: [BANT_KALINLIK, BANT_YUKSEKLIK, en] },
  ];
  return (
    <group>
      <mesh position={[x, y + PIST_KALINLIK / 2, z]} receiveShadow castShadow>
        <boxGeometry args={[boy, PIST_KALINLIK, en]} />
        <meshStandardMaterial color={renk.krem} emissive={renk.krem} emissiveIntensity={0.25} roughness={1} />
      </mesh>
      {bantlar.map((p, i) => (
        <mesh key={i} position={p.k} castShadow receiveShadow>
          <boxGeometry args={p.b} />
          <meshStandardMaterial color={renk.lacivert} roughness={1} />
        </mesh>
      ))}
    </group>
  );
}

export const pistUstu = (y: number) => y + PIST_KALINLIK;

// Pist üstünde basit engel bloğu (lacivert).
export function Blok({ konum, boyut }: { konum: [number, number, number]; boyut: [number, number, number] }) {
  return (
    <mesh position={[konum[0], konum[1] + boyut[1] / 2, konum[2]]} castShadow receiveShadow>
      <boxGeometry args={boyut} />
      <meshStandardMaterial color={renk.lacivertAcik} roughness={1} />
    </mesh>
  );
}

export function Top({ konum }: { konum: [number, number, number] }) {
  return (
    <mesh position={[konum[0], konum[1] + TOP_CAP, konum[2]]} castShadow>
      <sphereGeometry args={[TOP_CAP, 20, 14]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
    </mesh>
  );
}

// Delik ve bayrak: koyu daire, ince direk, kiremit bayrak.
export function BayrakliDelik({ konum }: { konum: [number, number, number] }) {
  const [x, y, z] = konum;
  return (
    <group>
      <mesh position={[x, y + 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[DELIK_CAP, 28]} />
        <meshBasicMaterial color={renk.lacivert} />
      </mesh>
      <mesh position={[x, y + 1.4, z]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 2.8, 8]} />
        <meshStandardMaterial color={renk.lacivert} />
      </mesh>
      <mesh position={[x, y + 2.45, z + 0.45]} castShadow>
        <boxGeometry args={[0.04, 0.6, 0.9]} />
        <meshStandardMaterial color={renk.kiremit} roughness={1} />
      </mesh>
    </group>
  );
}

// Kalın çizgi gerekince: zemine yatık ince kutu (telefonda tek piksellik çizgi kaybolur).
export function KalinCizgi({ bas, son, kalinlik, renkKodu, saydam = 1 }: { bas: [number, number, number]; son: [number, number, number]; kalinlik: number; renkKodu: string; saydam?: number }) {
  const dx = son[0] - bas[0];
  const dz = son[2] - bas[2];
  const boy = Math.hypot(dx, dz);
  const aci = Math.atan2(-dz, dx);
  return (
    <mesh position={[(bas[0] + son[0]) / 2, bas[1], (bas[2] + son[2]) / 2]} rotation={[0, aci, 0]}>
      <boxGeometry args={[boy, 0.03, kalinlik]} />
      <meshBasicMaterial color={renkKodu} transparent={saydam < 1} opacity={saydam} />
    </mesh>
  );
}

// Kesik nişan çizgisi kalın parçalarla (kiremit).
export function KesikNisan({ bas, son, parca = 0.5, bosluk = 0.35 }: { bas: [number, number, number]; son: [number, number, number]; parca?: number; bosluk?: number }) {
  const dx = son[0] - bas[0];
  const dz = son[2] - bas[2];
  const boy = Math.hypot(dx, dz);
  const ux = dx / boy;
  const uz = dz / boy;
  const parcalar: [[number, number, number], [number, number, number]][] = [];
  for (let t = 0; t < boy; t += parca + bosluk) {
    const t2 = Math.min(t + parca, boy);
    parcalar.push([
      [bas[0] + ux * t, bas[1], bas[2] + uz * t],
      [bas[0] + ux * t2, bas[1], bas[2] + uz * t2],
    ]);
  }
  return (
    <>
      {parcalar.map(([a, b], i) => (
        <KalinCizgi key={i} bas={a} son={b} kalinlik={0.12} renkKodu={renk.kiremit} />
      ))}
    </>
  );
}

// Güç halkası: topun çevresinde zemine yatık halka; dolu kısım gücü gösterir (oran DENEME).
export function GucHalkasi({ merkez, oran }: { merkez: [number, number, number]; oran: number }) {
  return (
    <group position={[merkez[0], merkez[1] + 0.02, merkez[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[0.85, 1.05, 48]} />
        <meshBasicMaterial color={renk.lacivert} transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <ringGeometry args={[0.85, 1.05, 48, 1, 0, Math.PI * 2 * oran]} />
        <meshBasicMaterial color={renk.lacivert} />
      </mesh>
    </group>
  );
}
