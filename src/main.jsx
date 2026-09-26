import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ServerProvider } from "./contexts/ServerContext.jsx";
import App from './App.jsx';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { Fade, PopperContent } from 'reactstrap';
import PropTypes from 'prop-types';
import { encodeBase64, decodeBase64 } from "./utilities/rXBase64.js";
import apiClient from "@apiService";

// Patch reactstrap ESM missing defaultProps on Fade/PopperContent causing React 18 PropTypes warning
if (Fade) {
  Fade.defaultProps = {
    timeout: 150,
    appear: true,
    enter: true,
    exit: true,
    in: true,
  };
}
if (PopperContent) {
  if (PopperContent.defaultProps) {
    PopperContent.defaultProps.transition = {
      timeout: 150,
      appear: true,
      enter: true,
      exit: true,
      in: true,
    };
  }
  if (PopperContent.propTypes) {
    PopperContent.propTypes.transition = PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.shape({
        timeout: PropTypes.oneOfType([PropTypes.number, PropTypes.shape({})]),
        baseClass: PropTypes.string,
        baseClassActive: PropTypes.string,
      }),
    ]);
  }
}

globalThis.encodeBase64 = encodeBase64;
globalThis.decodeBase64 = decodeBase64;
globalThis.apiClient = apiClient;
if (typeof window !== "undefined") {
  window.encodeBase64 = encodeBase64;
  window.decodeBase64 = decodeBase64;
  window.apiClient = apiClient;
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