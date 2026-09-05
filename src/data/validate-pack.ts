import type { MultipleChoiceQuestion } from "@/components/question-modules/multiple-choice";
import type { TextAnswerQuestion } from "@/components/question-modules/text-answer";
import type { Question } from "@/data/questions";
import {
  sanitizeString,
  stripControlAndSpoofingChars,
} from "@/data/sanitize-string";
import { compareSemver, isSemver } from "@/data/semver";

export type Pack = {
  id: string;
  name: string;
  description: string;
  schemaVersion: number;
  version: string;
  updatedAt: string;
  questions: Question[];
};

export type PackValidationIssue = {
  index: number;
  id: string | null;
  reason: string;
};

export type PackValidationResult =
  | { valid: true; pack: Pack; skipped: PackValidationIssue[] }
  | { valid: false; reason: string };

export const MAX_PACK_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const KNOWN_DIFFICULTIES = [1, 2, 3];
const MIN_CHOICES = 2;
const MAX_CHOICES = 6;
const MAX_QUESTIONS_PER_PACK = 1500;
const MAX_STRING_LENGTH = 2048;
const MAX_PROMPT_LENGTH = 5000;
const MAX_ID_LENGTH = 100;
const MAX_SCHEMA_VERSION = 1000;
const SAFE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

// Reserved property names that would collide with Object.prototype if a pack
// id ever ends up used as a plain-object key (e.g. a packs-by-id lookup).
const RESERVED_PACK_IDS = new Set(["__proto__", "constructor", "prototype"]);

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isBoundedString(value: unknown, maxLength: number): value is string {
  return isNonEmptyString(value) && value.length <= maxLength;
}

function isHttpUrl(value: unknown): value is string {
  if (!isNonEmptyString(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isSafePackId(id: string): boolean {
  return (
    SAFE_ID_PATTERN.test(id) &&
    id.length <= MAX_ID_LENGTH &&
    !RESERVED_PACK_IDS.has(id)
  );
}

function validateQuestion(
  value: unknown,
  seenIds: Set<string>,
): { question: Question } | { reason: string } {
  if (typeof value !== "object" || value === null) {
    return { reason: "question is not an object" };
  }
  const q = value as Record<string, unknown>;

  if (!isBoundedString(q.id, MAX_ID_LENGTH)) {
    return {
      reason: `missing, empty, or too long (max ${MAX_ID_LENGTH} characters) id`,
    };
  }
  const id = stripControlAndSpoofingChars(q.id).trim();
  if (!id || /[<>]/.test(id)) {
    return { reason: "id must be a plain string with no markup" };
  }
  if (seenIds.has(id)) return { reason: `duplicate id "${id}"` };

  if (!isBoundedString(q.language, MAX_STRING_LENGTH)) {
    return {
      reason: `missing, empty, or too long (max ${MAX_STRING_LENGTH} characters) language`,
    };
  }
  const language = stripControlAndSpoofingChars(q.language).trim();
  if (!language || /[<>]/.test(language)) {
    return { reason: "language must be a plain string with no markup" };
  }

  if (!isBoundedString(q.category, MAX_STRING_LENGTH)) {
    return {
      reason: `missing, empty, or too long (max ${MAX_STRING_LENGTH} characters) category`,
    };
  }
  const category = stripControlAndSpoofingChars(q.category).trim();
  if (!category || /[<>]/.test(category)) {
    return { reason: "category must be a plain string with no markup" };
  }

  if (!isBoundedString(q.prompt, MAX_PROMPT_LENGTH)) {
    return {
      reason: `missing, empty, or too long (max ${MAX_PROMPT_LENGTH} characters) prompt`,
    };
  }
  const prompt = sanitizeString(q.prompt);
  if (!prompt) return { reason: "prompt was empty after sanitization" };

  if (!isBoundedString(q.explanation, MAX_STRING_LENGTH)) {
    return {
      reason: `missing, empty, or too long (max ${MAX_STRING_LENGTH} characters) explanation`,
    };
  }
  const explanation = sanitizeString(q.explanation);
  if (!explanation)
    return { reason: "explanation was empty after sanitization" };

  const cleanedSource =
    typeof q.source === "string"
      ? stripControlAndSpoofingChars(q.source).trim()
      : q.source;
  if (
    typeof cleanedSource === "string" &&
    cleanedSource.length > MAX_STRING_LENGTH
  ) {
    return {
      reason: `source exceeds max length of ${MAX_STRING_LENGTH} characters`,
    };
  }
  if (!isHttpUrl(cleanedSource)) {
    return { reason: "source must be a valid http(s) url" };
  }
  const source = cleanedSource as string;

  if (
    typeof q.difficulty !== "number" ||
    !KNOWN_DIFFICULTIES.includes(q.difficulty)
  ) {
    return {
      reason: `difficulty must be one of ${KNOWN_DIFFICULTIES.join(", ")}`,
    };
  }
  const difficulty = q.difficulty;

  if (q.type === "multiple-choice") {
    if (
      !Array.isArray(q.choices) ||
      q.choices.length < MIN_CHOICES ||
      q.choices.length > MAX_CHOICES
    ) {
      return {
        reason: `choices must be an array with between ${MIN_CHOICES} and ${MAX_CHOICES} entries`,
      };
    }
    if (
      !q.choices.every((choice) => isBoundedString(choice, MAX_STRING_LENGTH))
    ) {
      return {
        reason: `all choices must be non-empty strings of ${MAX_STRING_LENGTH} characters or fewer`,
      };
    }
    const choices = (q.choices as string[]).map((choice) =>
      sanitizeString(choice),
    );
    if (!choices.every((choice) => choice.length > 0)) {
      return { reason: "a choice was empty after sanitization" };
    }
    if (
      typeof q.correctIndex !== "number" ||
      !Number.isInteger(q.correctIndex) ||
      q.correctIndex < 0 ||
      q.correctIndex >= choices.length
    ) {
      return { reason: "correctIndex must be a valid index into choices" };
    }

    const question: MultipleChoiceQuestion & {
      category: string;
      difficulty: number;
    } = {
      id,
      type: "multiple-choice",
      prompt,
      choices,
      correctIndex: q.correctIndex,
      language,
      explanation,
      source,
      category,
      difficulty,
    };
    return { question };
  }

  if (q.type === "text-answer") {
    if (!isBoundedString(q.correctAnswer, MAX_STRING_LENGTH)) {
      return {
        reason: `missing, empty, or too long (max ${MAX_STRING_LENGTH} characters) correctAnswer`,
      };
    }
    const correctAnswer = sanitizeString(q.correctAnswer);
    if (!correctAnswer) {
      return { reason: "correctAnswer was empty after sanitization" };
    }

    const question: TextAnswerQuestion & {
      category: string;
      difficulty: number;
    } = {
      id,
      type: "text-answer",
      prompt,
      correctAnswer,
      language,
      explanation,
      source,
      category,
      difficulty,
    };
    return { question };
  }

  return { reason: `unsupported type "${String(q.type)}"` };
}

export function validatePack(raw: unknown): PackValidationResult {
  if (typeof raw !== "object" || raw === null) {
    return { valid: false, reason: "pack must be a JSON object" };
  }
  const p = raw as Record<string, unknown>;

  if (!isNonEmptyString(p.id)) {
    return { valid: false, reason: "pack is missing a valid id" };
  }
  if (!isSafePackId(p.id)) {
    return {
      valid: false,
      reason: `pack id may only contain letters, numbers, hyphens, and underscores, must be ${MAX_ID_LENGTH} characters or fewer, and may not be a reserved name`,
    };
  }
  if (!isBoundedString(p.name, MAX_STRING_LENGTH)) {
    return {
      valid: false,
      reason: `pack is missing a valid name (max ${MAX_STRING_LENGTH} characters)`,
    };
  }
  const name = stripControlAndSpoofingChars(p.name).trim();
  if (!name || /[<>]/.test(name)) {
    return {
      valid: false,
      reason: "pack name must be a plain string with no markup",
    };
  }
  if (!isBoundedString(p.description, MAX_STRING_LENGTH)) {
    return {
      valid: false,
      reason: `pack is missing a valid description (max ${MAX_STRING_LENGTH} characters)`,
    };
  }
  const description = stripControlAndSpoofingChars(p.description).trim();
  if (!description || /[<>]/.test(description)) {
    return {
      valid: false,
      reason: "pack description must be a plain string with no markup",
    };
  }
  if (typeof p.version === "string" && p.version.length > MAX_STRING_LENGTH) {
    return {
      valid: false,
      reason: `pack version exceeds max length of ${MAX_STRING_LENGTH} characters`,
    };
  }
  if (
    typeof p.updatedAt === "string" &&
    p.updatedAt.length > MAX_STRING_LENGTH
  ) {
    return {
      valid: false,
      reason: `pack updatedAt exceeds max length of ${MAX_STRING_LENGTH} characters`,
    };
  }
  if (
    typeof p.schemaVersion === "number" &&
    (!Number.isInteger(p.schemaVersion) ||
      p.schemaVersion < 1 ||
      p.schemaVersion > MAX_SCHEMA_VERSION)
  ) {
    return {
      valid: false,
      reason: `pack schemaVersion must be an integer between 1 and ${MAX_SCHEMA_VERSION}`,
    };
  }
  if (
    !Array.isArray(p.questions) ||
    p.questions.length === 0 ||
    p.questions.length > MAX_QUESTIONS_PER_PACK
  ) {
    return {
      valid: false,
      reason: `pack must contain between 1 and ${MAX_QUESTIONS_PER_PACK} questions`,
    };
  }

  const seenIds = new Set<string>();
  const validQuestions: Question[] = [];
  const skipped: PackValidationIssue[] = [];

  p.questions.forEach((entry, index) => {
    const result = validateQuestion(entry, seenIds);
    if ("question" in result) {
      seenIds.add(result.question.id);
      validQuestions.push(result.question);
    } else {
      const entryId =
        typeof entry === "object" &&
        entry !== null &&
        isNonEmptyString((entry as Record<string, unknown>).id)
          ? ((entry as Record<string, unknown>).id as string)
          : null;
      skipped.push({ index, id: entryId, reason: result.reason });
    }
  });

  if (validQuestions.length === 0) {
    return { valid: false, reason: "no valid questions found in pack" };
  }

  return {
    valid: true,
    pack: {
      id: p.id,
      name,
      description,
      schemaVersion: typeof p.schemaVersion === "number" ? p.schemaVersion : 1,
      version: isNonEmptyString(p.version) ? p.version : "0.0.0",
      updatedAt: isNonEmptyString(p.updatedAt)
        ? p.updatedAt
        : new Date().toISOString(),
      questions: validQuestions,
    },
    skipped,
  };
}

export function parsePackJson(
  jsonText: string,
): { parsed: unknown } | { reason: string } {
  if (jsonText.length === 0) {
    return { reason: "file is empty" };
  }
  if (jsonText.length > MAX_PACK_FILE_SIZE) {
    return { reason: "file is too large" };
  }
  try {
    return { parsed: JSON.parse(jsonText) };
  } catch {
    return { reason: "file is not valid JSON" };
  }
}

export function validatePackFile(jsonText: string): PackValidationResult {
  const result = parsePackJson(jsonText);
  if ("reason" in result) return { valid: false, reason: result.reason };
  return validatePack(result.parsed);
}

/**
 * Requires pack.version to be valid semver and strictly greater than
 * installedVersion, so an update can never silently downgrade or reapply
 * the same pack. Assumes pack already passed validatePack.
 */
export function requireNewerVersion(
  pack: Pack,
  installedVersion: string,
): { ok: true } | { ok: false; reason: string } {
  if (!isSemver(pack.version)) {
    return {
      ok: false,
      reason: `pack version "${pack.version}" is not a valid semver version`,
    };
  }
  if (
    !isSemver(installedVersion) ||
    compareSemver(pack.version, installedVersion) <= 0
  ) {
    return {
      ok: false,
      reason: `pack version ${pack.version} is not newer than the installed version ${installedVersion}`,
    };
  }
  return { ok: true };
}

/**
 * Validates an incoming pack as a replacement for an already-installed pack.
 * Unlike validatePack (used for first-time imports, which accept whatever
 * semver string is given), this additionally requires the new pack's version
 * to be valid semver and strictly greater than the installed version.
 */
export function validatePackUpdate(
  raw: unknown,
  installedVersion: string,
): PackValidationResult {
  const result = validatePack(raw);
  if (!result.valid) return result;

  const versionCheck = requireNewerVersion(result.pack, installedVersion);
  if (!versionCheck.ok) return { valid: false, reason: versionCheck.reason };

  return result;
}

export function validatePackUpdateFile(
  jsonText: string,
  installedVersion: string,
): PackValidationResult {
  const result = parsePackJson(jsonText);
  if ("reason" in result) return { valid: false, reason: result.reason };
  return validatePackUpdate(result.parsed, installedVersion);
}
