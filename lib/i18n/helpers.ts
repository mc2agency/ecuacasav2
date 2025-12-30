import type { Locale } from './config';

/**
 * Helper function to get localized field from an entity
 * Replaces the pattern: {locale === 'en' ? entity.field_en : entity.field_es}
 *
 * @example
 * // Instead of: {locale === 'en' ? service.name_en : service.name_es}
 * // Use: {getLocalizedField(service, 'name', locale)}
 */
export function getLocalizedField<T extends Record<string, any>>(
  entity: T,
  fieldName: string,
  locale: Locale
): string {
  const key = `${fieldName}_${locale}`;
  const fallbackKey = `${fieldName}_en`;

  // Return localized field or fallback to English or empty string
  return entity[key] || entity[fallbackKey] || '';
}
