import { shuffle } from "./shuffle";

export function generateOptions(correctWord, allWords) {
  const distractors = shuffle(allWords.filter((word) => word.id !== correctWord.id)).slice(0, 2);

  return shuffle([correctWord.cs, distractors[0].cs, distractors[1].cs]);
}
