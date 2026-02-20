'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api'}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid credentials');
      }
      const data = await res.json();
      // Store token and user info
      localStorage.setItem('authToken', data.token || 'logged-in');
      localStorage.setItem('user', JSON.stringify(data.user || { email }));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Guest / demo login — bypass auth for demo purposes
  const handleGuestLogin = () => {
    localStorage.setItem('authToken', 'guest-token');
    localStorage.setItem('user', JSON.stringify({ name: 'Guest', email: 'guest@flowlog.app' }));
    router.push('/');
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginCard}>
        {/* Logo */}
        <div className={styles.loginLogo}>
          <span className={styles.logoFlow}>Flow</span>
          <span className={styles.logoLog}>LoG</span>
        </div>
        <h1 className={styles.loginTitle}>Welcome back</h1>
        <p className={styles.loginSubtitle}>Sign in to continue to your boards</p>

        {error && (
          <div className={styles.loginError}>{error}</div>
        )}

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
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className={styles.formInput}
              autoComplete="current-password"
            />
          </div>
          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className={styles.loginDivider}><span>or</span></div>

        <button
          className={styles.guestBtn}
          onClick={handleGuestLogin}
        >
          Continue as Guest
        </button>

        <p className={styles.loginFooter}>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className={styles.loginLink}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
