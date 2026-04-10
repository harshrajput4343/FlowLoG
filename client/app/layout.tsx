import type { Metadata } from 'next';
import { Inter, Poppins } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });
const poppins = Poppins({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-poppins' });

export const metadata: Metadata = {
  metadataBase: new URL('https://flowlogwork.me'),
  title: {
    default: 'FlowLog – Kanban Project Management',
    template: '%s | FlowLog',
  },
  description:
    'FlowLog is a free Kanban-style project management tool. Organize tasks, track progress, and collaborate with your team using boards, lists, and cards.',
  keywords: [
    'kanban board',
    'project management',
    'task manager',
    'trello alternative',
    'free kanban',
    'team collaboration',
    'flowlog',
  ],
  authors: [{ name: 'FlowLog' }],
  creator: 'FlowLog',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://flowlogwork.me',
    siteName: 'FlowLog',
    title: 'FlowLog – Free Kanban Project Management',
    description:
      'Organize your work with FlowLog. Free Kanban boards, drag-and-drop tasks, checklists, labels, and team collaboration.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FlowLog – Kanban Project Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FlowLog – Free Kanban Project Management',
    description:
      'Organize your work with FlowLog. Free Kanban boards, drag-and-drop tasks, and team collaboration.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://flowlogwork.me',
  },
  icons: {
    icon: '/favicon.svg',
  },
  verification: {
    google: 'vJ5IqwHiH50o5SvRhHcCxklp60ilA953Zx0vUZ9jadU',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover' as const,
  themeColor: '#0a0a14',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} ${poppins.variable}`}>
        <Providers>{children}</Providers>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'FlowLog',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              url: 'https://flowlogwork.me',
              description:
                'Free Kanban-style project management tool with boards, lists, and cards.',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'USD',
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
