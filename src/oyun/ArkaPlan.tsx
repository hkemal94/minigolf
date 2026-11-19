import { useEffect, useMemo } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { CanvasTexture, Mesh, MeshLambertMaterial, SRGBColorSpace, type Object3D } from 'three';
import { ARKA_PLAN } from './ayarlar';

// OYNANABİLİR PROTOTİP · arka plan (Kemal, 19 Kasım 2026). Stadın çevresi KKM haritasının 3B parçalarından, gerçek yerinde
// (scripts/arka-plani-uret.mjs). Renkler köşe renklerinde, uzaklık pusu dahil; doku yok, ışık hesabı en ucuz hâliyle.
// Bu grup engel grubunun DIŞINDA: şeffaflık ışını ona çarpmaz, gölge almaz ve vermez.
const ARKA_MODELI = `${import.meta.env.BASE_URL}modeller/arka-plan.glb`;

// Gök: ekranın üstünden altına yumuşak geçiş (iki renk). Dik izdüşümlü kamerada ufuk yok; görüldüğü yer haritanın bittiği yer.
function gokDokusu(): CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 2;
  c.height = 256;
  const g = c.getContext('2d')!;
  const gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, ARKA_PLAN.gokUst);
  gr.addColorStop(1, ARKA_PLAN.gokAlt);
  g.fillStyle = gr;
  g.fillRect(0, 0, 2, 256);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

export function ArkaPlan({ dusuk }: { dusuk: () => boolean }) {
  const gltf = useLoader(GLTFLoader, ARKA_MODELI, (y) => {
    (y as GLTFLoader).setMeshoptDecoder(MeshoptDecoder);
  });
  const { scene } = useThree();
  const gok = useMemo(gokDokusu, []);
  useEffect(() => {
    const eski = scene.background;
    scene.background = gok;
    return () => {
      scene.background = eski;
      gok.dispose();
    };
  }, [scene, gok]);

  const { sahne, ayrinti } = useMemo(() => {
    const kopya = gltf.scene.clone(true);
    const malzeme = new MeshLambertMaterial({ vertexColors: true, flatShading: true });
    const ayrinti: Object3D[] = [];
    kopya.traverse((o: Object3D) => {
      if (o.name === 'yapi' || o.name === 'bitki') ayrinti.push(o);
      if (!(o instanceof Mesh)) return;
      o.material = malzeme;
      o.castShadow = false;
      o.receiveShadow = false;
      o.userData.engelDegil = true;
    });
    return { sahne: kopya, ayrinti };
  }, [gltf]);

  // Kalite düşünce (gölgeler kapanınca) evler, duvarlar ve ağaçlar gizlenir.
  useFrame(() => {
    const gorunur = !(ARKA_PLAN.dusukteAyrintiYok && dusuk());
    for (const o of ayrinti) o.visible = gorunur;
  });

  return <primitive object={sahne} />;
}
