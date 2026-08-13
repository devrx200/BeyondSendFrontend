import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ServerProvider } from "./contexts/ServerContext.jsx";
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { encodeBase64, decodeBase64 } from "./utilities/rXBase64.js";

globalThis.encodeBase64 = encodeBase64;
globalThis.decodeBase64 = decodeBase64;
if (typeof window !== "undefined") {
  window.encodeBase64 = encodeBase64;
  window.decodeBase64 = decodeBase64;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <ServerProvider>
        <App />
      </ServerProvider>
    </HelmetProvider>
  </StrictMode>
);