/**
 * Simple in-memory rate limiter for API routes.
 * Note: resets on server restart and is per-instance (not shared across Vercel functions).
 * For production at scale, consider Redis-based rate limiting.
 */

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Clean up expired entries every 5 minutes to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
}

interface RateLimitResult {
  limited: boolean;
  remaining: number;
  resetAt: number;
}

export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): RateLimitResult {
  const now = Date.now();
  const entry = rateLimitStore.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + options.windowMs });
    return { limited: false, remaining: options.maxRequests - 1, resetAt: now + options.windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, options.maxRequests - entry.count);
  return {
    limited: entry.count > options.maxRequests,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Extract client IP from request headers.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 'unknown';
}
