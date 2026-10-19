import { BrowserRouter as Router } from "react-router-dom";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AccessibilityProvider } from "./contexts/AccessibilityContext";
import { AuthProvider } from "./contexts/AuthContext";
import LanguageToggleFloating from "./utilities/LanguageToggleFloating";
import FeedbackToggleFloating from "./utilities/FeedbackToggleFloating";
import AppRoutes from "./routes/routes";
import GlobalLinkHandler from "./utilities/GlobalLinkHandler";
import { ToastContainer } from "./utilities/WPToast";
import "./assets/css/BeyondSendTheme.scss";
import "./App.scss";
import './assets/css/enterprise-design.scss';
import "./assets/css/PublicPagesPolish.scss";
function App() {
  return (
    <Router basename="/">
      <AuthProvider>
        <LanguageProvider>
          <AccessibilityProvider>
            <AppRoutes />
            <GlobalLinkHandler />
            <ToastContainer />
            <LanguageToggleFloating />
            <FeedbackToggleFloating />
          </AccessibilityProvider>
        </LanguageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
