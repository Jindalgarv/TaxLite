"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en'); // 'en', 'hi', 'hn'

  useEffect(() => {
    // Check local storage for saved language
    const saved = localStorage.getItem('taxlite_lang');
    if (saved) setLanguage(saved);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('taxlite_lang', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
