// OYNANABİLİR PROTOTİP · deneme botu. Oyunu telefon boyutunda (390 × 844), dokunmatik olarak açar ve
// gerçek parmak hareketleriyle oynar: topa dokunur, geri çeker, bırakır. Hangi yöne ne kadar çekeceğini
// oyunun kendi fizik kodunu burada çalıştırıp arayarak bulur; oyunun içine müdahale etmez (yalnız
// ?bot=1 ile açılan okuma kancasından topun yerini okur).
//
// Kullanım (Playwright ayrıca kurulu olmalı; depoya bağımlılık olarak eklenmedi):
//   npm run dev -- --port 5311          (ayrı pencerede)
//   node scripts/derle-fizik.mjs /tmp/minigolf-fizik.mjs
//   node scripts/oyna-bot.mjs http://localhost:5311/ /tmp/minigolf-fizik.mjs <görüntü klasörü> [kalite=yuksek]
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

// Dördüncü değer (isteğe bağlı): adrese eklenecek deneme ayarı, ör. kalite=yuksek (gölgeler ve ortam hep tam).
const [adres = 'http://localhost:5311/', fizikYolu = '/tmp/minigolf-fizik.mjs', klasor = '/tmp/minigolf-bot', ek = ''] = process.argv.slice(2);
const F = await import(pathToFileURL(fizikYolu).href);
mkdirSync(klasor, { recursive: true });
const yaz = (...a) => console.log(...a);
const hatalar = [];
const dogrula = (kosul, ne) => {
  yaz(`${kosul ? '  TAMAM' : '  HATA '} · ${ne}`);
  if (!kosul) hatalar.push(ne);
};

// ---------- Vuruş arama: oyunun fizik koduyla ----------
const hiz = (guc) => F.vurusHizi(guc);
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
      adaylar.push({ aci, guc, puan: kalan(delik, dene(delik, bas, aci, guc)) + guc * 0.01 });
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
        enKotu += guc * 0.01; // eşit iyilikte daha az güç (tarifteki yol)
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
const aciFarki = (a, b) => { let f = (a - b) % (2 * Math.PI); if (f > Math.PI) f -= 2 * Math.PI; if (f < -Math.PI) f += 2 * Math.PI; return f; };
const derece = (r) => (r * 180) / Math.PI;
// Tek parmakla boş yerde sürükleme (adım adım).
async function surukle(x0, y0, dx, dy, adim = 12) {
  await dokun('touchStart', [[x0, y0]]);
  for (let i = 1; i <= adim; i++) { await dokun('touchMove', [[x0 + (dx * i) / adim, y0 + (dy * i) / adim]]); await bekle(20); }
  await dokun('touchEnd', []);
  await bekle(250);
}

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
  // Ekran yavaşken son parmak hareketi geç işlenebilir: nişan istenen güce gelene ve tahmin ona göre hesaplanana kadar bekle.
  let once = await durum();
  for (let i = 0; i < 60; i++) {
    once = await durum();
    const tamam = Math.abs(once.nisan.guc - Math.min(1, guc)) < 0.02 && (!once.kolay || (once.tahmin && once.tahmin.guc === once.nisan.guc));
    if (tamam && i >= 4) break;
    await bekle(100);
  }
  if (araGoruntu) await goruntu(araGoruntu);
  await dokun('touchEnd', []);
  return { ...once.nisan, tahmin: once.tahmin, tahminGorunur: once.tahminGorunur };
}

const tahminSapmalari = [];
const takipDonmeleri = [];
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
    if (v === 1) dogrula(nisan.tahminGorunur && nisan.tahmin, `delik ${no}: kolay modda topun duracağı yer gösterildi`);
    // Takip: top yoldayken kamera topu izler; top ekranda kalır, kamera topun gittiği yöne döner.
    const ornekler = [];
    for (let i = 0; i < 40; i++) {
      const o = await durum();
      ornekler.push(o);
      if (o.top.duruyor || o.asama !== 'oyun') break;
      if (i === 2 && v === 1) await goruntu(`${ad}-yolda`);
      await bekle(90);
    }
    const yolda = ornekler.filter((o) => !o.top.duruyor && o.asama === 'oyun');
    if (v === 1 && yolda.length > 0) {
      const ilk = yolda[0];
      dogrula(!ilk.top.duruyor && Math.hypot(ilk.top.vx, ilk.top.vz) > 0.05, `delik ${no}: bırakınca top hareket etti`);
      dogrula(yolda.every((o) => o.takip), `delik ${no}: top yoldayken kamera izliyor (${yolda.length} örnek)`);
      const ekrandaDegil = yolda.filter((o) => o.topEkran[0] < 0 || o.topEkran[0] > 390 || o.topEkran[1] < 0 || o.topEkran[1] > 844);
      dogrula(ekrandaDegil.length === 0, `delik ${no}: top yoldayken hep ekranda`);
    }
    // Kamera topun gittiği yöne dönüyor mu: aynı doğru parçasında (çarpma yokken) kamera ile topun yönü arasındaki açı azalır.
    const fark = (o) => Math.abs(aciFarki(Math.atan2(o.top.vz, o.top.vx), o.aci));
    for (let i = 0; i + 1 < yolda.length; i++) {
      const [a, b] = [yolda[i], yolda[i + 1]];
      if (a.top.carpma === b.top.carpma && Math.hypot(b.top.vx, b.top.vz) > 0.3 && fark(a) > 0.05) takipDonmeleri.push([no, fark(a), fark(b)]);
    }
    const son = await topDursun();
    if (son.asama === 'oyun') dogrula(!son.takip, `delik ${no}: top durunca izleme bitti`);
    if (nisan.tahmin) {
      const t = nisan.tahmin;
      const tSapma = son.top.delikte || t.delikte ? (son.top.delikte === t.delikte ? 0 : 1) : Math.hypot(son.top.x - t.x, son.top.z - t.z);
      tahminSapmalari.push(tSapma);
    }
    const sapma = Math.hypot(son.top.x - plan.beklenen.x, son.top.z - plan.beklenen.z);
    enCokSapma = Math.max(enCokSapma, sapma);
    sekme += son.top.carpma;
    yaz(`  vuruş ${v}: yön ${((plan.aci * 180) / Math.PI).toFixed(1)}°, güç %${Math.round(plan.guc * 100)} → top (${son.top.x.toFixed(2)}, ${son.top.y.toFixed(2)}, ${son.top.z.toFixed(2)})` +
      `, çarpma ${son.top.carpma}, beklenenden sapma ${(sapma * 100).toFixed(1)} cm${son.top.delikte ? ' · DELİKTE' : ''}`);
    if (son.top.delikte || son.asama === 'delikSonu') break;
  }
  // Kutlama (Kemal, 19 Kasım): top düşünce bayrak delikten kalkar, dalgalanır; kart ondan sonra açılır.
  const dusus = Date.now();
  let kalkis = 0;
  let kutlamaGoruldu = false;
  let cekildi = false;
  for (let i = 0; i < 80; i++) {
    const k = await durum();
    if (k.asama === 'kutlama') kutlamaGoruldu = true;
    kalkis = Math.max(kalkis, k.bayrakKalkis);
    if (k.asama === 'kutlama' && !cekildi && k.kutlama > 0.15) {
      cekildi = true;
      await goruntu(`${ad}-kutlama`);
    }
    if (k.asama === 'delikSonu') break;
    await bekle(60);
  }
  const d = await durum();
  dogrula(kutlamaGoruldu && kalkis > F.KUTLAMA.kalkis * 0.5, `delik ${no}: kutlama: bayrak delikten kalktı (${(kalkis * 100).toFixed(0)} cm), kart ${((Date.now() - dusus) / 1000).toFixed(1)} sn sonra açıldı`);
  {
    const vurus = d.vuruslar[d.sira];
    const par = F.parDegeri(no);
    const yildiz = Number(await sayfa.getAttribute('[data-deneme="delik-sonu"] [data-deneme="yildiz"]', 'data-adet'));
    dogrula((await sayfa.textContent('[data-deneme="delik-par"]')).includes(String(par)), `delik ${no}: delik sonunda par ${par} yazıyor`);
    dogrula(yildiz === F.yildizSayisi(no, vurus) && yildiz >= 1 && yildiz <= F.PUAN.yildizSayisi, `delik ${no}: ${vurus} vuruş, par ${par} → ${yildiz} yıldız`);
  }
  dogrula(d.asama === 'delikSonu' && d.top.delikte, `delik ${no}: top deliğe düştü (${d.vuruslar[d.sira]} vuruş)`);
  dogrula(sekme > 0, `delik ${no}: top kenardan ya da eşyadan sekti (${sekme} çarpma)`);
  dogrula(enCokSapma < 0.05, `delik ${no}: oyundaki sonuç hesapla aynı (en çok sapma ${(enCokSapma * 100).toFixed(1)} cm)`);
  const tEnCok = Math.max(...tahminSapmalari);
  dogrula(tahminSapmalari.length > 0 && tEnCok < 0.02, `delik ${no}: kolay moddaki tahmin topun durduğu yerle aynı (${tahminSapmalari.length} vuruş, en çok sapma ${(tEnCok * 100).toFixed(2)} cm)`);
  tahminSapmalari.length = 0;
  await bekle(600);
  await goruntu(`${ad}-delik-sonu`);
  return d.vuruslar[d.sira];
}

await sayfa.goto(`${adres}?oyna=1&bot=1${ek ? `&${ek}` : ''}`);
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
dogrula((await sayfa.locator('[data-deneme="guc-centik"]').count()) === 3, 'güç çubuğunda üç çentik (%25, %50, %75)');
dogrula(await sayfa.isVisible('[data-deneme="delige-bak"]'), '"Deliğe bak" düğmesi ekranda');
dogrula((await sayfa.textContent('[data-deneme="par"]')).includes(String(F.parDegeri(3))), `par ekranda (${F.parDegeri(3)}; DENEME)`);
// Ortam (Kemal, 19 Kasım): kuşlar ve uzakta birkaç kişi; kalite düşükse azalır. Hiçbiri pistin içinde değil.
{
  const o = d.ortam;
  const dusuk = !d.cizim.golge;
  dogrula(o.kus === (dusuk ? F.ORTAM.dusukKus : F.ORTAM.kusSayisi) && o.insan === (dusuk ? F.ORTAM.dusukInsan : F.ORTAM.insanlar.length), `ortam: ${o.kus} kuş, ${o.insan} insan (${dusuk ? 'düşük kalite: azaltılmış' : 'tam'})`);
  const pay = 2;
  const uclar = F.ORTAM.insanlar.flatMap((k) => (k.x2 === undefined ? [[k.x, k.z]] : Array.from({ length: 41 }, (_, i) => [k.x + ((k.x2 - k.x) * i) / 40, k.z + ((k.z2 - k.z) * i) / 40])));
  const icinde = [3, 1, 7].filter((n) => { const c = F.oyunDeligi(n).cerceve; return uclar.some(([x, z]) => x > c.x0 - pay && x < c.x1 + pay && z > c.z0 - pay && z < c.z1 + pay); });
  dogrula(icinde.length === 0, `ortam: insanlar pistlerin en az ${pay} m dışında`);
}
await goruntu('01-delik3-baslangic');
// Ayar menüsü: kolay mod başta açık (DENEME).
await sayfa.tap('[data-deneme="ayarlar"]');
await bekle(300);
dogrula(await sayfa.isVisible('[data-deneme="ayar-menusu"]'), 'ayar menüsü açıldı');
dogrula(await sayfa.isChecked('[data-deneme="kolay-mod"]'), 'kolay mod başta açık');
await goruntu('07-ayarlar');
await sayfa.tap('[data-deneme="ayarlar"]');
await bekle(300);

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
// Tek parmak boş yerde, sağa sola: topun çevresinde tam tur (360°), vuruş olmaz.
const turPiksel = (2 * Math.PI) / F.KAMERA.cevirHizi; // bir tam tur için sürükleme
const tur0 = await durum();
const topEkran0 = tur0.topEkran;
const delikEkran0 = await ekran(F.oyunDeligi(3).dunya.delik.x, 0, F.oyunDeligi(3).dunya.delik.z);
await surukle(40, 260, turPiksel / 2, 0);
const yarim = await durum();
dogrula(Math.abs(Math.abs(yarim.aci - tur0.aci) - Math.PI) < 0.02, `tek parmak sağa: kamera ${derece(Math.abs(yarim.aci - tur0.aci)).toFixed(1)}° döndü (180°'de durmuyor)`);
await goruntu('04-cevrilmis-180');
await surukle(40, 260, turPiksel / 2, 0);
const tam = await durum();
const delikEkran1 = await ekran(F.oyunDeligi(3).dunya.delik.x, 0, F.oyunDeligi(3).dunya.delik.z);
dogrula(Math.abs(Math.abs(tam.aci - tur0.aci) - 2 * Math.PI) < 0.02, `tek parmak: tam tur (${derece(Math.abs(tam.aci - tur0.aci)).toFixed(1)}°)`);
dogrula(Math.hypot(delikEkran1[0] - delikEkran0[0], delikEkran1[1] - delikEkran0[1]) < 3 && Math.hypot(tam.topEkran[0] - topEkran0[0], tam.topEkran[1] - topEkran0[1]) < 3, 'tam turdan sonra görüntü başa döndü');
const d4 = tam;
dogrula(d4.vuruslar[0] === 0 && d4.top.duruyor, 'çevirirken vuruş sayılmadı');
// Ters yöne çevirme de sınırsız.
await surukle(350, 260, -turPiksel / 2, 0);
dogrula(Math.abs(Math.abs((await durum()).aci - tam.aci) - Math.PI) < 0.02, 'tek parmak sola: ters yöne de döndü');
await surukle(350, 260, -turPiksel / 2, 0);
// Eğme: aşağı sürükle daha tepeden, yukarı sürükle daha yandan; sınırlarda durur.
const egim0 = (await durum()).egim;
await surukle(200, 180, 0, 60);
const egimA = (await durum()).egim;
dogrula(egimA > egim0 + 0.2, `aşağı sürükleyince kamera daha tepeden baktı (${derece(egim0).toFixed(0)}° → ${derece(egimA).toFixed(0)}°)`);
await surukle(200, 120, 0, 300);
const egimUst = (await durum()).egim;
dogrula(Math.abs(egimUst - F.KAMERA.enCokEgim) < 1e-6, `eğme üst sınırda durdu (${derece(egimUst).toFixed(0)}°, tam tepeden değil)`);
await bekle(400);
await goruntu('05-tepeden');
await surukle(80, 700, 0, -400); // topun uzağından (top ekranda ortanın biraz altında)
const egimAlt = (await durum()).egim;
dogrula(Math.abs(egimAlt - F.KAMERA.enAzEgim) < 1e-6, `eğme alt sınırda durdu (${derece(egimAlt).toFixed(0)}°, yerin altına inmez)`);
await bekle(400);
await goruntu('06-yandan');
// Başlangıçtaki eğime dön (bir sürükleme).
await surukle(200, 180, 0, (egim0 - egimAlt) / F.KAMERA.egimHizi);
dogrula(Math.abs((await durum()).egim - egim0) < 0.01, 'eğim başlangıca döndü');
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

// Deliğe bak: kamera topun arkasına döner, delik topun tam önünde (ekranda topun üstünde).
await surukle(40, 260, 140, 0); // önce kamerayı yana çevir
await sayfa.tap('[data-deneme="delige-bak"]');
await bekle(1500);
{
  const b = await durum();
  const c = F.oyunDeligi(3).dunya.delik;
  const [hx, hy] = await ekran(c.x, c.y, c.z);
  dogrula(Math.abs(aciFarki(b.aci, b.delikYonu)) < 0.01, `"Deliğe bak": kamera deliğe döndü (fark ${derece(Math.abs(aciFarki(b.aci, b.delikYonu))).toFixed(2)}°)`);
  dogrula(Math.abs(hx - b.topEkran[0]) < 3 && hy < b.topEkran[1], `"Deliğe bak": delik ekranda topun tam önünde (yatay fark ${Math.abs(hx - b.topEkran[0]).toFixed(1)} px)`);
  await goruntu('08-delige-bak');
}

// Kolay mod kapalıyken işaret çıkmaz.
await sayfa.tap('[data-deneme="ayarlar"]');
await bekle(200);
await sayfa.locator('.oy-ayar-satir').tap();
await bekle(200);
dogrula(!(await sayfa.isChecked('[data-deneme="kolay-mod"]')), 'kolay mod kapatıldı');
await sayfa.tap('[data-deneme="ayarlar"]');
await bekle(200);
{
  const b = await durum();
  await dokun('touchStart', [b.topEkran]);
  await dokun('touchMove', [[b.topEkran[0], b.topEkran[1] + 60]]);
  await bekle(400);
  const k = await durum();
  dogrula(k.nisan.aktif && k.nisan.guc > 0 && !k.tahminGorunur, 'kolay mod kapalıyken çekerken işaret yok');
  await dokun('touchStart', [[b.topEkran[0], b.topEkran[1] + 60, 0], [100, 200, 1]]); // ikinci parmak: iptal
  await bekle(300);
  await dokun('touchEnd', []);
  await bekle(300);
}
await sayfa.tap('[data-deneme="ayarlar"]');
await bekle(200);
await sayfa.locator('.oy-ayar-satir').tap();
await bekle(200);
dogrula(await sayfa.isChecked('[data-deneme="kolay-mod"]'), 'kolay mod yeniden açıldı');
await sayfa.tap('[data-deneme="ayarlar"]');
await bekle(300);

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

// ---------- Kolay mod görüntüsü: orta güçte nişan, halka ekranda (vuruş yok, ikinci parmakla iptal) ----------
{
  // Halka ekrana sığsın diye önce iki parmakla biraz uzaklaş.
  await dokun('touchStart', iki(240, 0));
  for (let i = 1; i <= 8; i++) { await dokun('touchMove', iki(240 - i * 15, 0)); await bekle(25); }
  await dokun('touchEnd', []);
  await bekle(900);
  const b = await durum();
  const [tx, ty] = b.topEkran;
  await dokun('touchStart', [[tx, ty]]);
  for (let i = 1; i <= 6; i++) { await dokun('touchMove', [[tx + i * 2, ty + i * 7]]); await bekle(30); }
  await bekle(500);
  const k = await durum();
  dogrula(k.tahminGorunur && k.tahmin && !k.tahmin.disarida, `kolay mod: %${Math.round(k.nisan.guc * 100)} güçte halka ekranda`);
  await goruntu('09-kolay-mod');
  await dokun('touchStart', [[tx + 12, ty + 42, 0], [100, 200, 1]]);
  await bekle(300);
  await dokun('touchEnd', []);
  await bekle(400);
  dogrula((await durum()).vuruslar[0] === 0, 'iptal edilen nişan vuruş sayılmadı');
  await sayfa.click('[data-deneme="delik-yeniden"]');
  await bekle(1200);
}

// ---------- 4) Üç delik: deliğe düşene kadar ----------
yaz('Delik 3 · kale');
// Güç: en uzun delikte tarifteki yol (yakın direği sıyırıp köşeden dönen) gücün %60–70'iyle deliğe girer (hesap).
{
  const delik3 = F.oyunDeligi(3);
  const b = { x: delik3.baslangic[0], y: delik3.baslangic[1], z: delik3.baslangic[2] };
  const gucler = [];
  for (let der = 85; der <= 92; der += 0.25) for (let g = 0.4; g <= 1.0001; g += 0.01) if (dene(delik3, b, (der * Math.PI) / 180, g).delikte) gucler.push(g);
  const [g0, g1] = [Math.min(...gucler), Math.max(...gucler)];
  yaz(`  hesap: tarifteki yolla tek vuruşta deliğe giren güç %${Math.round(g0 * 100)}–%${Math.round(g1 * 100)}`);
  dogrula(gucler.length > 0 && g0 >= 0.55 && g1 <= 0.75, 'delik 3: tarifteki yol gücün yaklaşık %60–70\'iyle deliğe giriyor');
}
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
const disariYazi = await (await sayfa.waitForFunction(() => document.querySelector('[data-deneme="disari"]')?.textContent, null, { timeout: 60000, polling: 50 })).jsonValue();
const gb = Date.now();
// Hızlı yol (uyarı birkaç saniye görünür; yavaş ekranda olağan görüntü yetişmeyebilir).
{
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
  writeFileSync(`${klasor}/31-delik7-disari.png`, Buffer.from(data, 'base64'));
}
yaz(`  (görüntü ${Date.now() - gb} ms; uyarı ${(await sayfa.isVisible('[data-deneme="disari"]')) ? 'hâlâ ekranda' : 'kapanmış'})`);
const d5 = await durum();
dogrula(disari.disarida, 'hesapta top dışarı çıktı');
dogrula(Math.hypot(d5.top.x - d.top.x, d5.top.z - d.top.z) < 1e-6 && Math.abs(d5.top.y - d.top.y) < 1e-6 && d5.top.duruyor, 'dışarı çıkan top vuruştan önceki yerine döndü');
dogrula(F.KURAL.disariCeza === 1 && d5.vuruslar[2] === 2, `dışarı çıkan vuruş: sayaç 2 arttı (vuruş + 1 ceza; sayaç ${d5.vuruslar[2]})`);
dogrula(disariYazi.includes('+1'), `uyarıda +1 ceza vuruşu yazıyor ("${disariYazi}")`);
await bekle(4000);
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
// Par, yıldız ve rozetler listede (değerler DENEME).
{
  const satirlar = await sayfa.$$eval('[data-deneme="liste-satir"]', (l) => l.map((s) => ({ rozet: [...s.querySelectorAll('[data-rozet]')].map((r) => r.getAttribute('data-rozet')), yildiz: Number(s.querySelector('[data-deneme="yildiz"]').getAttribute('data-adet')) })));
  const beklenen = F.OYUN_SIRASI.map((n, i) => ({ rozet: F.rozetler(n, d.vuruslar[i], d.cezalar[i]), yildiz: F.yildizSayisi(n, d.vuruslar[i]) }));
  dogrula(JSON.stringify(satirlar) === JSON.stringify(beklenen), `listede yıldız ve rozetler: ${satirlar.map((s, i) => `delik ${F.OYUN_SIRASI[i]}: ${s.yildiz} yıldız [${s.rozet.join(', ') || 'rozet yok'}]`).join(' · ')}`);
  dogrula(d.cezalar.join() === '0,0,1' && !satirlar[2].rozet.includes('cezasiz') && satirlar[0].rozet.includes('cezasiz'), 'cezalı delikte "cezasız" rozeti yok, cezasız delikte var');
  const ty = await sayfa.textContent('[data-deneme="toplam-yildiz"]');
  dogrula(ty.includes(String(beklenen.reduce((a, b) => a + b.yildiz, 0))), `toplam yıldız listede (${ty.trim()})`);
  dogrula(await sayfa.isVisible('[data-deneme="rozet-aciklama"]'), 'rozet açıklaması listede');
}
await goruntu('40-tur-sonu');
yaz(`Çizim yükü (son kare): ${d.cizim.cagri} çizim çağrısı, ${d.cizim.ucgen} üçgen; ortam ${d.ortam.kus} kuş, ${d.ortam.insan} insan`);
{
  const yaklasan = takipDonmeleri.filter(([, a, b]) => b < a).length;
  dogrula(takipDonmeleri.length > 0 && yaklasan === takipDonmeleri.length, `takip: top düz giderken kamera hep topun gittiği yöne döndü (${yaklasan}/${takipDonmeleri.length} ölçüm; delikler ${[...new Set(takipDonmeleri.map(([n]) => n))].join(', ')})`);
}

yaz('');
yaz(`Vuruşlar: delik 3 → ${sonuc[3]}, delik 1 → ${sonuc[1]}, delik 7 → ${sonuc[7]} (ilki dışarı çıkan vuruş)`);
yaz(hatalar.length ? `HATA: ${hatalar.length}\n- ${hatalar.join('\n- ')}` : 'Hepsi tamam.');
await tarayici.close();
process.exit(hatalar.length ? 1 : 0);
