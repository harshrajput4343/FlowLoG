'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

type Mode = 'login' | 'set-password';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [newPassword, setNewPassword]   = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [success, setSuccess]           = useState('');
  const [loading, setLoading]           = useState(false);
  const [mode, setMode]                 = useState<Mode>('login');

  // ── Helpers ────────────────────────────────────────────────────────────────

  /** Persists auth info and redirects to dashboard */
  function storeAndRedirect(data: { token: string; user: Record<string, unknown> }) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    if (data.user && typeof data.user.isPremium !== 'undefined') {
      localStorage.setItem('isPremium', data.user.isPremium ? 'true' : 'false');
    }
    router.push('/dashboard');
  }

  // ── Login ───────────────────────────────────────────────────────────────────

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Legacy account — switch to the set-password flow automatically
        if (data.error?.includes('before passwords were enabled')) {
          setMode('set-password');
          setError('');
          return;
        }
        throw new Error(data.error || 'Invalid credentials');
      }

      storeAndRedirect(data);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Set initial password (legacy migration) ─────────────────────────────────

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Email is required.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/auth/set-password`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email, password: newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to set password');

      setSuccess('Password set! Redirecting…');
      storeAndRedirect(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>

        {/* Logo */}
        <div className={styles.loginLogo}>
          <span className={styles.logoFlow}>Flow</span>
          <span className={styles.logoLog}>LoG</span>
        </div>

        {/* ── Set-Password Mode ── */}
        {mode === 'set-password' ? (
          <>
            <h1 className={styles.loginTitle}>Set Your Password</h1>
            <p className={styles.loginSubtitle}>
              Your account was created before passwords were introduced.<br />
              Choose a password to continue.
            </p>

            {error   && <div className={styles.loginError}>{error}</div>}
            {success && <div className={styles.loginSuccess}>{success}</div>}

            <form onSubmit={handleSetPassword} className={styles.loginForm}>
              {/* Email (pre-filled, read-only) */}
              <div className={styles.formGroup}>
                <label htmlFor="sp-email" className={styles.formLabel}>Email</label>
                <input
                  id="sp-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className={styles.formInput}
                  autoComplete="email"
                />
              </div>

              {/* New password */}
              <div className={styles.formGroup}>
                <label htmlFor="sp-new-password" className={styles.formLabel}>New Password</label>
                <input
                  id="sp-new-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={styles.formInput}
                  autoComplete="new-password"
                  autoFocus
                />
              </div>

              {/* Confirm password */}
              <div className={styles.formGroup}>
                <label htmlFor="sp-confirm-password" className={styles.formLabel}>Confirm Password</label>
                <input
                  id="sp-confirm-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className={styles.formInput}
                  autoComplete="new-password"
                />
              </div>

              <label className={styles.showPasswordToggle}>
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={() => setShowPassword(v => !v)}
                />
                {' '}Show passwords
              </label>

              <button type="submit" className={styles.loginBtn} disabled={loading}>
                {loading ? 'Saving…' : 'Set Password & Sign In'}
              </button>
            </form>

            <button
              className={styles.guestBtn}
              onClick={() => { setMode('login'); setError(''); }}
              style={{ marginTop: '12px' }}
            >
              ← Back to login
            </button>
          </>
        ) : (

        /* ── Login Mode ── */
        <>
          <h1 className={styles.loginTitle}>Welcome back</h1>
          <p className={styles.loginSubtitle}>Sign in to continue to your boards</p>

          {error   && <div className={styles.loginError}>{error}</div>}
          {success && <div className={styles.loginSuccess}>{success}</div>}

          <form onSubmit={handleLogin} className={styles.loginForm}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={styles.formLabel}>Email</label>
              <input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={styles.formInput}
                autoFocus
                autoComplete="email"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={styles.formLabel}>Password</label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className={styles.formInput}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button type="submit" className={styles.loginBtn} disabled={loading}>
              {loading ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className={styles.loginFooter}>
            Don&apos;t have an account?{' '}
            <Link href="/signup" className={styles.loginLink}>Sign up</Link>
          </p>
        </>
        )}
      </div>
    </div>
  );
}
