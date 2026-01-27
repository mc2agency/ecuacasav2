/**
 * Lightweight analytics client — fire-and-forget, never blocks UI.
 */

function track(eventType: string, data: Record<string, any> = {}) {
  try {
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_type: eventType, ...data }),
    }).catch(() => {});
  } catch {
    // silently fail
  }
}

export function trackPageView(page: string, locale?: string) {
  track('page_view', { page, locale, referrer: document.referrer, user_agent: navigator.userAgent });
}

export function trackWhatsAppClick(providerSlug: string) {
  track('whatsapp_click', { provider_slug: providerSlug });
}

export function trackProviderView(providerSlug: string) {
  track('provider_view', { provider_slug: providerSlug });
}

export function trackSearch(query: string) {
  track('search', { metadata: { query } });
}

export function trackEvent(eventType: string, metadata: Record<string, any> = {}) {
  track(eventType, { metadata });
}
