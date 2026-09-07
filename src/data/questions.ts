import type { MultipleChoiceQuestion } from "@/components/question-modules/multiple-choice";
import type { TextAnswerQuestion } from "@/components/question-modules/text-answer";

type QuestionMeta = {
  category: string;
  difficulty: number;
};

export type Question =
  | (MultipleChoiceQuestion & QuestionMeta)
  | (TextAnswerQuestion & QuestionMeta);

export type QuestionFilters = {
  language?: string;
  difficulties?: number[];
  categories?: string[];
};

/**
 * Distinct categories present in the given questions, sorted for display.
 * Questions now come from whichever installed pack the user picks, so the
 * category list is derived per-pack at runtime rather than from a bundled file.
 */
export function getCategories(questions: Question[]): string[] {
  return Array.from(new Set(questions.map((q) => q.category))).sort();
}

export function filterQuestions(
  questions: Question[],
  { language = "all", difficulties = [], categories = [] }: QuestionFilters = {},
): Question[] {
  return questions.filter(
    (q) =>
      (language === "all" || q.language === language) &&
      (difficulties.length === 0 || difficulties.includes(q.difficulty)) &&
      (categories.length === 0 || categories.includes(q.category)),
  );
}
