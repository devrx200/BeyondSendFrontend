import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ServerProvider } from "./contexts/ServerContext.jsx";
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HelmetProvider>
      <ServerProvider>
        <App />
      </ServerProvider>
    </HelmetProvider>
  </StrictMode>
);