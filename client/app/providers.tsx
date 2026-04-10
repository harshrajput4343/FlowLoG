'use client';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { SidebarProvider } from '@/contexts/SidebarContext';
import { FlowBot } from '@/components/FlowBot';
import { Analytics } from '@vercel/analytics/next';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SidebarProvider>
          {children}
          <FlowBot />
          <Analytics />
        </SidebarProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
