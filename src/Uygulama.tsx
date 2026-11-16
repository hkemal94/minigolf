import { Saha } from './sahne/Saha';
import { m } from './metinler';

// Tek ekran (iskelet): üstte ince bir şerit, ortada boş saha ve yer tutucu top, altta not.
export function Uygulama() {
  return (
    <div className="cerceve">
      <header className="ust">
        <div>
          <div className="ust-sirket">{m('oyun.sirket')}</div>
          <div className="ust-ad">{m('oyun.ad')}</div>
        </div>
        <span className="ust-surum">{m('ust.surum')}</span>
      </header>
      <main className="sahne">
        <Saha />
      </main>
      <footer className="alt">{m('alt.iskelet')}</footer>
    </div>
  );
}
