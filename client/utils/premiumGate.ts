// Premium gate utility — checks localStorage for premium status

export function isPremiumUser(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isPremium') === 'true';
}

export function requirePremium(router: { push: (path: string) => void }): void {
  if (!isPremiumUser()) {
    router.push('/pricing');
  }
}
