import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/Button/Button";
import { ScoreBadge } from "../../components/ScoreBadge/ScoreBadge";
import { useQuiz } from "../../hooks/useQuiz";
import styles from "./ResultsPage.module.css";

const PLAYER_NAME_KEY = "vocabularyQuizPlayerName";

function getEvaluation(percentage) {
  if (percentage >= 90) {
    return "⭐⭐⭐ Perfektni!";
  }

  if (percentage >= 70) {
    return "⭐⭐ Vyborne!";
  }

  if (percentage >= 50) {
    return "⭐ Dobra prace!";
  }

  return "💪 Zkus to znovu!";
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { session, addHistoryEntry, markResultSaved, resetQuiz, startQuiz, totalQuestions } = useQuiz();
  const [playerName, setPlayerName] = useState(() => window.localStorage.getItem(PLAYER_NAME_KEY) ?? "");
  const [nameError, setNameError] = useState("");

  const correctAnswers = useMemo(() => session.answers.filter((answer) => answer.correct).length, [session.answers]);
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);
  const wrongAnswers = session.answers.filter((answer) => !answer.correct);
  const resultDate = useMemo(() => new Date().toISOString(), []);
  const finishedAt = useMemo(() => Date.now(), []);
  const durationMs = useMemo(() => {
    if (typeof session.startedAt !== "number") {
      return 0;
    }
    return Math.max(0, finishedAt - session.startedAt);
  }, [finishedAt, session.startedAt]);

  useEffect(() => {
    if (session.status !== "finished") {
      navigate("/");
    }
  }, [navigate, session.status]);

  const handleSaveResult = () => {
    if (session.resultSaved) {
      return;
    }

    const trimmedName = playerName.trim();
    if (!trimmedName) {
      setNameError("Zadej prosim jmeno pro zapis do tabulky.");
      return;
    }

    addHistoryEntry({
      date: resultDate,
      name: trimmedName,
      score: correctAnswers,
      total: totalQuestions,
      percentage,
      durationMs,
    });
    markResultSaved();
    window.localStorage.setItem(PLAYER_NAME_KEY, trimmedName);
    setNameError("");
  };

  const playAgain = () => {
    startQuiz();
    navigate("/quiz");
  };

  const goHome = () => {
    resetQuiz();
    navigate("/");
  };

  return (
    <main className={styles.page}>
      <section className={`${styles.card} ${percentage >= 80 ? styles.confetti : ""}`}>
        <h1 className={styles.title}>Vysledky kola</h1>

        <ScoreBadge score={correctAnswers} total={totalQuestions} />
        <p className={styles.evaluation}>{getEvaluation(percentage)}</p>

        <section className={styles.leaderboardSave}>
          <label htmlFor="playerName" className={styles.nameLabel}>
            Jmeno do tabulky skore
          </label>
          <div className={styles.nameRow}>
            <input
              id="playerName"
              className={styles.nameInput}
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              maxLength={24}
              placeholder="Treba Alex"
              disabled={session.resultSaved}
            />
            <Button onClick={handleSaveResult} disabled={session.resultSaved}>
              {session.resultSaved ? "Ulozeno" : "Ulozit do tabulky"}
            </Button>
          </div>
          {nameError && <p className={styles.nameError}>{nameError}</p>}
        </section>

        <section className={styles.wrongListSection}>
          <h2>Chybne zodpovezena slova</h2>
          {wrongAnswers.length === 0 ? (
            <p>Bez chyby! Skvela prace.</p>
          ) : (
            <ul className={styles.wrongList}>
              {wrongAnswers.map((item) => (
                <li key={item.wordId}>
                  <strong>{item.en}</strong> - {item.correctAnswer} (tvoje odpoved: {item.chosen})
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className={styles.actions}>
          <Button onClick={playAgain}>Hrat znovu</Button>
          <Button variant="secondary" onClick={goHome}>
            Domu
          </Button>
        </div>
      </section>
    </main>
  );
}
