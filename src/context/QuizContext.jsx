import { createContext, useContext, useMemo, useReducer } from "react";
import words from "../data/words.json";
import { useHistory } from "../hooks/useHistory";
import { generateOptions } from "../utils/generateOptions";
import { shuffle } from "../utils/shuffle";

const TOTAL_QUESTIONS = 30;

const QuizContext = createContext(null);

const Actions = {
  START_QUIZ: "START_QUIZ",
  SUBMIT_ANSWER: "SUBMIT_ANSWER",
  NEXT_QUESTION: "NEXT_QUESTION",
  RESET: "RESET",
  MARK_RESULT_SAVED: "MARK_RESULT_SAVED",
};

const initialState = {
  words,
  session: {
    questions: [],
    currentIndex: 0,
    answers: [],
    status: "idle",
    resultSaved: false,
    startedAt: null,
  },
};

function prepareQuestions(allWords) {
  return shuffle(allWords)
    .slice(0, TOTAL_QUESTIONS)
    .map((word) => ({
      ...word,
      options: generateOptions(word, allWords),
    }));
}

function reducer(state, action) {
  switch (action.type) {
    case Actions.START_QUIZ: {
      return {
        ...state,
        session: {
          questions: prepareQuestions(state.words),
          currentIndex: 0,
          answers: [],
          status: "active",
          resultSaved: false,
          startedAt: Date.now(),
        },
      };
    }

    case Actions.SUBMIT_ANSWER: {
      if (state.session.status !== "active") {
        return state;
      }

      const currentQuestion = state.session.questions[state.session.currentIndex];
      const chosen = action.payload;
      const correct = chosen === currentQuestion.cs;

      return {
        ...state,
        session: {
          ...state.session,
          status: "answered",
          answers: [
            ...state.session.answers,
            {
              wordId: currentQuestion.id,
              en: currentQuestion.en,
              correct,
              chosen,
              correctAnswer: currentQuestion.cs,
            },
          ],
        },
      };
    }

    case Actions.NEXT_QUESTION: {
      if (state.session.status !== "answered") {
        return state;
      }

      const isLastQuestion = state.session.currentIndex >= state.session.questions.length - 1;

      if (isLastQuestion) {
        return {
          ...state,
          session: {
            ...state.session,
            status: "finished",
          },
        };
      }

      return {
        ...state,
        session: {
          ...state.session,
          currentIndex: state.session.currentIndex + 1,
          status: "active",
        },
      };
    }

    case Actions.MARK_RESULT_SAVED: {
      return {
        ...state,
        session: {
          ...state.session,
          resultSaved: true,
        },
      };
    }

    case Actions.RESET: {
      return {
        ...state,
        session: {
          questions: [],
          currentIndex: 0,
          answers: [],
          status: "idle",
          resultSaved: false,
          startedAt: null,
        },
      };
    }

    default:
      return state;
  }
}

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { history, addResult, clearHistory } = useHistory();

  const api = useMemo(
    () => ({
      words: state.words,
      session: state.session,
      history,
      startQuiz: () => dispatch({ type: Actions.START_QUIZ }),
      submitAnswer: (value) => dispatch({ type: Actions.SUBMIT_ANSWER, payload: value }),
      nextQuestion: () => dispatch({ type: Actions.NEXT_QUESTION }),
      resetQuiz: () => dispatch({ type: Actions.RESET }),
      markResultSaved: () => dispatch({ type: Actions.MARK_RESULT_SAVED }),
      addHistoryEntry: addResult,
      clearHistory,
      totalQuestions: TOTAL_QUESTIONS,
    }),
    [history, state.words, state.session, addResult, clearHistory]
  );

  return <QuizContext.Provider value={api}>{children}</QuizContext.Provider>;
}

export function useQuizContext() {
  const context = useContext(QuizContext);
  if (!context) {
    throw new Error("useQuizContext must be used inside QuizProvider");
  }

  return context;
}
