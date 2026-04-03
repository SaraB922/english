import styles from "./Button.module.css";

export function Button({ children, variant = "primary", className = "", ...rest }) {
  const classes = [styles.button, styles[variant], className].filter(Boolean).join(" ");

  return (
    <button type="button" className={classes} {...rest}>
      {children}
    </button>
  );
}
