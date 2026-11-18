import { renk } from '../sahne/renkler';
import { DENEME, GOLF, TOP_YARICAP, WMF } from './olculer';
import type { N2, N3 } from './ornekDelikler';

// MAKET (öneri): pistin ortak parçaları. Zemin çizilmez: pistin zemini mekânın kendi zeminidir
// (Kemal, 18 Kasım 2026); burada yalnız ince bordür, başlangıç işareti, top, delik ve nişan var.
// Ölçüler olculer.ts'te; kaynağı olmayanlar DENEME.

// İnce, yükseltilmiş bordür: verilen noktaları sırayla birleştirir. Renk kiremit (Kemal, 18 Kasım 2026).
export function Bordur({ noktalar, y }: { noktalar: N2[]; y: number }) {
  const h = DENEME.bordurYukseklik;
  const e = DENEME.bordurEn;
  return (
    <group>
      {noktalar.slice(0, -1).map((a, i) => {
        const b = noktalar[i + 1];
        const dx = b[0] - a[0];
        const dz = b[1] - a[1];
        return (
          <mesh key={i} position={[(a[0] + b[0]) / 2, y + h / 2, (a[1] + b[1]) / 2]} rotation={[0, Math.atan2(-dz, dx), 0]} castShadow receiveShadow>
            <boxGeometry args={[Math.hypot(dx, dz) + e, h, e]} />
            <meshStandardMaterial color={renk.kiremit} roughness={1} />
          </mesh>
        );
      })}
    </group>
  );
}

// Başlangıç işareti: zemine yatık krem daire (çap WMF beton pistteki gibi 30 cm).
export function Baslangic({ konum }: { konum: N3 }) {
  return (
    <mesh position={[konum[0], konum[1] + 0.004, konum[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <ringGeometry args={[WMF.baslangicDairesi / 2 - 0.012, WMF.baslangicDairesi / 2, 40]} />
      <meshBasicMaterial color={renk.krem} />
    </mesh>
  );
}

export function Top({ konum }: { konum: N3 }) {
  return (
    <mesh position={[konum[0], konum[1] + TOP_YARICAP, konum[2]]} castShadow>
      <sphereGeometry args={[TOP_YARICAP, 20, 14]} />
      <meshStandardMaterial color="#FFFFFF" roughness={0.6} />
    </mesh>
  );
}

// Delik ve bayrak: koyu daire, ince direk, kiremit bayrak. izgara: delik yer süzgeciyse çevresine halka.
export function BayrakliDelik({ konum, izgara = false }: { konum: N3; izgara?: boolean }) {
  const [x, y, z] = konum;
  const r = GOLF.delikCap / 2;
  const boy = DENEME.bayrakBoy;
  return (
    <group>
      {izgara && (
        <mesh position={[x, y + 0.003, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r, r + 0.035, 28]} />
          <meshBasicMaterial color="#8C9299" />
        </mesh>
      )}
      <mesh position={[x, y + 0.005, z]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[r, 28]} />
        <meshBasicMaterial color={renk.lacivert} />
      </mesh>
      <mesh position={[x, y + boy / 2, z]} castShadow>
        <cylinderGeometry args={[0.008, 0.008, boy, 8]} />
        <meshStandardMaterial color={renk.lacivert} />
      </mesh>
      <mesh position={[x, y + boy - 0.08, z + 0.11]} castShadow>
        <boxGeometry args={[0.008, 0.16, 0.22]} />
        <meshStandardMaterial color={renk.kiremit} roughness={1} />
      </mesh>
    </group>
  );
}

// Kalın çizgi gerekince: zemine yatık ince kutu (telefonda tek piksellik çizgi kaybolur).
export function KalinCizgi({ bas, son, kalinlik, renkKodu, saydam = 1 }: { bas: N3; son: N3; kalinlik: number; renkKodu: string; saydam?: number }) {
  const dx = son[0] - bas[0];
  const dz = son[2] - bas[2];
  return (
    <mesh position={[(bas[0] + son[0]) / 2, bas[1], (bas[2] + son[2]) / 2]} rotation={[0, Math.atan2(-dz, dx), 0]}>
      <boxGeometry args={[Math.hypot(dx, dz), 0.004, kalinlik]} />
      <meshBasicMaterial color={renkKodu} transparent={saydam < 1} opacity={saydam} />
    </mesh>
  );
}

// Kesik nişan çizgisi kalın parçalarla (kiremit). Parça ve boşluk boyu DENEME.
export function KesikNisan({ bas, son, parca = 0.07, bosluk = 0.045 }: { bas: N3; son: N3; parca?: number; bosluk?: number }) {
  const dx = son[0] - bas[0];
  const dz = son[2] - bas[2];
  const boy = Math.hypot(dx, dz);
  const ux = dx / boy;
  const uz = dz / boy;
  const parcalar: [N3, N3][] = [];
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
        <KalinCizgi key={i} bas={a} son={b} kalinlik={DENEME.nisanKalinlik} renkKodu={renk.kiremit} />
      ))}
    </>
  );
}

// Güç halkası: topun çevresinde zemine yatık halka; dolu kısım gücü gösterir (oran DENEME).
export function GucHalkasi({ merkez, oran }: { merkez: N3; oran: number }) {
  const ic = DENEME.gucHalkasiIc;
  const dis = DENEME.gucHalkasiDis;
  return (
    <group position={[merkez[0], merkez[1] + 0.006, merkez[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[ic, dis, 48]} />
        <meshBasicMaterial color={renk.krem} transparent opacity={0.55} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0, 0.002]}>
        <ringGeometry args={[ic, dis, 48, 1, 0, Math.PI * 2 * oran]} />
        <meshBasicMaterial color={renk.lacivert} />
      </mesh>
    </group>
  );
}
