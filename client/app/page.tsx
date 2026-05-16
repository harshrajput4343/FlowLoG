'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;

    if (token && token !== 'guest-token') {
      // Authenticated real user → go to dashboard
      router.replace('/dashboard');
    } else if (token === 'guest-token') {
      // Guest session → go to dashboard too
      router.replace('/dashboard');
    } else {
      // No session → show landing page
      router.replace('/landing');
    }
  }, [router]);

  // Minimal splash while redirecting
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#f8f9fb',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#003d9b',
            letterSpacing: '-0.02em',
          }}
        >
          Flow<span style={{ color: '#0052cc' }}>LoG</span>
        </div>
      </div>
    </div>
  );
}
