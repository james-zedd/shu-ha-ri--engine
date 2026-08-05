import raw from './questions.json';

import type { MultipleChoiceQuestion } from '@/components/question-modules/multiple-choice';
import type { TextAnswerQuestion } from '@/components/question-modules/text-answer';

type QuestionMeta = {
  category: string;
  difficulty: number;
};

export type Question =
  | (MultipleChoiceQuestion & QuestionMeta)
  | (TextAnswerQuestion & QuestionMeta);

export const questions = raw as Question[];

export const categories = Array.from(new Set(questions.map((q) => q.category))).sort();

export type QuestionFilters = {
  language?: string;
  difficulties?: number[];
  categories?: string[];
};

export function filterQuestions({
  language = 'all',
  difficulties = [],
  categories: categoryFilter = [],
}: QuestionFilters): Question[] {
  return questions.filter(
    (q) =>
      (language === 'all' || q.language === language) &&
      (difficulties.length === 0 || difficulties.includes(q.difficulty)) &&
      (categoryFilter.length === 0 || categoryFilter.includes(q.category)),
  );
}
