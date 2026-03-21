import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import { MobileProvider } from '../../hooks/use-mobile';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MobileProvider>
      <App />
    </MobileProvider>
  </StrictMode>,
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
