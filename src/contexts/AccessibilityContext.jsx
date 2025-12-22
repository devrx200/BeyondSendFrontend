import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'normal';
  });

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    
    // Apply font size to root element
    const root = document.documentElement;
    root.classList.remove('font-normal', 'font-large', 'font-larger');
    
    if (fontSize === 'large') {
      root.classList.add('font-large');
    } else if (fontSize === 'larger') {
      root.classList.add('font-larger');
    } else {
      root.classList.add('font-normal');
    }
  }, [fontSize]);

  const increaseFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('larger');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'larger') setFontSize('large');
    else if (fontSize === 'large') setFontSize('normal');
  };

  const resetFontSize = () => {
    setFontSize('normal');
  };

  const value = {
    fontSize,
    increaseFontSize,
    decreaseFontSize,
    resetFontSize,
    isNormal: fontSize === 'normal',
    isLarge: fontSize === 'large',
    isLarger: fontSize === 'larger'
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
};

