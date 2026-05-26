import { BrowserRouter as Router } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { AuthProvider } from "./contexts/AuthContext";
import LanguageToggleFloating from "./utilies/LanguageToggleFloating";
import FeedbackToggleFloating from "./utilies/FeedbackToggleFloating";
import AppRoutes from "./routes/routes";
import GlobalLinkHandler from "./utilies/GlobalLinkHandler";
import "./App.css";
function App() {
  return (
    <Router basename="/hesite">
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <AppRoutes />
            <GlobalLinkHandler />
            <LanguageToggleFloating />
            <FeedbackToggleFloating />
          </AccessibilityProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
