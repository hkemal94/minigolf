import { Raycaster, Vector3, type Material, type Object3D, type Intersection } from 'three';
import { SEFFAFLIK } from './ayarlar';

// OYNANABİLİR PROTOTİP · engelin arkasında kalan top (Kemal, 19 Kasım 2026: "top bir duvarın, tribünün, binanın
// arkasında kalınca aradaki engel şeffaflaşsın").
//
// Nasıl: stat modeli malzemeye göre birleşik (bütün taş duvarlar tek parça), engel tek tek soldurulamaz. Bunun
// yerine her engel malzemesine küçük bir ek yapılır: kameradan topa giden çizginin çevresinde, topun önünde ve
// topun üstünde kalan yüzey, yumuşak kenarlı yuvarlak bir pencerede şeffaflaşır. Pencere yalnız top gerçekten
// bir engelin arkasındayken açılır; bunu saniyede birkaç kez atılan bir ışın söyler (her karede değil).
// Zemin (çim, toprak, saha çizgisi), top, işaretler ve file bu ekten geçmez. Değerler DENEME (SEFFAFLIK).

// Bütün engel malzemelerinin paylaştığı değerler (her karede yalnız sayılar değişir; malzeme kopyalanmaz).
export const seffafDegerler = {
  uTopMerkez: { value: new Vector3(0, -1000, 0) },
  uKameraYonu: { value: new Vector3(0, 1, 0) }, // topdan kameraya (birim)
  uYaricap: { value: 1 }, // pencerenin yarıçapı (m)
  uTopYaricap: { value: 0.02 },
  uGuc: { value: 0 }, // 0: pencere kapalı, 1: tam açık
  uOpaklik: { value: SEFFAFLIK.opaklik },
};

const isaretli = new WeakSet<Material>();

function ek(shader: { uniforms: Record<string, unknown>; vertexShader: string; fragmentShader: string }) {
  Object.assign(shader.uniforms, seffafDegerler);
  shader.vertexShader =
    'varying vec3 vSeffafDunya;\n' +
    shader.vertexShader.replace(
      '#include <project_vertex>',
      `#include <project_vertex>
      vec4 sfDunya = vec4( transformed, 1.0 );
      #ifdef USE_INSTANCING
        sfDunya = instanceMatrix * sfDunya;
      #endif
      vSeffafDunya = ( modelMatrix * sfDunya ).xyz;`,
    );
  shader.fragmentShader =
    `varying vec3 vSeffafDunya;
    uniform vec3 uTopMerkez;
    uniform vec3 uKameraYonu;
    uniform float uYaricap;
    uniform float uTopYaricap;
    uniform float uGuc;
    uniform float uOpaklik;\n` +
    shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `#include <opaque_fragment>
      if ( uGuc > 0.0 ) {
        vec3 sfFark = vSeffafDunya - uTopMerkez;
        float sfBoy = dot( sfFark, uKameraYonu ); // topdan kameraya doğru ne kadar önde
        float sfYan = length( sfFark - uKameraYonu * sfBoy ); // çizgiye uzaklık
        float sfIc = 1.0 - smoothstep( uYaricap * 0.55, uYaricap, sfYan );
        float sfOnde = smoothstep( uTopYaricap, uTopYaricap * 3.0, sfBoy );
        float sfUst = smoothstep( uTopMerkez.y - uTopYaricap, uTopMerkez.y + uTopYaricap, vSeffafDunya.y );
        gl_FragColor.a *= mix( 1.0, uOpaklik, uGuc * sfIc * sfOnde * sfUst );
      }`,
    );
}

// Bir engel malzemesini şeffaflaşabilir yapar (aynı malzeme ikinci kez işlenmez). Malzeme baştan "saydam" çizilir
// (yoksa pencere açılınca telefon çizicisi yeniden kurulup takılırdı); pencere kapalıyken görünüş aynıdır.
// Çift yüzlü malzeme tek geçişte çizilir (çizim sayısı artmasın).
export function seffafYap(m: Material) {
  if (isaretli.has(m)) return;
  isaretli.add(m);
  m.transparent = true;
  m.forceSinglePass = true;
  m.onBeforeCompile = ek;
  m.customProgramCacheKey = () => 'seffaf-engel';
  m.needsUpdate = true;
}

// Işının çarptığı yer ekranda var mı: zemin değil, görünür ve kesilmemiş (7. delikte modelin tribün tahtaları
// koltukların yerinde kesilir; kesilen yer çizilmez, engel sayılmaz).
function gorunurEngel(v: Intersection): boolean {
  const o = v.object as Object3D & { material?: Material };
  if (o.userData.engelDegil || !o.visible) return false;
  const m = o.material;
  const duzlemler = m && !Array.isArray(m) ? m.clippingPlanes : null;
  if (duzlemler && duzlemler.length) {
    const disarida = duzlemler.map((d) => d.distanceToPoint(v.point) < 0);
    const kesik = m!.clipIntersection ? disarida.every(Boolean) : disarida.some(Boolean);
    if (kesik) return false;
  }
  return true;
}

// Işın: toptan kameraya. Bir engele çarparsa top engelin arkasındadır. Zemin ve şeffaflaşmayanlar sayılmaz
// (userData.engelDegil). Topun hemen dibinden değil, biraz önünden başlar (üstünde durduğu yüzey sayılmasın).
const isin = new Raycaster();
const bas = new Vector3();
const vurulan: Intersection[] = [];
export function engelArkasinda(engeller: Object3D, top: Vector3, kameraYonu: Vector3, uzaklik: number, topYaricap: number): boolean {
  // İki ışın: topun ortası ve tepesi (top yarı yarıya örtülünce de pencere açılsın).
  for (const yukari of [0, topYaricap * 0.9]) {
    bas.copy(top).addScaledVector(kameraYonu, topYaricap * 1.5);
    bas.y += yukari;
    isin.set(bas, kameraYonu);
    isin.far = uzaklik;
    vurulan.length = 0;
    isin.intersectObject(engeller, true, vurulan);
    if (vurulan.some(gorunurEngel)) return true;
  }
  return false;
}
