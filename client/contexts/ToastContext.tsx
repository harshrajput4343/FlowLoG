'use client';
import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType>({ addToast: () => {} });

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Toast Container */}
      {toasts.length > 0 && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          pointerEvents: 'none',
        }}>
          {toasts.map(toast => (
            <div
              key={toast.id}
              style={{
                padding: '12px 20px',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 500,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(8px)',
                animation: 'toastSlideIn 0.3s ease',
                pointerEvents: 'auto',
                background:
                  toast.type === 'success' ? 'linear-gradient(135deg, #059669, #10b981)' :
                  toast.type === 'error' ? 'linear-gradient(135deg, #dc2626, #ef4444)' :
                  toast.type === 'warning' ? 'linear-gradient(135deg, #d97706, #f59e0b)' :
                  'linear-gradient(135deg, #2563eb, #3b82f6)',
                border: '1px solid rgba(255,255,255,0.15)',
                maxWidth: '360px',
              }}
            >
              {toast.type === 'success' && '✓ '}
              {toast.type === 'error' && '✕ '}
              {toast.type === 'warning' && '⚠ '}
              {toast.type === 'info' && 'ℹ '}
              {toast.message}
            </div>
          ))}
        </div>
      )}
      <style>{`
        @keyframes toastSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
