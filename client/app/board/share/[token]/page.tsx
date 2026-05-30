'use client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { BoardCanvas } from '@/components/BoardCanvas';
import { apiClient } from '@/utils/api';
import { Board } from '@/types';

interface PageProps {
  params: Promise<{ token: string }>;
}

type Status = 'loading' | 'unauthenticated' | 'not_found' | 'error' | 'ready';

export default function SharedBoardPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [board, setBoard] = useState<Board | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  useEffect(() => {
    // Must be logged in to view shared boards
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      // Save intended destination so login can redirect back
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
      }
      router.replace('/login');
      return;
    }

    // Fetch board data using the share token (public API endpoint)
    apiClient.getBoardByShareToken(resolvedParams.token)
      .then((data) => {
        setBoard(data);
        setStatus('ready');
      })
      .catch((err: Error) => {
        console.error('Failed to load shared board:', err);
        if (err.message.includes('404') || err.message.toLowerCase().includes('not found')) {
          setStatus('not_found');
        } else {
          setStatus('error');
        }
      });
  }, [resolvedParams.token, router]);

  // Loading state
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1d2125',
        color: '#b6c2cf',
        fontSize: '14px',
        fontWeight: '500',
        gap: '12px',
        flexDirection: 'column',
      }}>
        <div style={{
          width: '32px',
          height: '32px',
          border: '3px solid rgba(87,157,255,0.2)',
          borderTopColor: '#579dff',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        Loading shared board...
      </div>
    );
  }

  // Board not found
  if (status === 'not_found') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1d2125',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px' }}>🔗</div>
        <h1 style={{ color: '#b6c2cf', fontSize: '20px', fontWeight: '700', margin: 0 }}>
          Share link not found
        </h1>
        <p style={{ color: '#9fadbc', fontSize: '14px', margin: 0, maxWidth: '360px', lineHeight: '1.5' }}>
          This share link is invalid or has been removed. Ask the board owner for a new link.
        </p>
        <button
          onClick={() => router.push('/')}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            background: '#579dff',
            color: '#1d2125',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // Generic error state
  if (status === 'error') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1d2125',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <h1 style={{ color: '#b6c2cf', fontSize: '20px', fontWeight: '700', margin: 0 }}>
          Could not load board
        </h1>
        <p style={{ color: '#9fadbc', fontSize: '14px', margin: 0, maxWidth: '360px', lineHeight: '1.5' }}>
          There was a problem loading this shared board. Please try again.
        </p>
        <button
          onClick={() => router.refresh()}
          style={{
            marginTop: '8px',
            padding: '10px 20px',
            background: '#579dff',
            color: '#1d2125',
            border: 'none',
            borderRadius: '6px',
            fontWeight: '600',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Render the board canvas in readOnly mode
  if (!board) return null;
  return <BoardCanvas board={board} readOnly={true} />;
}
