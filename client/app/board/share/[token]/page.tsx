'use client';
import { notFound, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { BoardCanvas } from '@/components/BoardCanvas';
import { apiClient } from '@/utils/api';
import { Board } from '@/types';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default function SharedBoardPage({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params);
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Check authentication
    const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
    if (!token) {
      router.replace('/login');
      return;
    }
    setAuthenticated(true);

    // Fetch board data using the share token
    apiClient.getBoardByShareToken(resolvedParams.token)
      .then(setBoard)
      .catch((err) => {
        console.error(err);
        setBoard(null);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.token, router]);

  if (loading || !authenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1d2125',
        color: '#b6c2cf',
        fontSize: '14px',
        fontWeight: '500'
      }}>
        Loading shared board...
      </div>
    );
  }

  if (!board) {
    return notFound();
  }

  // Render the board canvas in readOnly mode
  return <BoardCanvas board={board} readOnly={true} />;
}
