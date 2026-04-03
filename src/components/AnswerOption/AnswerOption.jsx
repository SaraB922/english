import styles from "./AnswerOption.module.css";

const stateMap = {
  idle: "",
  correct: styles.correct,
  wrong: styles.wrong,
  disabled: styles.disabled,
};

export function AnswerOption({ text, state = "idle", onClick, disabled, marker, ariaLabel }) {
  return (
    <button
      type="button"
      className={`${styles.option} ${stateMap[state] ?? ""}`.trim()}
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
    >
      <span className={styles.marker}>{marker}</span>
      <span>{text}</span>
    </button>
  );
}
