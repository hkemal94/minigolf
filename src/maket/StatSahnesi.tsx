import { Suspense, useLayoutEffect, useMemo, useRef, type ReactNode } from 'react';
import { Canvas, useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Mesh, Plane, Vector3, type Material, type Object3D } from 'three';
import { renk } from '../sahne/renkler';

// MAKET (öneri): yalnız ?maket=… ekranlarında kullanılır, oyunun kalıcı koduna girmez.
// 3B Dirlik Stadı modeli Kems Ajans'ın Blender modeli (docs/lisanslar.md). Model metreyle çizilmiş.
export const STAT_MODELI = `${import.meta.env.BASE_URL}modeller/dirlik-stadi.glb`;

// Modelin kendi ölçüsünde (metreye yakın) sahanın ortası: orta yuvarlak.
export const ORTA_YUVARLAK: [number, number, number] = [45, 0, -29];

// Modelde kesilecek kutu: içindeki oturma tahtaları (krem ve lacivert) çizilmez; yerlerine makette
// tek tek koltuk çizilir (Kemal, 18 Kasım 2026). Model dosyasına dokunulmaz.
// malzemeler: kutunun içinde hangi malzemeler kesilir (yoksa oturma tahtaları: krem ve lacivert).
// Adım 2: arka duvarda köprünün geçidi için 'tas2' de kesilir. Bir malzeme yalnız bir kutuyla kesilir.
export type Kesim = { x0: number; x1: number; z0: number; z1: number; malzemeler?: string[] };

function StatModeli({ kesimler }: { kesimler?: Kesim[] }) {
  const gltf = useLoader(GLTFLoader, STAT_MODELI);
  const sahne = useMemo(() => {
    const kopya = gltf.scene.clone(true);
    const duzlemler = new Map<string, Plane[]>();
    for (const kesim of kesimler ?? []) {
      const d = [
        new Plane(new Vector3(-1, 0, 0), kesim.x0),
        new Plane(new Vector3(1, 0, 0), -kesim.x1),
        new Plane(new Vector3(0, 0, -1), kesim.z0),
        new Plane(new Vector3(0, 0, 1), -kesim.z1),
      ];
      for (const ad of kesim.malzemeler ?? ['krem', 'lacivert']) duzlemler.set(ad, d);
    }
    kopya.traverse((o: Object3D) => {
      if (!(o instanceof Mesh)) return;
      o.castShadow = true;
      o.receiveShadow = true;
      const ad = (o.material as Material).name;
      if (ad === 'zemin') {
        // Modelde toprak zemin ile çimin tabanı aynı yükseklikte; üst üste titremesin diye zemin geriye itilir.
        const zemin = (o.material as Material).clone();
        zemin.polygonOffset = true;
        zemin.polygonOffsetFactor = 2;
        zemin.polygonOffsetUnits = 8;
        o.material = zemin;
      }
      if (ad === 'file') {
        // Kale ağı modelde dolu kutu; içi görünsün diye saydam.
        const ag = (o.material as Material).clone();
        ag.transparent = true;
        ag.opacity = 0.32;
        ag.depthWrite = false;
        o.material = ag;
        o.castShadow = false;
      }
      if (duzlemler.has(ad)) {
        const kesik = (o.material as Material).clone();
        kesik.clippingPlanes = duzlemler.get(ad)!;
        kesik.clipIntersection = true;
        kesik.clipShadows = true;
        o.material = kesik;
      }
    });
    return kopya;
  }, [gltf, kesimler]);
  return <primitive object={sahne} />;
}

// Kamerayı ilk çizimden önce yerine koyar (eğik yukarıdan, izometrik).
function Kamera({ konum, hedef, zoom }: { konum: [number, number, number]; hedef: [number, number, number]; zoom: number }) {
  const { camera } = useThree();
  useLayoutEffect(() => {
    camera.position.set(...konum);
    camera.zoom = zoom;
    camera.lookAt(...hedef);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, [camera, konum, hedef, zoom]);
  return null;
}

// Sahnedeki bir noktanın ekrandaki yerini bildirir (parmak işaretini 3B'nin üstüne koymak için).
export function EkranKonumu({ nokta, bildir }: { nokta: [number, number, number]; bildir: (x: number, y: number) => void }) {
  const { camera, size } = useThree();
  const son = useRef<[number, number]>([-1, -1]);
  useFrame(() => {
    const v = new Vector3(...nokta).project(camera);
    const x = ((v.x + 1) / 2) * size.width;
    const y = ((1 - v.y) / 2) * size.height;
    if (Math.abs(x - son.current[0]) > 0.5 || Math.abs(y - son.current[1]) > 0.5) {
      son.current = [x, y];
      bildir(x, y);
    }
  });
  return null;
}

type Ozellik = {
  konum: [number, number, number];
  hedef: [number, number, number];
  zoom: number;
  // Gölge kutusunun ortası ve yarı genişliği (modelin tamamı büyük; yalnız görünen yere gölge).
  golgeMerkez?: [number, number, number];
  golgeYaricap?: number;
  arkaPlan?: string;
  // Görüş açısı verilirse eğik yukarıdan perspektif kamera (iskeletteki gibi); verilmezse izometrik.
  gorusAcisi?: number;
  // Model çizilmesin (modelde olmayan kapalı yerler: duşlar).
  modelsiz?: boolean;
  kesimler?: Kesim[];
  children?: ReactNode;
};

export function StatSahnesi({ konum, hedef, zoom, golgeMerkez = hedef, golgeYaricap = 40, arkaPlan = renk.krem, gorusAcisi, modelsiz = false, kesimler, children }: Ozellik) {
  const [gx, gy, gz] = golgeMerkez;
  return (
    <Canvas
      shadows
      orthographic={!gorusAcisi}
      dpr={[1, 2]}
      camera={gorusAcisi ? { position: konum, fov: gorusAcisi, near: 0.1, far: 1000 } : { position: konum, zoom, near: 0.1, far: 1000 }}
      gl={{ preserveDrawingBuffer: true }}
      onCreated={({ gl }) => {
        gl.localClippingEnabled = true;
      }}
    >
      <Kamera konum={konum} hedef={hedef} zoom={zoom} />
      <color attach="background" args={[arkaPlan]} />
      <hemisphereLight args={[renk.krem, '#6b5a43', 1.1]} />
      <directionalLight
        position={[gx + 30, gy + 60, gz + 20]}
        target-position={[gx, gy, gz]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-golgeYaricap}
        shadow-camera-right={golgeYaricap}
        shadow-camera-top={golgeYaricap}
        shadow-camera-bottom={-golgeYaricap}
        shadow-camera-far={200}
        shadow-bias={-0.0005}
      />
      <Suspense fallback={null}>
        {!modelsiz && <StatModeli kesimler={kesimler} />}
      </Suspense>
      {children}
    </Canvas>
  );
}
