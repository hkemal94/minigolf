import { FIZIK } from './ayarlar';

// OYNANABİLİR PROTOTİP · fizik. Tek bir top için yazılmış küçük bir çözücü (hazır kütüphane değil;
// neden: tasarım belgesi 6.4). Ekrandan bağımsızdır: aynı kod oyunda ve denemede (scripts/) çalışır,
// aynı vuruş her seferinde aynı sonucu verir.
//
// Dünya: düşey eksende dönebilen kutular (zemin, basamak, bordür, direk, koltuk, ağ) ve bir delik.
// Top gerçek bir küredir: her adımda yerçekimi eklenir, top ilerler, değdiği her kutudan dışarı itilir;
// değme yönündeki hız seker (kutunun sekme katsayısı), yana doğru hız sürtünmeyle azalır. Zemindeki
// sürtünme yuvarlanma direncidir (yavaşlama = sürtünme × yerçekimi). Delik gerçek bir oyuktur: top
// kenarın üstünden döner, hızlıysa karşı kenara çarpıp atlar, yavaşsa içine düşer.

export type Kutu = {
  cx: number; // merkez (x, z)
  cz: number;
  hx: number; // yarı ölçüler (kutunun kendi ekseninde)
  hz: number;
  cos: number; // kutunun x ekseninin dünyadaki yönü
  sin: number;
  y0: number; // alt, üst
  y1: number;
  sekme: number; // değme yönünde kalan hızın oranı
  surtunme: number; // değme yüzeyinde sürtünme katsayısı
  delikli?: boolean; // üst yüzünde delik var
  kap: number; // kaba eleme için yarıçap
};

export type Delik = { x: number; y: number; z: number; yaricap: number; derinlik: number };

export type Dunya = {
  kutular: Kutu[];
  delik: Delik;
  topYaricap: number;
  // Topun oyun alanında olup olmadığı (uçuşta da bakılır).
  icerde: (x: number, y: number, z: number) => boolean;
  // Top durduğunda pistte mi (koltuğun üstü gibi bir yerde durduysa dışarı sayılır).
  pistte: (x: number, y: number, z: number) => boolean;
};

export type Top = {
  x: number; // topun merkezi
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  duruyor: boolean;
  delikte: boolean;
  disarida: boolean;
  sakin: number; // kaç saniyedir çok yavaş
  sure: number; // bu vuruş kaç saniyedir sürüyor
  carpma: number; // bu vuruşta duvara, eşyaya çarpma sayısı
  enHizliCarpma: number; // son adımdaki en sert çarpmanın hızı (ses, titreşim için; şimdilik kullanılmıyor)
};

export const yeniTop = (x: number, y: number, z: number): Top => ({
  x, y, z, vx: 0, vy: 0, vz: 0, duruyor: true, delikte: false, disarida: false, sakin: 0, sure: 0, carpma: 0, enHizliCarpma: 0,
});

// a → b arasında, verilen ende ve yükseklikte duvar.
export function duvar(a: [number, number], b: [number, number], y0: number, y1: number, en: number, sekme: number, surtunme: number): Kutu {
  const dx = b[0] - a[0];
  const dz = b[1] - a[1];
  const boy = Math.hypot(dx, dz) || 1e-9;
  const hx = boy / 2 + en / 2;
  const hz = en / 2;
  return { cx: (a[0] + b[0]) / 2, cz: (a[1] + b[1]) / 2, hx, hz, cos: dx / boy, sin: dz / boy, y0, y1, sekme, surtunme, kap: Math.hypot(hx, hz) };
}

// Eksenlere paralel kutu.
export function kutu(x0: number, x1: number, z0: number, z1: number, y0: number, y1: number, sekme: number, surtunme: number, delikli = false): Kutu {
  const hx = (x1 - x0) / 2;
  const hz = (z1 - z0) / 2;
  return { cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, hx, hz, cos: 1, sin: 0, y0, y1, sekme, surtunme, delikli, kap: Math.hypot(hx, hz) };
}

// Topu değme noktasından dışarı iter, hızını düzeltir. (nx, ny, nz): yüzeyden topa doğru birim yön.
function degme(t: Top, nx: number, ny: number, nz: number, girme: number, sekme: number, surtunme: number): void {
  t.x += nx * girme;
  t.y += ny * girme;
  t.z += nz * girme;
  const vn = t.vx * nx + t.vy * ny + t.vz * nz;
  if (vn >= 0) return;
  const e = -vn > FIZIK.sekmeEsigi ? sekme : 0;
  const itme = -(1 + e) * vn;
  t.vx += itme * nx;
  t.vy += itme * ny;
  t.vz += itme * nz;
  // Sürtünme: yüzeye paralel hızı, itmeyle orantılı azaltır (en çok sıfıra kadar).
  const vn2 = t.vx * nx + t.vy * ny + t.vz * nz;
  const tx = t.vx - vn2 * nx;
  const ty = t.vy - vn2 * ny;
  const tz = t.vz - vn2 * nz;
  const th = Math.hypot(tx, ty, tz);
  if (th > 1e-9) {
    const azalt = Math.min(surtunme * itme, th) / th;
    t.vx -= tx * azalt;
    t.vy -= ty * azalt;
    t.vz -= tz * azalt;
  }
  if (ny < 0.7 && -vn > FIZIK.sekmeEsigi) {
    t.carpma += 1;
    if (-vn > t.enHizliCarpma) t.enHizliCarpma = -vn;
  }
}

// Bir hesap adımı. dt sabittir (FIZIK.adim).
export function adimAt(t: Top, d: Dunya, dt: number = FIZIK.adim): void {
  if (t.duruyor || t.disarida) return;
  const R = d.topYaricap;
  t.enHizliCarpma = 0;
  t.vy -= FIZIK.yercekimi * dt;
  t.x += t.vx * dt;
  t.y += t.vy * dt;
  t.z += t.vz * dt;

  let yerde = false;
  const c = d.delik;
  for (let i = 0; i < d.kutular.length; i++) {
    const k = d.kutular[i];
    const dx = t.x - k.cx;
    const dz = t.z - k.cz;
    const kap = k.kap + R;
    if (dx > kap || dx < -kap || dz > kap || dz < -kap) continue;
    if (t.y - R > k.y1 || t.y + R < k.y0) continue;

    // Delik: top deliğin ağzının üstündeyse ya da içindeyse zemin yerine deliğin kenarı, duvarı ve tabanı.
    if (k.delikli) {
      const rx = t.x - c.x;
      const rz = t.z - c.z;
      const ro = Math.hypot(rx, rz);
      if (ro < c.yaricap) {
        if (ro > 1e-9) {
          // En yakın katı nokta: ağzın kenarı (top yukarıdaysa) ya da deliğin duvarı (top aşağıdaysa).
          const px = c.x + (rx / ro) * c.yaricap;
          const pz = c.z + (rz / ro) * c.yaricap;
          const py = Math.min(t.y, c.y);
          const ex = t.x - px;
          const ey = t.y - py;
          const ez = t.z - pz;
          const u2 = ex * ex + ey * ey + ez * ez;
          if (u2 < R * R && u2 > 1e-14) {
            const u = Math.sqrt(u2);
            if (ey / u > 0.7) yerde = true;
            degme(t, ex / u, ey / u, ez / u, R - u, FIZIK.delikKenarSekme, k.surtunme);
          }
        }
        const taban = c.y - c.derinlik;
        if (t.y - R < taban) {
          yerde = true;
          degme(t, 0, 1, 0, taban - (t.y - R), FIZIK.delikTabanSekme, 0.3);
        }
        if (t.y < c.y - R * 0.5) t.delikte = true;
        continue;
      }
    }

    // Küre ile kutu: kutunun topa en yakın noktası.
    const lx = dx * k.cos + dz * k.sin;
    const lz = -dx * k.sin + dz * k.cos;
    const qx = lx > k.hx ? k.hx : lx < -k.hx ? -k.hx : lx;
    const qz = lz > k.hz ? k.hz : lz < -k.hz ? -k.hz : lz;
    const qy = t.y > k.y1 ? k.y1 : t.y < k.y0 ? k.y0 : t.y;
    let ex = lx - qx;
    let ey = t.y - qy;
    let ez = lz - qz;
    const u2 = ex * ex + ey * ey + ez * ez;
    if (u2 >= R * R) continue;
    let girme: number;
    if (u2 > 1e-14) {
      const u = Math.sqrt(u2);
      ex /= u;
      ey /= u;
      ez /= u;
      girme = R - u;
    } else {
      // Topun merkezi kutunun içinde: en yakın yüzden çıkar.
      const px = k.hx - Math.abs(lx);
      const pz = k.hz - Math.abs(lz);
      const py = k.y1 - t.y;
      if (py <= px && py <= pz) {
        ex = 0; ey = 1; ez = 0; girme = py + R;
      } else if (px <= pz) {
        ex = lx >= 0 ? 1 : -1; ey = 0; ez = 0; girme = px + R;
      } else {
        ex = 0; ey = 0; ez = lz >= 0 ? 1 : -1; girme = pz + R;
      }
    }
    const nx = ex * k.cos - ez * k.sin;
    const nz = ex * k.sin + ez * k.cos;
    if (ey > 0.7) yerde = true;
    degme(t, nx, ey, nz, girme, k.sekme, k.surtunme);
  }

  if (!d.icerde(t.x, t.y, t.z)) {
    t.disarida = true;
    return;
  }

  // Durma: top yerde ve çok yavaşsa bir süre sonra durmuş sayılır.
  t.sure += dt;
  const hiz2 = t.vx * t.vx + t.vy * t.vy + t.vz * t.vz;
  if ((yerde && hiz2 < FIZIK.durmaHizi * FIZIK.durmaHizi) || t.sure > FIZIK.enUzunVurus) {
    t.sakin += dt;
    if (t.sakin >= FIZIK.durmaSuresi) {
      t.vx = 0;
      t.vy = 0;
      t.vz = 0;
      t.duruyor = true;
      if (!t.delikte && !d.pistte(t.x, t.y, t.z)) t.disarida = true;
    }
  } else {
    t.sakin = 0;
  }
}

// Topa vurur: yön (x, z) birim, hız m/s.
export function vur(t: Top, yonX: number, yonZ: number, hiz: number): void {
  t.vx = yonX * hiz;
  t.vy = 0;
  t.vz = yonZ * hiz;
  t.duruyor = false;
  t.sakin = 0;
  t.sure = 0;
  t.carpma = 0;
}

// Top durana, deliğe düşene ya da dışarı çıkana kadar hesaplar (deneme ve arama için). Süre sınırı saniye.
export function durana(t: Top, d: Dunya, sinir = 30): void {
  const n = Math.ceil(sinir / FIZIK.adim);
  for (let i = 0; i < n && !t.duruyor && !t.disarida; i++) adimAt(t, d);
}
