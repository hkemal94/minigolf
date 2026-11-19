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
// Delik de (Kemal, 19 Kasım 2026: "aynısı delik için de olsun"): delik ve bayrağı bir engelin arkasında kalınca
// deliğin çevresinde ikinci bir pencere açılır; ikisi aynı anda açık olabilir. Aynı saydamlık, süre, pencere boyu.

// Bütün engel malzemelerinin paylaştığı değerler (her karede yalnız sayılar değişir; malzeme kopyalanmaz).
export const seffafDegerler = {
  uTopMerkez: { value: new Vector3(0, -1000, 0) },
  uKameraYonu: { value: new Vector3(0, 1, 0) }, // topdan kameraya (birim)
  uYaricap: { value: 1 }, // pencerenin yarıçapı (m)
  uTopYaricap: { value: 0.02 },
  uGuc: { value: 0 }, // 0: pencere kapalı, 1: tam açık
  // Deliğin penceresi: merkezi (delik ve bayrağın ortası), "önünde" sayılma payı, delik ağzının yüksekliği, gücü.
  uDelikMerkez: { value: new Vector3(0, -1000, 0) },
  uDelikPay: { value: 0.05 },
  uDelikTaban: { value: -1000 },
  uDelikGuc: { value: 0 },
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
    uniform float uOpaklik;
    uniform vec3 uDelikMerkez;
    uniform float uDelikPay;
    uniform float uDelikTaban;
    uniform float uDelikGuc;
    // Bir pencere: merkezden kameraya giden çizginin çevresinde, merkezin önünde ve taban yüksekliğinin üstünde kalan yüzey.
    float sfPencere( vec3 merkez, float pay, float taban ) {
      vec3 sfFark = vSeffafDunya - merkez;
      float sfBoy = dot( sfFark, uKameraYonu ); // merkezden kameraya doğru ne kadar önde
      float sfYan = length( sfFark - uKameraYonu * sfBoy ); // çizgiye uzaklık
      float sfIc = 1.0 - smoothstep( uYaricap * 0.55, uYaricap, sfYan );
      float sfOnde = smoothstep( pay, pay * 3.0, sfBoy );
      float sfUst = smoothstep( taban - pay, taban + pay, vSeffafDunya.y );
      return sfIc * sfOnde * sfUst;
    }\n` +
    shader.fragmentShader.replace(
      '#include <opaque_fragment>',
      `#include <opaque_fragment>
      if ( uGuc > 0.0 || uDelikGuc > 0.0 ) {
        float sfTop = uGuc > 0.0 ? uGuc * sfPencere( uTopMerkez, uTopYaricap, uTopMerkez.y ) : 0.0;
        // Deliğin penceresi delik ağzından yukarısı (bayrak dahil).
        float sfDelik = uDelikGuc > 0.0 ? uDelikGuc * sfPencere( uDelikMerkez, uDelikPay, uDelikTaban ) : 0.0;
        gl_FragColor.a *= mix( 1.0, uOpaklik, max( sfTop, sfDelik ) );
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
// yukarilar: ışınların başladığı yükseklikler (merkeze göre). Top için ortası ve tepesi; delik için ağzı ve bayrağın ucu.
export function engelArkasinda(engeller: Object3D, top: Vector3, kameraYonu: Vector3, uzaklik: number, topYaricap: number, yukarilar: number[] = [0, topYaricap * 0.9]): boolean {
  // Top için iki ışın: topun ortası ve tepesi (top yarı yarıya örtülünce de pencere açılsın).
  for (const yukari of yukarilar) {
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
