import { useState, type ReactNode } from 'react';
import { m, type MetinAnahtari } from '../metinler';
import { StatSahnesi, EkranKonumu, ORTA_YUVARLAK } from './StatSahnesi';
import { Pist, Top, BayrakliDelik, Blok, KesikNisan, KalinCizgi, GucHalkasi, pistUstu } from './Pist';
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
function StatKucuk({ zoom = 3.2 }: { zoom?: number }) {
  const [x, , z] = ORTA_YUVARLAK;
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
        <StatKucuk zoom={3.6} />
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
          <StatKucuk zoom={2.7} />
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

// 1. delik (orta yuvarlak): pist orta çizgiye dik, orta yuvarlağın üstünden. Ölçüler DENEME.
const D1 = {
  merkez: [ORTA_YUVARLAK[0], 0.02, ORTA_YUVARLAK[2]] as [number, number, number],
  boy: 16, // DENEME
  en: 3.2, // DENEME
};

// c) Delik ekranı
function DelikEkrani() {
  const [x, y, z] = D1.merkez;
  const u = pistUstu(y);
  return (
    <Ekran>
      <DelikUst no={1} zorluk="maket.zorluk.enKolay" />
      <div className="mk-sahne">
        <StatSahnesi konum={[x - 30, 27, z - 24]} hedef={[x + 5, 0, z + 5]} zoom={1} gorusAcisi={40} golgeMerkez={[x + 10, 0, z]} golgeYaricap={45}>
          <Pist merkez={D1.merkez} boy={D1.boy} en={D1.en} />
          <Top konum={[x - D1.boy / 2 + 1.6, u, z]} />
          <BayrakliDelik konum={[x + D1.boy / 2 - 1.6, u, z]} />
        </StatSahnesi>
      </div>
      <DelikAlt ipucu={m('maket.delik.ipucu')} />
    </Ekran>
  );
}

// 3. delik (A ucundaki kale): pist ceza sahasından kaleye, sonunda dar geçit. Ölçüler DENEME.
const D3 = {
  merkez: [6.2, 0.02, ORTA_YUVARLAK[2]] as [number, number, number],
  boy: 15, // DENEME
  en: 3.4, // DENEME
  gecit: 1.3, // DENEME (iki direk arası)
};

// d) Atış ve nişan
function AtisEkrani() {
  const [x, y, z] = D3.merkez;
  const u = pistUstu(y);
  const top: [number, number, number] = [x + D3.boy / 2 - 2.6, u, z + 0.5];
  const delik: [number, number, number] = [x - D3.boy / 2 + 1.3, u, z];
  const gecitX = x - D3.boy / 2 + 3.6;
  // Nişan: topun önünden geçide doğru; parmak topun arkasında (çekilen yön ters).
  const yon = [delik[0] - top[0], delik[2] - top[2]];
  const yb = Math.hypot(yon[0], yon[1]);
  const ux = yon[0] / yb;
  const uz = yon[1] / yb;
  const nisanSon: [number, number, number] = [top[0] + ux * 8.2, u + 0.02, top[2] + uz * 8.2]; // DENEME boy
  const parmak: [number, number, number] = [top[0] - ux * 2.6, u + 0.02, top[2] - uz * 2.6]; // DENEME
  const yanParca = (D3.en - D3.gecit) / 2;
  const [parmakEkran, setParmakEkran] = useState<[number, number] | null>(null);
  return (
    <Ekran>
      <DelikUst no={3} zorluk="maket.zorluk.kolay" />
      <div className="mk-sahne">
        <StatSahnesi konum={[x + 34, 30, z + 20]} hedef={[x - 3, 0, z]} zoom={21} golgeMerkez={[x, 0, z]} golgeYaricap={30}>
          <Pist merkez={D3.merkez} boy={D3.boy} en={D3.en} />
          <Blok konum={[gecitX, u, z - D3.gecit / 2 - yanParca / 2]} boyut={[0.5, 0.5, yanParca]} />
          <Blok konum={[gecitX, u, z + D3.gecit / 2 + yanParca / 2]} boyut={[0.5, 0.5, yanParca]} />
          <BayrakliDelik konum={delik} />
          <KesikNisan bas={[top[0] + ux * 0.5, u + 0.02, top[2] + uz * 0.5]} son={nisanSon} />
          <KalinCizgi bas={[top[0], u + 0.03, top[2]]} son={parmak} kalinlik={0.08} renkKodu={renk.lacivert} saydam={0.7} />
          <GucHalkasi merkez={[top[0], u, top[2]]} oran={0.45} />
          <Top konum={top} />
          <EkranKonumu nokta={parmak} bildir={(px, py) => setParmakEkran([px, py])} />
        </StatSahnesi>
        {parmakEkran && (
          <div className="mk-parmak" style={{ left: parmakEkran[0], top: parmakEkran[1] }}>
            <span>{m('maket.atis.parmak')}</span>
          </div>
        )}
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
        <StatKucuk zoom={3.3} />
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
