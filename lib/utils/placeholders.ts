/**
 * Get placeholder avatar image for provider
 * Uses UI Avatars API for deterministic placeholder images
 */
export function getProviderPlaceholder(name: string): string {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2563eb&color=fff&size=256&bold=true`;
}

/**
 * Get hero background image
 * Returns path to hero image (Cuenca cityscape or provider photo)
 */
export function getHeroImage(): string {
  // Using SVG placeholder for hero background
  // In production, replace with actual hero image
  return '/images/hero-cuenca.svg';
}

/**
 * Get testimonial avatar placeholder
 */
export function getTestimonialAvatar(name: string): string {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&size=96`;
}

/**
 * Get generic placeholder image with blurhash data URL
 * Useful for Next.js Image placeholder prop
 */
export function getBlurDataURL(): string {
  // Light blue gradient blur placeholder
  return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiNlZmY2ZmY7c3RvcC1vcGFjaXR5OjEiIC8+PHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojZGJlYWZlO3N0b3Atb3BhY2l0eToxIiAvPjwvbGluZWFyR3JhZGllbnQ+PC9kZWZzPjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIiBmaWxsPSJ1cmwoI2cpIiAvPjwvc3ZnPg==';
}
