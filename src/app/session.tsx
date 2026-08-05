import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FormattedText } from "@/components/code-terminal";
import { MultipleChoiceModule } from "@/components/question-modules/multiple-choice";
import {
  isCorrectTextAnswer,
  TextAnswerModule,
} from "@/components/question-modules/text-answer";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Spacing } from "@/constants/theme";
import { filterQuestions, Question } from "@/data/questions";
import { useDayCounter } from "@/hooks/use-day-counter";

type SessionParams = {
  language?: string;
  difficulties?: string;
  categories?: string;
  count?: string;
};

type Answer =
  | { type: "multiple-choice"; choiceIndex: number; correct: boolean }
  | { type: "text-answer"; text: string; correct: boolean };

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function shuffleChoices(question: Question): Question {
  if (question.type !== "multiple-choice") return question;
  const order = shuffle(question.choices.map((_, i) => i));
  return {
    ...question,
    choices: order.map((i) => question.choices[i]),
    correctIndex: order.indexOf(question.correctIndex),
  };
}

function getAnswerText(question: Question, answer: Answer): string {
  if (question.type === "multiple-choice" && answer.type === "multiple-choice") {
    return question.choices[answer.choiceIndex];
  }
  if (question.type === "text-answer" && answer.type === "text-answer") {
    return answer.text;
  }
  return "";
}

function getCorrectAnswerText(question: Question): string {
  return question.type === "multiple-choice"
    ? question.choices[question.correctIndex]
    : question.correctAnswer;
}

function QuestionModule({
  question,
  selectedIndex,
  onSelect,
  textValue,
  onTextChange,
}: {
  question: Question;
  selectedIndex: number | null;
  onSelect: (choiceIndex: number) => void;
  textValue: string;
  onTextChange: (value: string) => void;
}) {
  switch (question.type) {
    case "multiple-choice":
      return (
        <MultipleChoiceModule
          question={question}
          selectedIndex={selectedIndex}
          onSelect={onSelect}
        />
      );
    case "text-answer":
      return (
        <TextAnswerModule
          question={question}
          value={textValue}
          onChange={onTextChange}
        />
      );
    default:
      return (
        <ThemedText themeColor="textSecondary">
          Unsupported question type.
        </ThemedText>
      );
  }
}

export default function SessionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<SessionParams>();

  const [sessionQuestions] = useState<Question[]>(() => {
    const matches = filterQuestions({
      language: params.language,
      difficulties: params.difficulties
        ? params.difficulties.split(",").map(Number)
        : [],
      categories: params.categories
        ? params.categories.split(",").filter(Boolean)
        : [],
    });
    const count = params.count ? Number(params.count) : matches.length;
    return shuffle(matches).slice(0, count).map(shuffleChoices);
  });

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const [revealed, setRevealed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [textValue, setTextValue] = useState("");
  const { recordSession } = useDayCounter();

  const total = sessionQuestions.length;
  const current = sessionQuestions[index];
  const isFinished = total > 0 && index >= total;
  const score = Object.values(answers).filter((a) => a.correct).length;

  useEffect(() => {
    if (isFinished) {
      recordSession();
    }
  }, [isFinished, recordSession]);

  function handleSubmit() {
    if (!current || revealed) return;

    if (current.type === "multiple-choice") {
      if (selectedIndex === null) return;
      setAnswers((prev) => ({
        ...prev,
        [current.id]: {
          type: "multiple-choice",
          choiceIndex: selectedIndex,
          correct: selectedIndex === current.correctIndex,
        },
      }));
      setRevealed(true);
      return;
    }

    if (!textValue.trim()) return;
    setAnswers((prev) => ({
      ...prev,
      [current.id]: {
        type: "text-answer",
        text: textValue,
        correct: isCorrectTextAnswer(current, textValue),
      },
    }));
    setRevealed(true);
  }

  function handleNext() {
    setRevealed(false);
    setSelectedIndex(null);
    setTextValue("");
    setIndex((i) => i + 1);
  }

  if (total === 0) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centeredSafeArea}>
          <ThemedText type="subtitle">No questions found</ThemedText>
          <ThemedText themeColor="textSecondary">
            No questions matched the filters you selected.
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="text" style={styles.actionButton}>
              <ThemedText
                themeColor="background"
                style={styles.actionButtonLabel}
              >
                Back to Training
              </ThemedText>
            </ThemedView>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  if (isFinished) {
    return (
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.centeredSafeArea}>
          <ThemedText type="subtitle">Session Complete!</ThemedText>
          <ThemedText themeColor="textSecondary">
            You scored {score} out of {total}
          </ThemedText>
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="text" style={styles.actionButton}>
              <ThemedText
                themeColor="background"
                style={styles.actionButtonLabel}
              >
                Back to Training
              </ThemedText>
            </ThemedView>
          </Pressable>
        </SafeAreaView>
      </ThemedView>
    );
  }

  const answer = answers[current.id];
  const isLastQuestion = index === total - 1;
  const isSubmitDisabled =
    current.type === "multiple-choice"
      ? selectedIndex === null
      : textValue.trim().length === 0;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["bottom"]}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <ThemedText themeColor="textSecondary" type="small">
              Question {index + 1} of {total}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {current.language.charAt(0).toUpperCase() +
                current.language.slice(1)}{" "}
              Question
            </ThemedText>
          </View>

          <View style={styles.questionArea}>
            {revealed && answer ? (
              <View style={styles.feedback}>
                <FormattedText text={current.prompt} style={styles.prompt} />

                <ThemedView
                  type={
                    answer.correct ? "backgroundSelected" : "backgroundElement"
                  }
                  style={styles.feedbackBanner}
                >
                  <ThemedText type="smallBold">
                    {answer.correct ? "Correct!" : "Incorrect"}
                  </ThemedText>
                </ThemedView>

                <View style={styles.feedbackSection}>
                  <ThemedText type="smallBold">Your answer</ThemedText>
                  <FormattedText text={getAnswerText(current, answer)} />
                </View>

                {!answer.correct && (
                  <View style={styles.feedbackSection}>
                    <ThemedText type="smallBold">Correct answer</ThemedText>
                    <FormattedText text={getCorrectAnswerText(current)} />
                  </View>
                )}

                <View style={styles.feedbackSection}>
                  <ThemedText type="smallBold">Explanation</ThemedText>
                  <FormattedText
                    text={current.explanation}
                    themeColor="textSecondary"
                  />
                </View>

                <View style={styles.feedbackSection}>
                  <ThemedText type="smallBold">Reference</ThemedText>
                  <Pressable onPress={() => Linking.openURL(current.source)}>
                    <ThemedText type="linkPrimary">{current.source}</ThemedText>
                  </Pressable>
                </View>
              </View>
            ) : (
              <QuestionModule
                question={current}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                textValue={textValue}
                onTextChange={setTextValue}
              />
            )}
          </View>
        </ScrollView>

        {revealed ? (
          <Pressable
            onPress={handleNext}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="text" style={styles.actionButton}>
              <ThemedText
                themeColor="background"
                style={styles.actionButtonLabel}
              >
                {isLastQuestion ? "Finish" : "Next Question"}
              </ThemedText>
            </ThemedView>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitDisabled}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView
              type="text"
              style={[
                styles.actionButton,
                isSubmitDisabled && styles.actionButtonDisabled,
              ]}
            >
              <ThemedText
                themeColor="background"
                style={styles.actionButtonLabel}
              >
                Submit
              </ThemedText>
            </ThemedView>
          </Pressable>
        )}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "flex-start",
  },
  container: {
    flex: 1,
    alignItems: "flex-start",
  },
  safeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    paddingTop: Spacing.three,
    gap: Spacing.three,
  },
  centeredSafeArea: {
    flex: 1,
    width: "100%",
    maxWidth: MaxContentWidth,
    paddingHorizontal: Spacing.three,
    alignItems: "center",
    justifyContent: "center",
    gap: Spacing.three,
  },
  header: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingBottom: Spacing.two,
  },
  questionArea: {
    flex: 1,
    justifyContent: "flex-start",
  },
  prompt: {
    fontSize: 18,
    lineHeight: 22,
  },
  feedback: {
    gap: Spacing.four,
    paddingVertical: Spacing.four,
  },
  feedbackBanner: {
    alignSelf: "flex-start",
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  feedbackSection: {
    gap: Spacing.two,
  },
  actionButton: {
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.six,
    borderRadius: Spacing.three,
    alignItems: "center",
  },
  actionButtonDisabled: {
    opacity: 0.4,
  },
  actionButtonLabel: {
    fontSize: 16,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.7,
  },
});
