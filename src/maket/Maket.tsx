import { useState, type ReactNode } from 'react';
import { m, type MetinAnahtari } from '../metinler';
import { StatSahnesi, ORTA_YUVARLAK } from './StatSahnesi';
import { OrnekSahne } from './OrnekDelik';
import { Sema, KucukHarita } from './Sema';
import { metre } from './metre';
import { ORNEK_DELIKLER, ornekDelik } from './ornekDelikler';
import { renk } from '../sahne/renkler';
import './maket.css';

// MAKET (öneri, oynanış değil): ?maket=<ekran> ile açılan, Kemal'in ekranları önden görmesi için
// hazırlanmış görüntüler. Oyunun kalıcı koduna karışmaz; düğmeler çalışmaz.
// Sayılar uydurulmaz: vuruşlar ve ilerleme "–". Ölçüler DENEME.

const yer = (n: number) => m(`maket.yer.${n}` as MetinAnahtari);

function Rozet() {
  return <div className="mk-rozet">{m('maket.rozet')}</div>;
}

function Ekran({ children, koyu = false }: { children: ReactNode; koyu?: boolean }) {
  return (
    <div className={`mk-ekran ${koyu ? 'mk-koyu' : ''}`}>
      <Rozet />
      {children}
    </div>
  );
}

// Basit çizgi simgeler (hazır simge paketi yok; kodla çizildi).
function Simge({ ad }: { ad: 'oyna' | 'turlar' | 'pullar' | 'ayarlar' | 'geri' | 'kilit' | 'geriAl' | 'skor' | 'menu' }) {
  const ortak = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };
  const ici: Record<typeof ad, ReactNode> = {
    oyna: <path d="M8 5l11 7-11 7z" {...ortak} />,
    turlar: (
      <>
        <path d="M4 20V5" {...ortak} />
        <path d="M4 5h11l-2 3.5 2 3.5H4" {...ortak} />
      </>
    ),
    pullar: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="1" {...ortak} strokeDasharray="2 2" />
        <rect x="8" y="7" width="8" height="10" {...ortak} />
      </>
    ),
    ayarlar: (
      <>
        <circle cx="12" cy="12" r="3" {...ortak} />
        <path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" {...ortak} />
      </>
    ),
    geri: <path d="M15 5l-7 7 7 7" {...ortak} />,
    kilit: (
      <>
        <rect x="5" y="11" width="14" height="9" rx="1.5" {...ortak} />
        <path d="M8 11V8a4 4 0 018 0v3" {...ortak} />
      </>
    ),
    geriAl: <path d="M9 7L4 12l5 5M4 12h10a6 6 0 010 12" {...ortak} transform="translate(0 -3)" />,
    skor: (
      <>
        <rect x="5" y="4" width="14" height="16" rx="1.5" {...ortak} />
        <path d="M8 9h8M8 13h8M8 17h5" {...ortak} />
      </>
    ),
    menu: <path d="M5 7h14M5 12h14M5 17h14" {...ortak} />,
  };
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
      {ici[ad]}
    </svg>
  );
}

function AltMenu({ secili }: { secili: 'oyna' | 'turlar' | 'pullar' | 'ayarlar' }) {
  const ogeler = ['oyna', 'turlar', 'pullar', 'ayarlar'] as const;
  return (
    <nav className="mk-altmenu">
      {ogeler.map((o) => (
        <div key={o} className={`mk-altmenu-oge ${o === secili ? 'secili' : ''}`}>
          <Simge ad={o} />
          <span>{m(`maket.menu.${o}` as MetinAnahtari)}</span>
        </div>
      ))}
    </nav>
  );
}

// Statın kuşbakışı küçük görüntüsü (ana ekran, tur kartı, tur sonu).
// Kadraj (Kemal, 19 Kasım 2026): köşeye taşınan kulüp binası tam görünsün diye bakış binaya doğru
// kaydırıldı (KADRAJ_KAYMA; DENEME) ve biraz uzaklaştırıldı; statın öbür ucu da kadrajda kalır.
const KADRAJ_KAYMA: [number, number] = [7.1, -5.5]; // x, z (m): ekranda sağa, kulüp binasına doğru
function StatKucuk({ zoom = 3.2 }: { zoom?: number }) {
  const [x0, , z0] = ORTA_YUVARLAK;
  const x = x0 + KADRAJ_KAYMA[0];
  const z = z0 + KADRAJ_KAYMA[1];
  return (
    <StatSahnesi konum={[x + 70, 75, z + 90]} hedef={[x, 0, z - 4]} zoom={zoom} golgeYaricap={80} arkaPlan={renk.krem} />
  );
}

// a) Ana ekran
function AnaEkran() {
  return (
    <Ekran koyu>
      <header className="mk-ust">
        <div className="mk-sirket">{m('oyun.sirket')}</div>
        <div className="mk-oyun-ad">{m('oyun.ad')}</div>
      </header>
      <div className="mk-vitrin">
        <StatKucuk zoom={3.05} />
      </div>
      <div className="mk-tur-kart">
        <div className="mk-tur-kart-ust">
          <div>
            <div className="mk-tur-yer">{m('maket.tur.yer')}</div>
            <div className="mk-tur-ad">{m('maket.tur.ad')}</div>
          </div>
          <span className="mk-etiket">{m('maket.tur.delik')}</span>
        </div>
        <div className="mk-cubuk">
          {Array.from({ length: 18 }, (_, i) => (
            <span key={i} />
          ))}
        </div>
        <div className="mk-tur-satir">
          <span>{m('maket.tur.ilerleme')}</span>
          <span>{m('maket.ana.devam')}</span>
        </div>
      </div>
      <button className="mk-dugme-buyuk">
        <Simge ad="oyna" />
        {m('maket.ana.oyna')}
      </button>
      <div className="mk-iki-kutu">
        <div className="mk-kutu">
          <div className="mk-kutu-baslik">{m('maket.ana.ayinTuru')}</div>
          <div className="mk-kutu-deger">{m('maket.ana.ayinTuruDeger')}</div>
        </div>
        <div className="mk-kutu">
          <div className="mk-kutu-baslik">{m('maket.ana.pullar')}</div>
          <div className="mk-kutu-deger">{m('maket.ana.pullarDeger')}</div>
        </div>
      </div>
      <div className="mk-surum">{m('ust.surum')}</div>
      <AltMenu secili="oyna" />
    </Ekran>
  );
}

// b) Tur seçimi
function TurSecimi() {
  return (
    <Ekran>
      <header className="mk-baslik-serit">
        <span className="mk-geri">
          <Simge ad="geri" />
        </span>
        <div>
          <div className="mk-baslik">{m('maket.turlar.baslik')}</div>
          <div className="mk-alt-baslik">{m('maket.turlar.alt')}</div>
        </div>
      </header>
      <div className="mk-tur-buyuk">
        <div className="mk-tur-resim">
          <StatKucuk zoom={2.45} />
          <span className="mk-etiket mk-etiket-ust">{m('maket.turlar.ayin')}</span>
        </div>
        <div className="mk-tur-bilgi">
          <div>
            <div className="mk-tur-yer koyu">{m('maket.tur.yer')}</div>
            <div className="mk-tur-ad koyu">{m('maket.tur.ad')}</div>
          </div>
          <span className="mk-etiket koyu">{m('maket.tur.delik')}</span>
        </div>
        <div className="mk-tur-satir koyu">
          <span>{m('maket.tur.ilerleme')}</span>
          <span>{m('maket.turlar.enIyi')}</span>
        </div>
        <button className="mk-dugme">{m('maket.turlar.basla')}</button>
      </div>
      <div className="mk-kilitliler">
        {[1, 2, 3].map((i) => (
          <div key={i} className="mk-kilitli">
            <span className="mk-kilit">
              <Simge ad="kilit" />
            </span>
            <div>
              <div className="mk-kilitli-ad">{m('maket.turlar.kilitli')}</div>
              <div className="mk-kilitli-not">{m('maket.turlar.kilitNot')}</div>
            </div>
            <span className="mk-etiket koyu soluk">{m('maket.tur.delik')}</span>
          </div>
        ))}
      </div>
      <AltMenu secili="turlar" />
    </Ekran>
  );
}

// Delik ve atış ekranlarının üst şeridi
function DelikUst({ no, zorluk }: { no: number; zorluk: MetinAnahtari }) {
  return (
    <header className="mk-delik-ust">
      <span className="mk-yuvarlak">
        <Simge ad="menu" />
      </span>
      <div className="mk-delik-orta">
        <div className="mk-delik-no">{m('maket.delik.no', no)}</div>
        <div className="mk-delik-yer">
          {yer(no)} · {m('maket.delik.zorluk', m(zorluk))}
        </div>
      </div>
      <div className="mk-vurus">
        <div className="mk-vurus-sayi">{m('maket.bos')}</div>
        <div className="mk-vurus-ad">{m('maket.delik.vurus')}</div>
      </div>
    </header>
  );
}

function DelikAlt({ ipucu }: { ipucu: ReactNode }) {
  return (
    <footer className="mk-delik-alt">
      <button className="mk-dugme-ikincil">
        <Simge ad="geriAl" />
        {m('maket.delik.geriAl')}
      </button>
      <div className="mk-ipucu">{ipucu}</div>
      <button className="mk-dugme-ikincil">
        <Simge ad="skor" />
        {m('maket.delik.skor')}
      </button>
    </footer>
  );
}

// Yeni dille çizilen delikler (Kemal, 18 Kasım 2026): ?maket=delik&no=1–9 | 14.
const ornekNo = () => ornekDelik(Number(new URLSearchParams(window.location.search).get('no') ?? ORNEK_DELIKLER[0].no)).no;

// Yeni dille çizilen delikler arasında geçiş (maketin kendi gezintisi; oyunda olmayacak).
// Numaralar şeridi eşit paylaşır (10 delik sığar, 18'e kadar da sığar); zemin yazısı sahnenin sol üst köşesinde.
function OrnekGecis({ ekran, secili }: { ekran: string; secili: number }) {
  return (
    <nav className="mk-ornekler">
      <span>{m('maket.ornek.baslik')}</span>
      {ORNEK_DELIKLER.map((d) => (
        <a key={d.no} href={`?maket=${ekran}&no=${d.no}`} className={d.no === secili ? 'secili' : ''}>
          {d.no}
        </a>
      ))}
    </nav>
  );
}

// Deliğin yeri: delik ekranın dışındaysa kenarda ok ve uzaklık; içindeyse bayrağın kendisi görünür.
// Köşede küçük plan: deliğin tamamı, topun ve deliğin yeri. (Kemal, 18 Kasım 2026: kamera topu izler.)
function DelikYeri({ no, atis, delikEkran, alan }: { no: number; atis: boolean; delikEkran: [number, number] | null; alan: HTMLDivElement | null }) {
  const delik = ornekDelik(no);
  const top = atis ? delik.atis.top : delik.baslangic;
  const uzaklik = Math.hypot(delik.cukur[0] - top[0], delik.cukur[2] - top[2]);
  let ok: ReactNode = null;
  if (delikEkran && alan) {
    const g = alan.clientWidth;
    const y = alan.clientHeight;
    const pay = 30;
    const [dx, dy] = delikEkran;
    if (dx < 0 || dx > g || dy < 0 || dy > y) {
      // Ekranın ortasından deliğe giden doğrunun kenarı kestiği yer.
      const ox = g / 2;
      const oy = y / 2;
      const t = Math.min((g / 2 - pay) / Math.abs(dx - ox || 1), (y / 2 - pay) / Math.abs(dy - oy || 1));
      const aci = (Math.atan2(dy - oy, dx - ox) * 180) / Math.PI;
      let okX = ox + (dx - ox) * t;
      const okY = oy + (dy - oy) * t;
      // Sağ üst köşede küçük plan var; ok onun altında kalmasın.
      if (okX > g - 120 && okY < 190) okX = g - 130;
      // Sol üst köşede zemin yazısı var; ok onun üstüne binmesin.
      let okYSon = okY;
      if (okX < 190 && okY < 60) okYSon = 64;
      ok = (
        <div className="mk-delik-oku" style={{ left: okX, top: okYSon }}>
          <svg viewBox="0 0 24 24" width="26" height="26" style={{ transform: `rotate(${aci}deg)` }} aria-hidden>
            <path d="M4 12h13M12 6l6 6-6 6" fill="none" stroke={renk.krem} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span>{m('maket.delik.uzaklik', metre(Math.round(uzaklik * 10) / 10))}</span>
        </div>
      );
    }
  }
  return (
    <>
      {ok}
      <div className="mk-ornek-zemin">{m(`maket.zemin.${no}` as MetinAnahtari)}</div>
      <div className="mk-kucuk-harita-kutu">
        <KucukHarita delik={delik} top={[top[0], top[2]]} />
      </div>
    </>
  );
}

// c) Delik ekranı: kamera topun yanında; deliğin yeri ok ve küçük planla.
function DelikEkrani() {
  const no = ornekNo();
  const [delikEkran, setDelikEkran] = useState<[number, number] | null>(null);
  const [alan, setAlan] = useState<HTMLDivElement | null>(null);
  return (
    <Ekran>
      <DelikUst no={no} zorluk={ornekDelik(no).zorluk} />
      <OrnekGecis ekran="delik" secili={no} />
      <div className="mk-sahne" ref={setAlan}>
        <OrnekSahne no={no} delikBildir={(x, y) => setDelikEkran([x, y])} />
        <DelikYeri no={no} atis={false} delikEkran={delikEkran} alan={alan} />
      </div>
      <DelikAlt ipucu={m('maket.delik.ipucu')} />
    </Ekran>
  );
}

// d) Atış ve nişan: kamera topa daha da yaklaşır; parmak, nişan çizgisi, güç halkası.
function AtisEkrani() {
  const no = ornekNo();
  const [parmakEkran, setParmakEkran] = useState<[number, number] | null>(null);
  const [delikEkran, setDelikEkran] = useState<[number, number] | null>(null);
  const [alan, setAlan] = useState<HTMLDivElement | null>(null);
  return (
    <Ekran>
      <DelikUst no={no} zorluk={ornekDelik(no).zorluk} />
      <OrnekGecis ekran="atis" secili={no} />
      <div className="mk-sahne" ref={setAlan}>
        <OrnekSahne no={no} atis parmakBildir={(px, py) => setParmakEkran([px, py])} delikBildir={(x, y) => setDelikEkran([x, y])} />
        {parmakEkran && (
          <div className="mk-parmak" style={{ left: parmakEkran[0], top: parmakEkran[1] }}>
            <span>{m('maket.atis.parmak')}</span>
          </div>
        )}
        <DelikYeri no={no} atis delikEkran={delikEkran} alan={alan} />
        <div className="mk-guc-etiket">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
            <circle cx="12" cy="12" r="8" fill="none" stroke={renk.lacivert} strokeOpacity="0.25" strokeWidth="3" />
            <path d="M12 4a8 8 0 016.9 12" fill="none" stroke={renk.lacivert} strokeWidth="3" />
          </svg>
          {m('maket.atis.guc')} <b>{m('maket.deneme')}</b>
        </div>
      </div>
      <DelikAlt ipucu={m('maket.atis.not')} />
    </Ekran>
  );
}

// Üstten şema (ölçü çizgili): ?maket=sema&no=1–9 | 14; no=0 bu deliklerin stattaki yeri (ölçekli).
function SemaEkrani() {
  const ham = Number(new URLSearchParams(window.location.search).get('no') ?? 0);
  return (
    <Ekran>
      <Sema no={ham === 0 ? 0 : ornekDelik(ham).no} />
    </Ekran>
  );
}

// e) Skor kartı
function SkorKarti() {
  return (
    <Ekran>
      <header className="mk-baslik-serit">
        <span className="mk-geri">
          <Simge ad="geri" />
        </span>
        <div className="mk-esnek">
          <div className="mk-baslik">{m('maket.skor.baslik')}</div>
          <div className="mk-alt-baslik">
            {m('maket.tur.yer')} · {m('maket.tur.ad')}
          </div>
        </div>
        <span className="mk-etiket kiremit">{m('maket.deneme')}</span>
      </header>
      <div className="mk-skor">
        <div className="mk-skor-satir mk-skor-bas">
          <span>{m('maket.skor.delik')}</span>
          <span>{m('maket.skor.yer')}</span>
          <span>{m('maket.skor.vurus')}</span>
        </div>
        {Array.from({ length: 18 }, (_, i) => (
          <div key={i} className={`mk-skor-satir ${i === 0 ? 'simdi' : ''}`}>
            <span className="mk-skor-no">{i + 1}</span>
            <span className="mk-skor-yer">{yer(i + 1)}</span>
            <span className="mk-skor-vurus">{m('maket.bos')}</span>
          </div>
        ))}
        <div className="mk-skor-satir mk-skor-toplam">
          <span />
          <span>{m('maket.skor.toplam')}</span>
          <span>{m('maket.bos')}</span>
        </div>
      </div>
      <div className="mk-skor-alt">
        <span>{m('maket.skor.not')}</span>
        <button className="mk-dugme kucuk">{m('maket.skor.devam')}</button>
      </div>
    </Ekran>
  );
}

// f) Tur sonu
function TurSonu() {
  return (
    <Ekran koyu>
      <div className="mk-son-resim">
        <StatKucuk zoom={2.85} />
      </div>
      <div className="mk-son-govde">
        <div className="mk-son-baslik">{m('maket.sonu.baslik')}</div>
        <div className="mk-alt-baslik acik">
          {m('maket.tur.yer')} · {m('maket.tur.ad')}
        </div>
        <div className="mk-son-toplam">
          <div className="mk-son-sayi">{m('maket.bos')}</div>
          <div className="mk-son-ad">{m('maket.sonu.toplam')}</div>
        </div>
        <div className="mk-son-kutu">
          <div className="mk-tur-satir">
            <span>{m('maket.sonu.ayinTuru')}</span>
            <span>{m('maket.sonu.ilerleme')}</span>
          </div>
          <div className="mk-cubuk">
            {Array.from({ length: 18 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
        </div>
        <div className="mk-son-pul">
          <div className="mk-pul">
            <div className="mk-pul-ic">{m('maket.sonu.pulYer')}</div>
          </div>
          <div className="mk-pul-yan">
            <div className="mk-kutu-baslik">{m('maket.sonu.pul')}</div>
            <div className="mk-pul-dizi">
              {[0, 1, 2].map((i) => (
                <span key={i} className="mk-pul-kucuk" />
              ))}
              <span className="mk-pul-kucuk buyuk" />
            </div>
            <div className="mk-kilitli-not acik">{m('maket.ana.pullarDeger')}</div>
          </div>
        </div>
        <div className="mk-son-dugmeler">
          <button className="mk-dugme-ikincil acik">{m('maket.sonu.skor')}</button>
          <button className="mk-dugme-buyuk">{m('maket.sonu.anaEkran')}</button>
        </div>
      </div>
    </Ekran>
  );
}

const EKRANLAR: Record<string, () => ReactNode> = {
  'ana-ekran': AnaEkran,
  'tur-secimi': TurSecimi,
  delik: DelikEkrani,
  atis: AtisEkrani,
  sema: SemaEkrani,
  'skor-karti': SkorKarti,
  'tur-sonu': TurSonu,
};

export default function Maket({ ekran }: { ekran: string }) {
  const Bilesen = EKRANLAR[ekran];
  if (!Bilesen) {
    return (
      <Ekran koyu>
        <div className="mk-yok">
          <div>{m('maket.yok')}</div>
          <div>{m('maket.liste')}</div>
        </div>
      </Ekran>
    );
  }
  return <Bilesen />;
}
