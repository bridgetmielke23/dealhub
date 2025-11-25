/**
 * Simple authentication helper
 * For production, consider using NextAuth.js or Supabase Auth
 */

/**
 * Check if request is authenticated (simple password check)
 */
export function isAuthenticated(request: Request): boolean {
  const authHeader = request.headers.get('authorization');
  const adminPassword = process.env.ADMIN_PASSWORD;

  // If no password is set, allow access (for development)
  if (!adminPassword) {
    return true;
  }

  return authHeader === `Bearer ${adminPassword}`;
}

/**
 * Get auth token from request
 */
export function getAuthToken(request: Request): string | null {
  return request.headers.get('authorization')?.replace('Bearer ', '') || null;
}

