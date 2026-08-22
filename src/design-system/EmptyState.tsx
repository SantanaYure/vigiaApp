import styles from "./EmptyState.module.css";

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className={styles.container} role="status">
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
    </div>
  );
}
