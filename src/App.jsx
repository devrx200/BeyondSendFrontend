import { BrowserRouter as Router } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { AuthProvider } from "./contexts/AuthContext";
import LanguageToggleFloating from "./utilities/LanguageToggleFloating";
import FeedbackToggleFloating from "./utilities/FeedbackToggleFloating";
import AppRoutes from "./routes/routes";
import GlobalLinkHandler from "./utilities/GlobalLinkHandler";
import "./css/BeyondSendTheme.scss";
import "./App.scss";
function App() {
  return (
    <Router basename="/">
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
