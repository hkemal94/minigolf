import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import './stil.css';
import { Uygulama } from './Uygulama';

// ?maket=<ekran> ile ekran maketleri açılır (öneri, oynanış değil). Maket kodu ayrı yüklenir,
// oyunun kendi ekranına karışmaz.
const adres = new URLSearchParams(window.location.search);
const maket = adres.get('maket');
const Maket = lazy(() => import('./maket/Maket'));
// ?oyna=1 ile oynanabilir prototip açılır (üç delik; değerler DENEME). Kodu ayrı yüklenir.
const oyna = adres.has('oyna');
const Oyun = lazy(() => import('./oyun/Oyun'));

createRoot(document.getElementById('kok')!).render(
  <StrictMode>
    {maket ? (
      <Suspense fallback={null}>
        <Maket ekran={maket} />
      </Suspense>
    ) : oyna ? (
      <Suspense fallback={null}>
        <Oyun />
      </Suspense>
    ) : (
      <Uygulama />
    )}
  </StrictMode>,
);
