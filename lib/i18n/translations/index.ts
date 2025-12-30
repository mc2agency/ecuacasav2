import { en } from './en';
import { es } from './es';

export const TRANSLATIONS = {
  en,
  es,
} as const;

export type TranslationKey = keyof typeof en;
export type Translations = typeof TRANSLATIONS;
