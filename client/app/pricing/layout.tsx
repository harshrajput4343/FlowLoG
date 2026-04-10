import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing – FlowLog Pro',
  description:
    'Upgrade to FlowLog Pro for just $9/year. Unlimited boards, image backgrounds, premium templates, and more.',
  alternates: { canonical: 'https://flowlogwork.me/pricing' },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
