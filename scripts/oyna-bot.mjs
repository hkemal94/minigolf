// OYNANABİLİR PROTOTİP · deneme botu. Oyunu telefon boyutunda (390 × 844), dokunmatik olarak açar ve
// gerçek parmak hareketleriyle oynar: topa dokunur, geri çeker, bırakır. Hangi yöne ne kadar çekeceğini
// oyunun kendi fizik kodunu burada çalıştırıp arayarak bulur; oyunun içine müdahale etmez (yalnız
// ?bot=1 ile açılan okuma kancasından topun yerini okur).
//
// Kullanım (Playwright ayrıca kurulu olmalı; depoya bağımlılık olarak eklenmedi):
//   npm run dev -- --port 5311          (ayrı pencerede)
//   node scripts/derle-fizik.mjs /tmp/minigolf-fizik.mjs
//   node scripts/oyna-bot.mjs http://localhost:5311/ /tmp/minigolf-fizik.mjs <görüntü klasörü>
import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const [adres = 'http://localhost:5311/', fizikYolu = '/tmp/minigolf-fizik.mjs', klasor = '/tmp/minigolf-bot'] = process.argv.slice(2);
const F = await import(pathToFileURL(fizikYolu).href);
mkdirSync(klasor, { recursive: true });
const yaz = (...a) => console.log(...a);
const hatalar = [];
const dogrula = (kosul, ne) => {
  yaz(`${kosul ? '  TAMAM' : '  HATA '} · ${ne}`);
  if (!kosul) hatalar.push(ne);
};

// ---------- Vuruş arama: oyunun fizik koduyla ----------
const hiz = (guc) => F.VURUS.enCokHiz * Math.pow(guc, F.VURUS.us);
function dene(delik, bas, aci, guc) {
  const t = F.yeniTop(bas.x, bas.y, bas.z);
  F.vur(t, Math.cos(aci), Math.sin(aci), hiz(guc));
  F.durana(t, delik.dunya, 40);
  return t;
}
// Deliğe kalan yol (küçük: iyi). Her deliğin yolu farklı.
function kalan(delik, t) {
  const c = delik.dunya.delik;
  const uzak = (x, z) => Math.hypot(t.x - x, t.z - z);
  if (t.delikte) return -1000;
  if (t.disarida) return 5000;
  if (delik.no === 3) {
    // Yakın direğin saha yanından geç, uzak direkteki köşeden dön.
    const yk = F.MODEL.yakinDirekZ;
    const uz = F.MODEL.uzakDirekZ;
    if (t.z < yk + 0.1) return (t.x < 0.12 ? 3 : 0) + uzak(0.36, yk + 0.2) + (uz - yk) + 1.5;
    if (t.x > -0.1) return Math.abs(uz - 0.45 - t.z) + 1.3 + (t.x > 0.1 ? 0 : 0.5);
    return uzak(c.x, c.z);
  }
  if (delik.no === 7) {
    const sira = [5, 4, 3].find((s) => Math.abs(t.y - delik.dunya.topYaricap - F.siraY(s)) < 0.02);
    if (sira === undefined) return 4000;
    if (sira === 3) return uzak(c.x, c.z);
    const [b0, b1] = F.koltukX(F.BOS_KOLTUK[sira]);
    return (sira - 3) * 100 + Math.abs(t.x - ((b0 + b1) / 2 + 0.6));
  }
  return uzak(c.x, c.z);
}
function ara(delik, bas) {
  const adaylar = [];
  for (let derece = 0; derece < 360; derece += 2) {
    for (let guc = 0.12; guc <= 1.0001; guc += 0.04) {
      const aci = (derece * Math.PI) / 180;
      adaylar.push({ aci, guc, puan: kalan(delik, dene(delik, bas, aci, guc)) });
    }
  }
  adaylar.sort((a, b) => a.puan - b.puan);
  // En iyilerin çevresinde ince arama; küçük sapmalarda da iyi kalanı seç (parmak kusursuz değildir).
  let enIyi = null;
  for (const a of adaylar.slice(0, 8)) {
    for (let da = -1.5; da <= 1.5; da += 0.5) {
      for (let dg = -0.03; dg <= 0.0301; dg += 0.01) {
        const aci = a.aci + (da * Math.PI) / 180;
        const guc = Math.min(1, Math.max(0.1, a.guc + dg));
        let enKotu = -Infinity;
        for (const [sa, sg] of [[0, 0], [0.3, 0], [-0.3, 0], [0, 0.012], [0, -0.012]]) {
          enKotu = Math.max(enKotu, kalan(delik, dene(delik, bas, aci + (sa * Math.PI) / 180, guc * (1 + sg))));
        }
        if (!enIyi || enKotu < enIyi.puan) enIyi = { aci, guc, puan: enKotu };
      }
    }
  }
  return { ...enIyi, beklenen: dene(delik, bas, enIyi.aci, enIyi.guc) };
}

// ---------- Tarayıcı: telefon boyutu, dokunmatik ----------
const tarayici = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const baglam = await tarayici.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
const sayfa = await baglam.newPage();
sayfa.on('pageerror', (e) => hatalar.push(`sayfa hatası: ${String(e).slice(0, 200)}`));
sayfa.on('console', (m) => m.type() === 'error' && hatalar.push(`konsol: ${m.text().slice(0, 200)}`));
const cdp = await baglam.newCDPSession(sayfa);
const dokun = (tur, noktalar) => cdp.send('Input.dispatchTouchEvent', { type: tur, touchPoints: noktalar.map((n, i) => ({ x: n[0], y: n[1], id: n[2] ?? i })) });
const bekle = (ms) => sayfa.waitForTimeout(ms);
const durum = () => sayfa.evaluate(() => window.__minigolf.durum());
const ekran = (x, y, z) => sayfa.evaluate(([a, b, c]) => window.__minigolf.ekran(a, b, c), [x, y, z]);
const goruntu = (ad) => sayfa.screenshot({ path: `${klasor}/${ad}.png` });

async function hazirOl() {
  await sayfa.waitForFunction(() => window.__minigolf && window.__minigolf.durum().hazir, null, { timeout: 90000 });
  await bekle(1200); // kamera yerine otursun
}
async function topDursun(sinir = 90000) {
  const bas = Date.now();
  for (;;) {
    const d = await durum();
    if (d.top.duruyor || d.asama !== 'oyun') return d;
    if (Date.now() - bas > sinir) throw new Error('top durmadı');
    await bekle(120);
  }
}
// Gerçek parmak hareketi: topa dokun, geri çek (adım adım), bırak. araGoruntu: çekerken ekran görüntüsü.
async function cekBirak(aci, guc, araGoruntu) {
  const d = await durum();
  const [tx, ty] = d.topEkran;
  const [gx, gy] = await ekran(d.top.x - Math.cos(aci), d.top.y, d.top.z - Math.sin(aci));
  const [ox, oy] = await ekran(d.top.x, d.top.y, d.top.z);
  const boy = Math.hypot(gx - ox, gy - oy);
  const L = F.VURUS.enCokCekme * guc;
  const sx = tx + ((gx - ox) / boy) * L;
  const sy = ty + ((gy - oy) / boy) * L;
  await dokun('touchStart', [[tx, ty]]);
  for (let i = 1; i <= 8; i++) {
    await dokun('touchMove', [[tx + ((sx - tx) * i) / 8, ty + ((sy - ty) * i) / 8]]);
    await bekle(30);
  }
  await bekle(500);
  const nisan = (await durum()).nisan;
  if (araGoruntu) await goruntu(araGoruntu);
  await dokun('touchEnd', []);
  return nisan;
}

// Bir deliği deliğe düşene kadar oynar.
async function deligiOyna(no, ad) {
  const delik = F.oyunDeligi(no);
  let sekme = 0;
  let enCokSapma = 0;
  for (let v = 1; v <= 14; v++) {
    const d = await durum();
    if (d.asama !== 'oyun') break;
    const plan = ara(delik, d.top);
    const nisan = await cekBirak(plan.aci, plan.guc, v === 1 ? `${ad}-nisan` : null);
    if (v === 1) dogrula(nisan.aktif && nisan.guc > 0, `delik ${no}: çekerken nişan oku açık (güç %${Math.round(nisan.guc * 100)})`);
    await bekle(250);
    const ara1 = await durum();
    if (v === 1) dogrula(!ara1.top.duruyor && Math.hypot(ara1.top.vx, ara1.top.vz) > 0.05, `delik ${no}: bırakınca top hareket etti`);
    if (v === 1) await goruntu(`${ad}-yolda`);
    const son = await topDursun();
    const sapma = Math.hypot(son.top.x - plan.beklenen.x, son.top.z - plan.beklenen.z);
    enCokSapma = Math.max(enCokSapma, sapma);
    sekme += son.top.carpma;
    yaz(`  vuruş ${v}: yön ${((plan.aci * 180) / Math.PI).toFixed(1)}°, güç %${Math.round(plan.guc * 100)} → top (${son.top.x.toFixed(2)}, ${son.top.y.toFixed(2)}, ${son.top.z.toFixed(2)})` +
      `, çarpma ${son.top.carpma}, beklenenden sapma ${(sapma * 100).toFixed(1)} cm${son.top.delikte ? ' · DELİKTE' : ''}`);
    if (son.asama === 'delikSonu') break;
  }
  const d = await durum();
  dogrula(d.asama === 'delikSonu' && d.top.delikte, `delik ${no}: top deliğe düştü (${d.vuruslar[d.sira]} vuruş)`);
  dogrula(sekme > 0, `delik ${no}: top kenardan ya da eşyadan sekti (${sekme} çarpma)`);
  dogrula(enCokSapma < 0.05, `delik ${no}: oyundaki sonuç hesapla aynı (en çok sapma ${(enCokSapma * 100).toFixed(1)} cm)`);
  await bekle(600);
  await goruntu(`${ad}-delik-sonu`);
  return d.vuruslar[d.sira];
}

await sayfa.goto(`${adres}?oyna=1&bot=1`);
await hazirOl();
const sonuc = {};

// ---------- 1) Açılış, ekrandaki bilgiler ----------
yaz('Açılış');
let d = await durum();
dogrula(d.no === 3 && d.sira === 0, 'ilk delik 3 (kale)');
dogrula((await sayfa.textContent('[data-deneme="delik-no"]')).includes('3'), 'delik numarası ekranda');
dogrula((await sayfa.textContent('[data-deneme="vurus"]')).trim() === '0', 'vuruş sayacı 0');
dogrula(/12[,.]5/.test(await sayfa.textContent('[data-deneme="uzaklik"]')), 'deliğe uzaklık ekranda (12,5 m)');
dogrula(await sayfa.isVisible('[data-deneme="plan"]'), 'köşede küçük plan');
dogrula(await sayfa.isVisible('[data-deneme="delik-oku"]'), 'delik ekranın dışında: ok görünüyor');
await goruntu('01-delik3-baslangic');

// ---------- 2) Kamera: iki parmak ----------
yaz('Kamera');
const orta = [195, 430];
const iki = (aralik, aci) => [
  [orta[0] - (Math.cos(aci) * aralik) / 2, orta[1] - (Math.sin(aci) * aralik) / 2, 0],
  [orta[0] + (Math.cos(aci) * aralik) / 2, orta[1] + (Math.sin(aci) * aralik) / 2, 1],
];
// İki parmağı birbirine yaklaştır: uzaklaşır.
await dokun('touchStart', iki(240, 0));
for (let i = 1; i <= 10; i++) { await dokun('touchMove', iki(240 - i * 16, 0)); await bekle(25); }
await dokun('touchEnd', []);
await bekle(900);
let d2 = await durum();
dogrula(d2.yakinlik < d.yakinlik * 0.5, `iki parmak kapanınca uzaklaştı (${d.yakinlik} → ${d2.yakinlik.toFixed(0)})`);
await goruntu('02-uzaklasmis');
// İki parmağı çevir: kamera döner; parmağın altındaki yer parmakla birlikte döner.
const iz = [d2.top.x + 0.5, d2.top.y, d2.top.z + 1.5];
const once = await ekran(...iz);
await dokun('touchStart', iki(200, 0));
for (let i = 1; i <= 10; i++) { await dokun('touchMove', iki(200, (i * 4 * Math.PI) / 180)); await bekle(25); }
await dokun('touchEnd', []);
await bekle(900);
const d3 = await durum();
const sonra = await ekran(...iz);
const donme = ((d3.aci - d2.aci) * 180) / Math.PI;
dogrula(Math.abs(Math.abs(donme) - 40) < 1, `iki parmak çevrilince kamera döndü (${donme.toFixed(1)}°)`);
const [tex, tey] = d3.topEkran;
const a0 = Math.atan2(once[1] - d2.topEkran[1], once[0] - d2.topEkran[0]);
const a1 = Math.atan2(sonra[1] - tey, sonra[0] - tex);
const yerDonme = ((a1 - a0) * 180) / Math.PI;
dogrula(yerDonme > 30 && yerDonme < 50, `yer parmaklarla aynı yöne döndü (ekranda ${yerDonme.toFixed(1)}°; parmaklar +40°)`);
await goruntu('03-cevrilmis');
// Tek parmak boş yerde: kamera döner, vuruş olmaz.
await dokun('touchStart', [[60, 300]]);
for (let i = 1; i <= 8; i++) { await dokun('touchMove', [[60 + i * 12, 300]]); await bekle(25); }
await dokun('touchEnd', []);
await bekle(400);
const d4 = await durum();
dogrula(Math.abs(d4.aci - d3.aci) > 0.1 && d4.vuruslar[0] === 0 && d4.top.duruyor, `tek parmak boş yerde: kamera döndü (${(((d4.aci - d3.aci) * 180) / Math.PI).toFixed(1)}°), vuruş sayılmadı`);
// Topa dokunup çok az çekmek: iptal.
await dokun('touchStart', [d4.topEkran]);
await dokun('touchMove', [[d4.topEkran[0] + 4, d4.topEkran[1] + 5]]);
await dokun('touchEnd', []);
await bekle(300);
dogrula((await durum()).vuruslar[0] === 0, 'topa dokunup çok az çekince vuruş olmadı (iptal)');
// İki parmakla yeniden yaklaş (oyunun yakınlığına yakın).
await dokun('touchStart', iki(80, 0));
for (let i = 1; i <= 10; i++) { await dokun('touchMove', iki(80 + i * 22, 0)); await bekle(25); }
await dokun('touchEnd', []);
await bekle(700);
dogrula((await durum()).yakinlik > d4.yakinlik * 2, 'iki parmak açılınca yaklaştı');

// ---------- 3) Güç sınırı ----------
// Çok uzun çekme (300 piksel) gücü %100'de tutar.
d = await durum();
await dokun('touchStart', [d.topEkran]);
await dokun('touchMove', [[d.topEkran[0], d.topEkran[1] + 120]]);
await bekle(300);
await dokun('touchMove', [[d.topEkran[0], d.topEkran[1] + 300]]);
await bekle(700);
const sinirda = (await durum()).nisan;
dogrula(sinirda.aktif && sinirda.guc === 1, `güç sınırı: 300 piksel çekince güç %${Math.round(sinirda.guc * 100)}, daha fazla değil`);
// İkinci parmak gelince vuruş iptal olur (yanlışlıkla atış olmasın).
await dokun('touchStart', [[d.topEkran[0], d.topEkran[1] + 300, 0], [100, 200, 1]]);
await bekle(500);
const iptal = (await durum()).nisan;
await dokun('touchEnd', []);
await bekle(500);
dogrula(!iptal.aktif && (await durum()).vuruslar[0] === 0, 'çekerken ikinci parmak gelince vuruş iptal');
await sayfa.click('[data-deneme="delik-yeniden"]');
await bekle(1200);

// ---------- 4) Üç delik: deliğe düşene kadar ----------
yaz('Delik 3 · kale');
sonuc[3] = await deligiOyna(3, '10-delik3');
await sayfa.tap('[data-deneme="sonraki"]');
await bekle(1500);
yaz('Delik 1 · orta yuvarlak');
dogrula((await durum()).no === 1, '"sonraki delik" ikinci deliği açtı (1)');
await goruntu('20-delik1-baslangic');
sonuc[1] = await deligiOyna(1, '20-delik1');
await sayfa.tap('[data-deneme="sonraki"]');
await bekle(1500);

yaz('Delik 7 · tribün: önce dışarı çıkma');
d = await durum();
dogrula(d.no === 7, '"sonraki delik" üçüncü deliği açtı (7)');
await goruntu('30-delik7-baslangic');
// Tam güçle oluk boyunca: top köşeden dönüp koltukların üstünden aşar, dışarı çıkar.
const delik7 = F.oyunDeligi(7);
const disari = dene(delik7, d.top, Math.PI, 1);
yaz(`  hesap: tam güçte top ${disari.disarida ? 'dışarı çıkıyor' : 'içeride kalıyor'}`);
await cekBirak(Math.PI, 1, null);
await sayfa.waitForSelector('[data-deneme="disari"]', { timeout: 60000 });
await goruntu('31-delik7-disari');
const d5 = await durum();
dogrula(disari.disarida, 'hesapta top dışarı çıktı');
dogrula(Math.hypot(d5.top.x - d.top.x, d5.top.z - d.top.z) < 1e-6 && Math.abs(d5.top.y - d.top.y) < 1e-6 && d5.top.duruyor, 'dışarı çıkan top vuruştan önceki yerine döndü');
dogrula(d5.vuruslar[2] === 1 + F.KURAL.disariCeza, `dışarı çıkan vuruş sayıldı (sayaç ${d5.vuruslar[2]})`);
await bekle(3000);
yaz('Delik 7 · tribün: deliğe');
sonuc[7] = (await deligiOyna(7, '30-delik7'));
await sayfa.tap('[data-deneme="sonraki"]');
await bekle(800);

// ---------- 5) Tur sonu ----------
yaz('Tur sonu');
d = await durum();
dogrula(d.asama === 'turSonu', 'son delikten sonra sonuç kartı açıldı');
const toplam = Number((await sayfa.textContent('[data-deneme="toplam"]')).trim());
dogrula(toplam === d.vuruslar.reduce((a, b) => a + b, 0), `kartta delik delik vuruşlar ve toplam (${d.vuruslar.join(' + ')} = ${toplam})`);
await goruntu('40-tur-sonu');
yaz(`Çizim yükü (son kare): ${d.cizim.cagri} çizim çağrısı, ${d.cizim.ucgen} üçgen`);

yaz('');
yaz(`Vuruşlar: delik 3 → ${sonuc[3]}, delik 1 → ${sonuc[1]}, delik 7 → ${sonuc[7]} (ilki dışarı çıkan vuruş)`);
yaz(hatalar.length ? `HATA: ${hatalar.length}\n- ${hatalar.join('\n- ')}` : 'Hepsi tamam.');
await tarayici.close();
process.exit(hatalar.length ? 1 : 0);
