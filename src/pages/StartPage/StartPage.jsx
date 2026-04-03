import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { useQuiz } from "../../hooks/useQuiz";
import styles from "./StartPage.module.css";

function formatDuration(durationMs) {
  if (typeof durationMs !== "number" || durationMs <= 0) {
    return "-";
  }

  const totalSeconds = Math.round(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function StartPage() {
  const navigate = useNavigate();
  const { history, startQuiz, clearHistory } = useQuiz();

  const leaderboard = useMemo(
    () =>
      [...history]
        .sort((a, b) => {
          if (b.score !== a.score) {
            return b.score - a.score;
          }

          const aDuration = typeof a.durationMs === "number" ? a.durationMs : Number.POSITIVE_INFINITY;
          const bDuration = typeof b.durationMs === "number" ? b.durationMs : Number.POSITIVE_INFINITY;
          if (aDuration !== bDuration) {
            return aDuration - bDuration;
          }

          return new Date(b.date).getTime() - new Date(a.date).getTime();
        })
        .slice(0, 10),
    [history]
  );

  const best = leaderboard[0] ?? { score: 0, total: 30 };

  const handleStart = () => {
    startQuiz();
    navigate("/quiz");
  };

  const handleClearLeaderboard = () => {
    const confirmed = window.confirm("Opravdu chces vymazat celou tabulku skore?");
    if (!confirmed) {
      return;
    }

    clearHistory();
  };

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <h1 className={styles.title}>Vocabulary Quiz</h1>
        <p className={styles.lead}>
          Procvicuj anglicka slovicka v 30 otazkach. Vyber vzdy spravny cesky preklad.
        </p>

        {leaderboard.length > 0 && (
          <p className={styles.best}>
            Nejlepsi skore: {best.score}/{best.total}
          </p>
        )}

        <Button onClick={handleStart} className={styles.startButton}>
          Zacit kviz
        </Button>

        {leaderboard.length > 0 && (
          <section className={styles.history}>
            <h2>Top skore</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Jmeno</th>
                    <th>Skore</th>
                    <th>Cas</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((item, index) => (
                    <tr key={`${item.date}-${index}`}>
                      <td>{index + 1}.</td>
                      <td>{item.name || "Anonym"}</td>
                      <td>
                        {item.score}/{item.total}
                      </td>
                      <td>{formatDuration(item.durationMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button variant="secondary" className={styles.clearButton} onClick={handleClearLeaderboard}>
              Vymazat tabulku
            </Button>
          </section>
        )}
      </section>
    </main>
  );
}
