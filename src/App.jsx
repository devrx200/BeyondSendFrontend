import { BrowserRouter as Router } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import LanguageToggleFloating from "./utilies/LanguageToggleFloating";
import FeedbackToggleFloating from "./utilies/FeedbackToggleFloating";
import AppRoutes from './routes/routes';
import './App.css';
function App() {
  return (
    <Router>
      <LanguageProvider>
        <AccessibilityProvider>
          <AppRoutes />
          <LanguageToggleFloating />
          <FeedbackToggleFloating />
        </AccessibilityProvider>
      </LanguageProvider>
    </Router>
  );
}
export default App;
