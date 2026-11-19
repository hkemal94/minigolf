// ARKA PLAN üretimi (Kemal, 19 Kasım 2026). KKM haritasının 3B parçalarından (hkemal94/duzada-harita, parca/*.glb)
// stadın çevresini oyunun koordinatına çevirir ve tek, sıkıştırılmış dosyaya yazar: public/modeller/arka-plan.glb.
// - Saha merkezi ve yönü haritadan (parca_+10_+0-yakin, saha çizgileri: merkez 10108,21 / -197,91, 45,09°, çim 142,80 m).
//   Oyunda saha merkezi (45, 0, -29), uzun kenar +x. Çevre gerçek ölçüde; saha oyunda 90 × 58 kalır (Kemal kararı).
// - Haritadaki stadın kendisi (teras, ±62 × ±46 m) alınmaz; yerinde oyunun kendi stat modeli durur.
// - Yakın: ayrıntılı arazi, sokaklar, ağaçlar (150 m), evler ve duvarlar (100 m). Ötesi kaba parçalar (900 m'ye kadar); deniz.
// - Üç parça (zemin, yapi, bitki): her biri tek çizim. Renkler köşe renginde, uzaklık pusu dahil. Arabalar ve eşya alınmaz.
// - Arazi ve ağaçlar sadeleştirilir (meshoptimizer); dosya meshopt ile sıkıştırılır (oyun three.js'in çözücüsüyle açar).
//
// Kullanım (paketler depoya bağımlılık olarak eklenmedi; yalnız üretirken, kaydetmeden kurulur):
//   npm i --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions draco3dgltf meshoptimizer
//   node scripts/arka-plani-uret.mjs <duzada-harita klasörü> public/modeller/arka-plan.glb 150 900
import { NodeIO, Document } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { weld, simplifyPrimitive, quantize, reorder, meshopt } from '@gltf-transform/functions';
import draco3d from 'draco3dgltf';
import { MeshoptEncoder, MeshoptSimplifier } from 'meshoptimizer';
const [harita, cikti, YAKIN_R = '150', UZAK_R = '900'] = process.argv.slice(2);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({
  'draco3d.decoder': await draco3d.createDecoderModule(), 'meshopt.encoder': MeshoptEncoder });
// glTF renkleri doğrusal; köşe rengine öyle yazılır.
// Haritadaki saha: merkez, yön, çim düzeyi (parca_+10_+0-yakin 'cizgi' öğeleri). Oyunda saha merkezi (45, 0, -29), uzun kenar +x.
const HX = 10108.21, HZ = -197.91, HY = 142.80, ACI = 45.09 * Math.PI / 180;
const c = Math.cos(ACI), s = Math.sin(ACI);
const oyuna = (X, Y, Z) => { const dx = X - HX, dz = Z - HZ; return [45 + dx * c + dz * s, Y - HY, -29 - dx * s + dz * c]; };
// Haritadaki stadın terası (stad_cevre, ±62 × ±46): oyunun kendi stat modeli burada; harita oradan alınmaz.
const statta = (x, z) => Math.abs(x - 45) < 64 && Math.abs(z + 29) < 49;
const R1 = +YAKIN_R, R2 = +UZAK_R, RD = +(process.env.YAPI_R ?? 100);
const PUS = [0.80, 0.84, 0.86]; // uzaklık pusu (gök rengine yakın) -- DENEME
const pus = (r) => { const t = Math.min(1, Math.max(0, (r - 140) / (R2 - 140))); return t * t * (3 - 2 * t) * 0.85; };
const gruplar = { zemin: { p: [], col: [] }, yapi: { p: [], col: [] }, bitki: { p: [], col: [] } };
const ZEMIN_MESH = /_(arazi|yollar)(_uzak)?$/;
const ATLA = /_esya$/; // arabalar, eşya: arka planda gerek yok
function ekle(prim, grup, alanSec) {
  const pos = prim.getAttribute('POSITION'); const idx = prim.getIndices();
  const bc = prim.getMaterial()?.getBaseColorFactor() ?? [0.5, 0.5, 0.5, 1];
  const n = idx ? idx.getCount() : pos.getCount();
  for (let i = 0; i < n; i += 3) {
    const v = [0, 1, 2].map((k) => { const j = idx ? idx.getScalar(i + k) : i + k; const q = pos.getElement(j, []); return oyuna(q[0], q[1], q[2]); });
    const mx = (v[0][0] + v[1][0] + v[2][0]) / 3, mz = (v[0][2] + v[1][2] + v[2][2]) / 3;
    if (statta(mx, mz)) continue;
    const r = Math.hypot(mx - 45, mz + 29);
    if (!alanSec(r)) continue;
    for (const q of v) {
      gruplar[grup].p.push(...q);
      const rr = Math.hypot(q[0] - 45, q[2] + 29), t = pus(rr);
      gruplar[grup].col.push(...[0, 1, 2].map((k) => bc[k] * (1 - t) + PUS[k] * t));
    }
  }
}
for (const i of [9, 10, 11]) for (const j of [-1, 0, 1]) {
  const ad = `parca_${i >= 0 ? '+' : ''}${i}_${j >= 0 ? '+' : ''}${j}`;
  for (const tur of ['yakin', 'uzak']) {
    let d; try { d = await io.read(`${harita}/parca/${ad}-${tur}.glb`); } catch { continue; }
    for (const m of d.getRoot().listMeshes()) {
      if (ATLA.test(m.getName())) continue;
      const tur2 = m.getName().replace(/^parca_[^_]+_[^_]+_/, '');
      const grup = ZEMIN_MESH.test(m.getName()) ? 'zemin' : tur2 === 'bitkiler' ? 'bitki' : 'yapi';
      // Ayrıntılı (yakın) parçalar stada yakın yerde, kaba (uzak) parçalar ötesinde. Yarıçaplar DENEME.
      const yakinR = { arazi: R1, yollar: R1, bitkiler: R1, duvarlar: RD, yapilar: RD }[tur2] ?? R1;
      const uzakR = tur2 === 'yapilar_uzak' ? RD : R1;
      for (const p of m.listPrimitives()) { 
        ekle(p, grup, tur === 'yakin' ? (r) => r < yakinR : (r) => r >= uzakR && r < R2); }
    }
  }
}
// Deniz: tek düz yüzey (deniz düzeyi), pusla.
{
  const y = -HY, K = 2500, su = [0.02, 0.14, 0.32];
  const kose = [[-K, -K], [K, -K], [K, K], [-K, K]].map(([x, z]) => [45 + x, y, -29 + z]);
  for (const t of [[0, 2, 1], [0, 3, 2]]) for (const k of t) { gruplar.zemin.p.push(...kose[k]); gruplar.zemin.col.push(...su.map((v, i) => v * 0.3 + PUS[i] * 0.7)); }
}
const doc = new Document(); const buf = doc.createBuffer();
const sahne = doc.createScene('arka');
for (const [ad, g] of Object.entries(gruplar)) {
  const prim = doc.createPrimitive()
    .setAttribute('POSITION', doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.p)).setBuffer(buf))
    .setAttribute('COLOR_0', doc.createAccessor().setType('VEC3').setArray(new Float32Array(g.col)).setBuffer(buf))
    .setMaterial(doc.createMaterial(ad).setRoughnessFactor(1).setMetallicFactor(0));
  sahne.addChild(doc.createNode(ad).setMesh(doc.createMesh(ad).addPrimitive(prim)));
  console.log(ad, 'üçgen', g.p.length / 9);
}
await MeshoptEncoder.ready; await MeshoptSimplifier.ready;
await doc.transform(weld());
// Yalnız arazi sadeleşir; ev, duvar ve ağaçların biçimi bozulmasın.
for (const m of doc.getRoot().listMeshes()) if (m.getName() !== 'yapi') for (const p of m.listPrimitives()) simplifyPrimitive(p, { simplifier: MeshoptSimplifier, ratio: m.getName() === 'zemin' ? +(process.env.ORAN ?? 0.25) : 0.5, error: +(process.env.HATA ?? 0.01) });
await doc.transform(reorder({ encoder: MeshoptEncoder }), quantize(), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
for (const m of doc.getRoot().listMeshes()) console.log('sonra', m.getName(), m.listPrimitives()[0].getIndices().getCount() / 3);
await io.write(cikti, doc);
