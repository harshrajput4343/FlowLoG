'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './page.module.css';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('All fields are required.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api'}/auth/signup`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Signup failed');
      }

      const data = await res.json();
      localStorage.setItem('authToken', data.token || 'logged-in');
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.signupPage}>
      <div className={styles.signupCard}>
        <div className={styles.signupLogo}>
          <span className={styles.logoFlow}>Flow</span>
          <span className={styles.logoLog}>LoG</span>
        </div>
        <h1 className={styles.signupTitle}>Create your account</h1>
        <p className={styles.signupSubtitle}>Join FlowLog to start organizing your work</p>

        {error && (
          <div className={styles.signupError}>{error}</div>
        )}

        <form onSubmit={handleSignup} className={styles.signupForm}>
          <div className={styles.formGroup}>
            <label htmlFor="name" className={styles.formLabel}>Full Name</label>
            <input
              id="name"
              type="text"
              placeholder="Your Name"
              value={name}
              onChange={e => setName(e.target.value)}
              className={styles.formInput}
              autoFocus
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.formLabel}>Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className={styles.formInput}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>Password</label>
            <div className={styles.passwordWrapper}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={styles.formInput}
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
          <button
            type="submit"
            className={styles.signupBtn}
            disabled={loading}
          >
            {loading ? 'Creating account...' : 'Sign up'}
          </button>
        </form>

        <p className={styles.signupFooter}>
          Already have an account?{' '}
          <Link href="/login" className={styles.signupLink}>Log in</Link>
        </p>
      </div>
    </div>
  );
}
