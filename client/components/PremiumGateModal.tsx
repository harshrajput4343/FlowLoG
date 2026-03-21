'use client';
import { useRouter } from 'next/navigation';
import styles from './PremiumGateModal.module.css';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  featureName: string;
}

export const PremiumGateModal = ({ isOpen, onClose, featureName }: Props) => {
  const router = useRouter();

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <button className={styles.closeBtn} onClick={onClose}>×</button>

        <div className={styles.crownIcon}>👑</div>
        <h2 className={styles.title}>This is a Pro Feature</h2>
        <p className={styles.description}>
          <strong>{featureName}</strong> is available exclusively for Pro members.
          Upgrade to unlock this and all premium features.
        </p>

        <div className={styles.priceTag}>
          <span className={styles.price}>$9</span>
          <span className={styles.period}>/year</span>
        </div>

        <div className={styles.features}>
          <div className={styles.featureItem}>✓ Unlimited boards</div>
          <div className={styles.featureItem}>✓ Dynamic image backgrounds</div>
          <div className={styles.featureItem}>✓ Member invitations</div>
          <div className={styles.featureItem}>✓ Premium templates</div>
          <div className={styles.featureItem}>✓ Advanced labels</div>
        </div>

        <button
          className={styles.upgradeBtn}
          onClick={() => { onClose(); router.push('/pricing'); }}
        >
          Upgrade Now
        </button>
        <button className={styles.laterBtn} onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </div>
  );
};
