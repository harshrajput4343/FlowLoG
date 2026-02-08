'use client';
import { notFound } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import { BoardCanvas } from '@/components/BoardCanvas';
import { apiClient } from '@/utils/api';
import { Board } from '@/types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function BoardPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const [board, setBoard] = useState<Board | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.getBoard(parseInt(resolvedParams.id))
      .then(setBoard)
      .catch((err) => {
        console.error(err);
        setBoard(null);
      })
      .finally(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#1d2125',
        color: '#b6c2cf'
      }}>
        Loading board...
      </div>
    );
  }

  if (!board) {
    return notFound();
  }

  return <BoardCanvas board={board} />;
}
