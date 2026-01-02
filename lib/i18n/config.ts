export type Locale = 'en' | 'es';

export const SUPPORTED_LOCALES: Locale[] = ['es', 'en'];

export const DEFAULT_LOCALE: Locale = 'es';

export const LOCALE_NAMES: Record<Locale, string> = {
  es: 'Español',
  en: 'English',
};
