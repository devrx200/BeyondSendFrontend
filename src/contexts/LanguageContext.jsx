import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('preferredLanguage');
    // If no saved preference, default to Hindi
    const defaultLang = savedLang || 'hi';
    // Set HTML lang attribute immediately
    document.documentElement.lang = defaultLang;
    return defaultLang;
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
    document.documentElement.lang = language;
  }, [language]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hi' ? 'en' :'hi' );
  };
  // Helper function: show Hindi first when isHindi is true
  const t = (en, hi) => (language === 'hi' ? hi : en);

  const value = {
    language,
    setLanguage,
    toggleLanguage,
    isHindi: language === 'hi',
    isEnglish: language === 'en',
    t  // Export the helper function
  };
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

