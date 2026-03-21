import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'flag-icons/css/flag-icons.min.css';
import '../app/globals.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root container #root was not found.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js');
  });
}
