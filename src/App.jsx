import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes/routes';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <AppRoutes />
          </AccessibilityProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
