import { useEffect, useState } from "react";

const HISTORY_KEY = "vocabularyQuizHistory";
const MAX_RECORDS = 10;

function readFromStorage() {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useHistory() {
  const [history, setHistory] = useState(readFromStorage);

  useEffect(() => {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  }, [history]);

  const addResult = (entry) => {
    setHistory((prev) => {
      const isDuplicate = prev.some(
        (item) =>
          item.date === entry.date &&
          item.name === entry.name &&
          item.score === entry.score &&
          item.total === entry.total &&
          item.percentage === entry.percentage &&
          item.durationMs === entry.durationMs
      );

      if (isDuplicate) {
        return prev;
      }

      return [entry, ...prev].slice(0, MAX_RECORDS);
    });
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return {
    history,
    addResult,
    clearHistory,
  };
}
