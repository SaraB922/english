import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnswerOption } from "../../components/AnswerOption/AnswerOption";
import { ProgressBar } from "../../components/ProgressBar/ProgressBar";
import { useQuiz } from "../../hooks/useQuiz";
import { useSpeech } from "../../hooks/useSpeech";
import styles from "./QuizPage.module.css";

const AUTO_NEXT_DELAY_MS = 1800;
const AUTO_NEXT_TICK_MS = 50;

function getOptionState(option, session, currentQuestion) {
  if (session.status === "active") {
    return "idle";
  }

  const latestAnswer = session.answers[session.answers.length - 1];
  if (option === currentQuestion.cs) {
    return "correct";
  }

  if (!latestAnswer?.correct && option === latestAnswer?.chosen) {
    return "wrong";
  }

  return "disabled";
}

function getMarker(option, session, currentQuestion) {
  if (session.status !== "answered") {
    return "";
  }

  const latestAnswer = session.answers[session.answers.length - 1];

  if (option === currentQuestion.cs) {
    return "✓";
  }

  if (!latestAnswer?.correct && option === latestAnswer?.chosen) {
    return "✗";
  }

  return "";
}

export function QuizPage() {
  const navigate = useNavigate();
  const { session, totalQuestions, submitAnswer, nextQuestion } = useQuiz();
  const [autoNextProgress, setAutoNextProgress] = useState(100);
  const { speak, isSpeaking } = useSpeech();

  useEffect(() => {
    if (session.status === "idle") {
      navigate("/");
      return;
    }

    if (session.status === "finished") {
      navigate("/results");
    }
  }, [navigate, session.status]);

  const currentQuestion = session.questions[session.currentIndex];

  const remainingSeconds = useMemo(
    () => Math.max(0, (AUTO_NEXT_DELAY_MS * autoNextProgress) / 100 / 1000),
    [autoNextProgress]
  );

  useEffect(() => {
    if (session.status !== "answered") {
      setAutoNextProgress(100);
      return;
    }

    const startTime = Date.now();
    const timeoutId = window.setTimeout(() => {
      nextQuestion();
    }, AUTO_NEXT_DELAY_MS);

    const intervalId = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, AUTO_NEXT_DELAY_MS - elapsed);
      setAutoNextProgress((remaining / AUTO_NEXT_DELAY_MS) * 100);
    }, AUTO_NEXT_TICK_MS);

    return () => {
      window.clearTimeout(timeoutId);
      window.clearInterval(intervalId);
    };
  }, [nextQuestion, session.status]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (!currentQuestion) {
        return;
      }

      if (session.status === "active" && ["1", "2", "3"].includes(event.key)) {
        const selected = currentQuestion.options[Number(event.key) - 1];
        if (selected) {
          submitAnswer(selected);
        }
      }

    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [currentQuestion, session.status, submitAnswer]);

  if (!currentQuestion) {
    return null;
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <ProgressBar current={session.currentIndex + 1} total={totalQuestions} />

        <div className={styles.wordRow}>
          <h1 className={styles.word}>"{currentQuestion.en}"</h1>
          <button
            className={`${styles.speakButton} ${isSpeaking ? styles.speakButtonActive : ""}`}
            onClick={() => speak(currentQuestion.en)}
            disabled={isSpeaking}
            aria-label={`Vyslovit slovo ${currentQuestion.en}`}
            title="Spustit vyslovnost"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              width="22"
              height="22"
              aria-hidden="true"
            >
              {isSpeaking ? (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
              ) : (
                <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
              )}
            </svg>
          </button>
        </div>

        <div className={styles.options}>
          {currentQuestion.options.map((option) => {
            const state = getOptionState(option, session, currentQuestion);
            const marker = getMarker(option, session, currentQuestion);
            const isDisabled = session.status === "answered";
            const ariaLabel =
              state === "correct"
                ? `${option}, spravna odpoved`
                : state === "wrong"
                  ? `${option}, spatna odpoved`
                  : option;

            return (
              <AnswerOption
                key={option}
                text={option}
                state={state}
                marker={marker}
                disabled={isDisabled}
                ariaLabel={ariaLabel}
                onClick={() => submitAnswer(option)}
              />
            );
          })}
        </div>

        <p className={styles.feedback} aria-live="polite">
          {session.status === "answered"
            ? session.answers[session.answers.length - 1]?.correct
              ? "Skvele! To je spravne."
              : "Nevadi, priste to vyjde."
            : "Vyber jednu moznost nebo pouzij klavesy 1, 2, 3."}
        </p>

        {session.status === "answered" && (
          <section className={styles.autoNext} aria-live="polite">
            <p className={styles.autoNextLabel}>Dalsi otazka za {remainingSeconds.toFixed(1)} s</p>
            <div className={styles.autoNextTrack} aria-hidden="true">
              <div className={styles.autoNextFill} style={{ width: `${autoNextProgress}%` }} />
            </div>
          </section>
        )}
      </section>
    </main>
  );
}
