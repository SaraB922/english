import styles from "./ProgressBar.module.css";

export function ProgressBar({ current, total }) {
  const percentage = Math.round((current / total) * 100);

  let milestone = "";
  if (current >= 20 && current < total) {
    milestone = "⚡ Jsi v druhe pulce!";
  } else if (current >= 10 && current < 20) {
    milestone = "🔥 Pokracuj tak!";
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.infoRow}>
        <span>
          Otazka {current} / {total}
        </span>
        <span>{percentage}%</span>
      </div>
      <div className={styles.track} aria-hidden="true">
        <div className={styles.fill} style={{ width: `${percentage}%` }} />
      </div>
      <p className={styles.milestone} aria-live="polite">
        {milestone}
      </p>
    </div>
  );
}
