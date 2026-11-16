import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/600.css';
import './stil.css';
import { Uygulama } from './Uygulama';

createRoot(document.getElementById('kok')!).render(
  <StrictMode>
    <Uygulama />
  </StrictMode>,
);
