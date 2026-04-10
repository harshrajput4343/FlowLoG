import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Board Templates',
  description:
    'Get started fast with FlowLog templates for project management, engineering sprints, marketing, and more.',
  alternates: { canonical: 'https://flowlogwork.me/templates' },
};

export default function TemplatesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
