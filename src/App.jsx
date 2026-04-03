import { Navigate, Route, Routes } from "react-router-dom";
import { QuizProvider } from "./context/QuizContext";
import { QuizPage } from "./pages/QuizPage/QuizPage";
import { ResultsPage } from "./pages/ResultsPage/ResultsPage";
import { StartPage } from "./pages/StartPage/StartPage";

function App() {
  return (
    <QuizProvider>
      <Routes>
        <Route path="/" element={<StartPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </QuizProvider>
  );
}

export default App;
