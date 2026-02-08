'use client';
import styles from './NotificationPopup.module.css';

interface Props {
  onClose: () => void;
}

export const NotificationPopup = ({ onClose }: Props) => {
  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notifications</h3>
        <div className={styles.toggleWrapper}>
          <span>Only show unread</span>
          <label className={styles.switch}>
            <input type="checkbox" />
            <span className={styles.slider}></span>
          </label>
        </div>
      </div>
      <div className={styles.content}>
        <div className={styles.illustration}>
          {/* Simple SVG placeholder for the Husky/Dog illustration */}
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="#9fadbc" />
          </svg>
        </div>
        <div className={styles.emptyText}>No unread notifications</div>
      </div>
    </div>
  );
};
