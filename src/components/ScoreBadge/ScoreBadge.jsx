import styles from "./ScoreBadge.module.css";

export function ScoreBadge({ score, total }) {
  const percentage = Math.round((score / total) * 100);

  return (
    <div className={styles.badge}>
      <p className={styles.score}>
        {score} / {total}
      </p>
      <p className={styles.percentage}>{percentage}%</p>
    </div>
  );
}
