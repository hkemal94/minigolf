import { StrictMode, Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import './stil.css';
import { Uygulama } from './Uygulama';

// ?maket=<ekran> ile ekran maketleri açılır (öneri, oynanış değil). Maket kodu ayrı yüklenir,
// oyunun kendi ekranına karışmaz.
const maket = new URLSearchParams(window.location.search).get('maket');
const Maket = lazy(() => import('./maket/Maket'));

createRoot(document.getElementById('kok')!).render(
  <StrictMode>
    {maket ? (
      <Suspense fallback={null}>
        <Maket ekran={maket} />
      </Suspense>
    ) : (
      <Uygulama />
    )}
  </StrictMode>,
);
