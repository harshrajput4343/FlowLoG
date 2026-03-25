'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { apiClient } from '@/utils/api';
import { useToast } from '@/contexts/ToastContext';
import styles from './page.module.css';

export default function PricingPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [isPremium, setIsPremium] = useState(false);
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    // Sync status from API
    apiClient.getSubscriptionStatus().then(data => {
      setIsPremium(data.isPremium);
      setSubscriptionExpiry(data.subscriptionExpiry);
      if (typeof window !== 'undefined') {
        localStorage.setItem('isPremium', String(data.isPremium));
        if (data.subscriptionExpiry) {
          localStorage.setItem('subscriptionExpiry', data.subscriptionExpiry);
        }
      }
    }).catch(() => {});
  }, []);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3001/api';

  const getAuthHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('authToken');
      if (token) headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  };

  const getCurrentUserEmail = (): string => {
    if (typeof window === 'undefined') return '';
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user.email || '';
    } catch { return ''; }
  };

  const handleUpgrade = async () => {
    setLoading(true);
    try {
      // Step 1: Create order
      const res = await fetch(`${API_URL}/payment/create-order`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      const data = await res.json();

      if (!res.ok) {
        // Fallback to old upgrade if Razorpay is not configured
        if (res.status === 503) {
          const result = await apiClient.upgradeSubscription();
          setIsPremium(true);
          setSubscriptionExpiry(result.subscriptionExpiry);
          localStorage.setItem('isPremium', 'true');
          localStorage.setItem('subscriptionExpiry', result.subscriptionExpiry);
          addToast('🎉 Welcome to FlowLog Pro! All premium features are now unlocked.', 'success');
          setLoading(false);
          return;
        }
        throw new Error(data.error || 'Failed to create order');
      }

      const { orderId, amount, currency, keyId } = data;

      // Step 2: Load Razorpay script dynamically
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      document.body.appendChild(script);
      script.onload = () => {
        const options = {
          key: keyId,
          amount,
          currency,
          name: 'FlowLog Pro',
          description: 'Annual Subscription',
          order_id: orderId,
          handler: async (response: any) => {
            // Step 3: Verify payment
            try {
              const verifyRes = await fetch(`${API_URL}/payment/verify`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(response),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setIsPremium(true);
                localStorage.setItem('isPremium', 'true');
                addToast('🎉 Payment successful! Welcome to FlowLog Pro!', 'success');
              } else {
                addToast('Payment verification failed. Contact support.', 'error');
              }
            } catch {
              addToast('Payment verification failed. Please contact support.', 'error');
            }
            setLoading(false);
          },
          prefill: {
            email: getCurrentUserEmail(),
          },
          theme: { color: '#f59e0b' },
          modal: {
            ondismiss: () => {
              setLoading(false);
            },
          },
        };
        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      };
      script.onerror = () => {
        addToast('Failed to load payment gateway. Please try again.', 'error');
        setLoading(false);
      };
    } catch (err) {
      addToast('Payment failed. Please try again.', 'error');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await apiClient.cancelSubscription();
      setIsPremium(false);
      setSubscriptionExpiry(null);
      localStorage.setItem('isPremium', 'false');
      localStorage.removeItem('subscriptionExpiry');
      addToast('Subscription cancelled.', 'info');
    } catch (err) {
      addToast('Failed to cancel. Please try again.', 'error');
    }
    setCancelling(false);
  };

  const features = [
    { icon: '📋', text: 'Unlimited boards' },
    { icon: '🖼️', text: 'Dynamic image backgrounds (Unsplash)' },
    { icon: '👥', text: 'Member invitations' },
    { icon: '⚡', text: 'Premium templates' },
    { icon: '🏷️', text: 'Advanced labels & filters' },
    { icon: '📊', text: 'Priority support' },
  ];

  return (
    <div className={styles.layoutContainer}>
      <Header />
      <div className={styles.contentContainer}>
        <Sidebar />
        <main className={styles.mainContent}>
          <div className={styles.pricingHeader}>
            <h1 className={styles.heroTitle}>
              Supercharge your workflow
            </h1>
            <p className={styles.heroSubtitle}>
              Unlock the full power of FlowLog with Pro. Get unlimited boards,
              premium templates, image backgrounds, and more.
            </p>
          </div>

          <div className={styles.cardContainer}>
            {/* Free Plan */}
            <div className={styles.planCard}>
              <div className={styles.planBadge}>Current</div>
              <h2 className={styles.planName}>Free</h2>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>$0</span>
                <span className={styles.pricePeriod}>/forever</span>
              </div>
              <ul className={styles.planFeatures}>
                <li className={styles.planFeature}>✓ Up to 10 boards</li>
                <li className={styles.planFeature}>✓ Basic backgrounds</li>
                <li className={styles.planFeature}>✓ Checklists & labels</li>
                <li className={styles.planFeature}>✓ Card management</li>
                <li className={`${styles.planFeature} ${styles.disabled}`}>✕ Image backgrounds</li>
                <li className={`${styles.planFeature} ${styles.disabled}`}>✕ Member invitations</li>
                <li className={`${styles.planFeature} ${styles.disabled}`}>✕ Premium templates</li>
              </ul>
            </div>

            {/* Pro Plan */}
            <div className={`${styles.planCard} ${styles.proPlan}`}>
              <div className={styles.proBadge}>👑 PRO</div>
              <div className={styles.bestValueBadge}>⭐ Best Value</div>
              {isPremium && <div className={styles.activeBadge}>Active</div>}
              <h2 className={styles.planName}>Pro</h2>
              <div className={styles.planPrice}>
                <span className={styles.priceAmount}>$9</span>
                <span className={styles.pricePeriod}>/year</span>
              </div>
              <div className={styles.savingsText}>Less than $1/month</div>
              <ul className={styles.planFeatures}>
                {features.map((f, i) => (
                  <li key={i} className={styles.planFeature}>
                    {f.icon} {f.text}
                  </li>
                ))}
              </ul>

              {isPremium ? (
                <div className={styles.activeSection}>
                  <div className={styles.activeStatus}>
                    ✅ You&apos;re on the Pro plan
                  </div>
                  {subscriptionExpiry && (
                    <div className={styles.expiryText}>
                      Renews on {new Date(subscriptionExpiry).toLocaleDateString('en-US', {
                        month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </div>
                  )}
                  <button
                    className={styles.cancelBtn}
                    onClick={handleCancel}
                    disabled={cancelling}
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                </div>
              ) : (
                <button
                  className={styles.upgradeBtn}
                  onClick={handleUpgrade}
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.loadingDots}>Processing...</span>
                  ) : (
                    'Upgrade to Pro'
                  )}
                </button>
              )}
            </div>
          </div>

          <div className={styles.faqSection}>
            <h3 className={styles.faqTitle}>Frequently Asked Questions</h3>
            <div className={styles.faqGrid}>
              <div className={styles.faqItem}>
                <h4>Can I cancel anytime?</h4>
                <p>Yes, you can cancel your annual subscription at any time. You&apos;ll continue to have access until the end of your billing year.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>What payment methods do you accept?</h4>
                <p>We accept all major credit cards, debit cards, and PayPal.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>Is there a free trial?</h4>
                <p>The free plan gives you a taste of FlowLog. Upgrade to Pro for just $9/year when you&apos;re ready for more power.</p>
              </div>
              <div className={styles.faqItem}>
                <h4>Can I switch plans?</h4>
                <p>You can upgrade or downgrade at any time. Changes take effect immediately.</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
