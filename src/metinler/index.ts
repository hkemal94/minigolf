import tr from './tr.json' with { type: 'json' };
import enHam from './en.json' with { type: 'json' };

// Ekrandaki bütün yazılar buradan gelir; koda yazı gömülmez.
// İki dil: Türkçe ve İngilizce. Yeni yazı iki dosyaya birden eklenir.
// İngilizcede eksik ya da fazla anahtar olursa derleme hata verir.
export type MetinAnahtari = keyof typeof tr;
const en: Record<MetinAnahtari, string> = enHam;
// Fazla anahtar denetimi: İngilizcede Türkçede olmayan bir anahtar varsa burada hata çıkar.
const _fazlaYok: Record<keyof typeof enHam, string> = tr;
void _fazlaYok;

export type Dil = 'tr' | 'en';
const SOZLUKLER: Record<Dil, Record<MetinAnahtari, string>> = { tr, en };

// Seçili dil. Dil ayarı henüz yok (sonraki paketler); şimdilik Türkçe.
let dil: Dil = 'tr';

export function dilSec(yeni: Dil): void {
  dil = yeni;
  if (typeof document !== 'undefined') document.documentElement.lang = yeni;
}

export const seciliDil = (): Dil => dil;

// Metni seçili dilde verir; {0}, {1} yerine verilen değerler gelir.
export function m(anahtar: MetinAnahtari, ...degerler: (string | number)[]): string {
  let s = SOZLUKLER[dil][anahtar];
  degerler.forEach((d, i) => {
    s = s.replace(`{${i}}`, String(d));
  });
  return s;
}
