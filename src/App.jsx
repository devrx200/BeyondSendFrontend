import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';

import AppRoutes from './routes/routes';
import './App.css';

function App() {
  return (
    <Router>
        <LanguageProvider>
          <AccessibilityProvider>
            <AppRoutes />
          </AccessibilityProvider>
        </LanguageProvider>
    </Router>
  );
}

export default App;
