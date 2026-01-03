'use client';

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Locale, getTranslation } from '@/lib/translations';

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

function detectBrowserLanguage(): Locale {
  if (typeof navigator === 'undefined') return 'en';

  // Get browser language
  const browserLang = navigator.language || (navigator as any).userLanguage || '';

  // Check if Spanish (es, es-ES, es-EC, etc.)
  if (browserLang.toLowerCase().startsWith('es')) {
    return 'es';
  }

  // Default to English for expats
  return 'en';
}

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    // Check localStorage first, then browser language
    const saved = localStorage.getItem('locale');

    if (saved === 'es' || saved === 'en') {
      // User has explicitly chosen a language
      setLocaleState(saved);
    } else {
      // No saved preference, auto-detect from browser
      const detected = detectBrowserLanguage();
      setLocaleState(detected);
      // Don't save auto-detected - let user explicitly choose
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('locale', newLocale);
  };

  const t = (key: string) => getTranslation(key, locale);

  const contextValue = {
    locale,
    setLocale,
    t,
  };

  return (
    <TranslationContext.Provider value={contextValue}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
}
