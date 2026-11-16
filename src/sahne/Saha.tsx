import { Canvas } from '@react-three/fiber';
import { renk } from './renkler';

// Boş saha (iskelet). Ölçüler deneme değeridir, Kemal onaylamadı (DENEME):
// zemin dikey ekrana uysun diye uzun kenarı ekranın yukarısına doğru.
const ZEMIN_EN = 4; // DENEME
const ZEMIN_BOY = 7; // DENEME
const KENAR_YUKSEKLIK = 0.18; // DENEME
const KENAR_KALINLIK = 0.14; // DENEME
const TOP_CAP = 0.12; // DENEME (yer tutucu top)

function Kenarlar() {
  const y = KENAR_YUKSEKLIK / 2;
  const yarimEn = ZEMIN_EN / 2 + KENAR_KALINLIK / 2;
  const yarimBoy = ZEMIN_BOY / 2 + KENAR_KALINLIK / 2;
  const parcalar: { konum: [number, number, number]; boyut: [number, number, number] }[] = [
    { konum: [0, y, -yarimBoy], boyut: [ZEMIN_EN + KENAR_KALINLIK * 2, KENAR_YUKSEKLIK, KENAR_KALINLIK] },
    { konum: [0, y, yarimBoy], boyut: [ZEMIN_EN + KENAR_KALINLIK * 2, KENAR_YUKSEKLIK, KENAR_KALINLIK] },
    { konum: [-yarimEn, y, 0], boyut: [KENAR_KALINLIK, KENAR_YUKSEKLIK, ZEMIN_BOY] },
    { konum: [yarimEn, y, 0], boyut: [KENAR_KALINLIK, KENAR_YUKSEKLIK, ZEMIN_BOY] },
  ];
  return (
    <>
      {parcalar.map((p, i) => (
        <mesh key={i} position={p.konum} castShadow receiveShadow>
          <boxGeometry args={p.boyut} />
          <meshStandardMaterial color={renk.lacivertAcik} roughness={1} flatShading />
        </mesh>
      ))}
    </>
  );
}

export function Saha() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      // Eğik yukarıdan, hafif çapraz bakan sabit kamera (fikir belgesi, oynanış A).
      // Dönme ve yakınlaştırma sonraki paketlerde.
      camera={{ position: [2.2, 11, 6.4], fov: 42, near: 0.1, far: 100 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0.4)}
    >
      <color attach="background" args={[renk.lacivert]} />
      <hemisphereLight args={[renk.krem, renk.lacivert, 0.9]} />
      <directionalLight
        position={[4, 10, 3]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      {/* Düz zemin */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[ZEMIN_EN, ZEMIN_BOY]} />
        <meshStandardMaterial color={renk.kremKoyu} roughness={1} />
      </mesh>
      <Kenarlar />
      {/* Yer tutucu top */}
      <mesh position={[0, TOP_CAP, 0]} castShadow>
        <icosahedronGeometry args={[TOP_CAP, 1]} />
        <meshStandardMaterial color={renk.kiremit} roughness={1} flatShading />
      </mesh>
    </Canvas>
  );
}
