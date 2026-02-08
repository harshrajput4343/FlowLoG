'use client';
import { Label, User } from '@/types';
import styles from './FilterPopup.module.css';

interface Props {
  labels: Label[];
  members: User[];
  activeLabel: number | null;
  activeMember: number | null;
  onSelectLabel: (id: number | null) => void;
  onSelectMember: (id: number | null) => void;
  onClose: () => void;
}

export const FilterPopup = ({
  labels,
  members,
  activeLabel,
  activeMember,
  onSelectLabel,
  onSelectMember,
  onClose
}: Props) => {
  return (
    <div className={styles.popup}>
      <div className={styles.header}>
        <h4 className={styles.title}>Filter</h4>
        <button className={styles.closeBtn} onClick={onClose}>×</button>
      </div>
      <div className={styles.content}>
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Labels</div>
          {labels.map(label => (
            <div
              key={label.id}
              className={styles.option}
              onClick={() => onSelectLabel(activeLabel === label.id ? null : label.id)}
            >
              <div
                className={`${styles.checkbox} ${activeLabel === label.id ? styles.checked : ''}`}
              >
                {activeLabel === label.id && '✓'}
              </div>
              <div
                className={styles.labelColor}
                style={{ backgroundColor: label.color }}
              />
            </div>
          ))}
        </div>

        <div className={styles.section}>
          <div className={styles.sectionTitle}>Members</div>
          {members.map(member => (
            <div
              key={member.id}
              className={styles.option}
              onClick={() => onSelectMember(activeMember === member.id ? null : member.id)}
            >
              <div
                className={`${styles.checkbox} ${activeMember === member.id ? styles.checked : ''}`}
              >
                {activeMember === member.id && '✓'}
              </div>
              <div className={styles.memberAvatar}>
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" className={styles.memberAvatar} />
                ) : (
                  member.name[0]
                )}
              </div>
              <span className={styles.memberName}>{member.name}</span>
            </div>
          ))}
        </div>

        {(activeLabel || activeMember) && (
          <button
            className={styles.clearBtn}
            onClick={() => {
              onSelectLabel(null);
              onSelectMember(null);
            }}
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
};
