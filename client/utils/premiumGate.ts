/**
 * Premium gate utility
 *
 * BUG 2 NOTE: This file provides UX-layer hints only.
 * The real security enforcement is server-side:
 *   - PUT /api/boards/:id  → rejects image backgrounds for non-premium users
 *   - POST /api/invitations → rejects non-premium users
 *   - (templates are static data, the server has no endpoint to gate)
 *
 * Do NOT rely on these functions for access control. They exist purely to
 * show/hide UI elements and redirect users to the pricing page.
 *
 * The isPremium flag is written to localStorage by the auth flow after
 * calling GET /api/auth/me — it reflects the server's DB value at login time.
 */

export function isPremiumUser(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isPremium') === 'true';
}

/**
 * Syncs the isPremium flag from the server response into localStorage.
 * Call this after login or after fetching /api/auth/me.
 */
export function syncPremiumStatus(isPremium: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('isPremium', isPremium ? 'true' : 'false');
}

export function requirePremium(router: { push: (path: string) => void }): void {
  if (!isPremiumUser()) {
    router.push('/pricing');
  }
}
