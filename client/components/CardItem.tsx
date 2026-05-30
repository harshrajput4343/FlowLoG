'use client';
import { Draggable } from '@hello-pangea/dnd';
import { Card } from '@/types';
import styles from './CardItem.module.css';

interface Props {
  card: Card;
  index: number;
  onClick: () => void;
  readOnly?: boolean;
}

export const CardItem = ({ card, index, onClick, readOnly = false }: Props) => {
  const completedChecks = card.checklists?.reduce((acc, list) =>
    acc + list.items.filter(i => i.isChecked).length, 0) || 0;
  const totalChecks = card.checklists?.reduce((acc, list) =>
    acc + list.items.length, 0) || 0;

  return (
    <Draggable draggableId={card.id.toString()} index={index} isDragDisabled={readOnly}>
      {(provided, snapshot) => (
        <div
          className={`${styles.card} ${snapshot.isDragging ? styles.dragging : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...(readOnly ? {} : provided.dragHandleProps)}
          onClick={onClick}
        >
          {card.coverUrl && (
            <div
              className={styles.cover}
              style={{ backgroundImage: `url(${card.coverUrl})` }}
            />
          )}

          <div className={styles.cardContent}>
            {card.labels && card.labels.length > 0 && (
              <div className={styles.labels}>
                {card.labels.map(label => (
                  <div
                    key={label.id}
                    className={styles.label}
                    style={{ backgroundColor: label.color }}
                    title={label.name}
                  />
                ))}
              </div>
            )}

            <div className={styles.title}>{card.title}</div>

            {!readOnly && <button className={styles.actionBtn}>✎</button>}

            {(card.dueDate || (card.members && card.members.length > 0) || totalChecks > 0 || card.description) && (
              <div className={styles.meta}>
                {card.dueDate && (
                  <div className={`${styles.dueDate} ${new Date(card.dueDate) < new Date() ? styles.overdue : ''}`}>
                    🕒 {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                )}
                {card.description && (
                  <div className={styles.metaItem} title="This card has a description">
                    ≡
                  </div>
                )}
                {totalChecks > 0 && (
                  <div
                    className={styles.metaItem}
                    title="Checklist items"
                    style={completedChecks === totalChecks ? { color: '#61bd4f', fontWeight: 600 } : undefined}
                  >
                    {completedChecks === totalChecks ? '✅' : '☑'} {completedChecks}/{totalChecks}
                  </div>
                )}
                {card.members && card.members.length > 0 && (
                  <div className={styles.members}>
                    {card.members.map(member => (
                      <div key={member.id} className={styles.memberAvatar}>
                        {member.avatarUrl ? (
                          <img src={member.avatarUrl} alt="" className={styles.memberAvatar} />
                        ) : (
                          member.name[0]
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};
