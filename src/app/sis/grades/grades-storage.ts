import { seedStudents } from "../students/student-storage";
import { defaultSubjectCatalog, uniqueSubjectOptions } from "../subjects/subject-storage";
import { defaultGradingSettings, gradingBandLabel, loadGradingSettings } from "../settings/settings-storage";

export type AssessmentSubject = string;
export type AcademicTerm = "T1" | "T2" | "T3";
export type ModerationStatus = "draft" | "submitted" | "published";

export type ManagedGradeEntry = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  grade: string;
  className: string;
  subject: AssessmentSubject;
  term: AcademicTerm;
  testScore: number;
  firstTryScore: number;
  secondTryScore: number | null;
  finalScore: number;
  bandLabel: string;
  passStatus: "Pass" | "Fail";
  usedSecondTry: boolean;
  moderationStatus: ModerationStatus;
  notes: string;
};

export type GradeDraft = {
  studentId: string;
  testScore: string;
  firstTryScore: string;
  secondTryScore: string;
  notes: string;
};

export const GRADES_STORAGE_KEY = "sis-gradebook";
export const termOptions: AcademicTerm[] = ["T1", "T2", "T3"];
function seedGradeEntries(): ManagedGradeEntry[] {
  const activeStudents = seedStudents.filter((student) => student.status === "Active");

  return [
    createSeedGradeEntry(activeStudents[0]!, defaultSubjectCatalog[0]!, "T1", 16, 17, null, "Strong term performance", "published"),
    createSeedGradeEntry(activeStudents[0]!, defaultSubjectCatalog[1]!, "T1", 14, 9, 13, "Recovered on second try", "submitted"),
    createSeedGradeEntry(activeStudents[1]!, defaultSubjectCatalog[0]!, "T1", 12, 10, null, "Borderline but passing", "draft"),
  ];
}

function createSeedGradeEntry(
  student: (typeof seedStudents)[number],
  subject: AssessmentSubject,
  term: AcademicTerm,
  testScore: number,
  firstTryScore: number,
  secondTryScore: number | null,
  notes: string,
  moderationStatus: ModerationStatus,
): ManagedGradeEntry {
  const derived = deriveGradeMetrics(testScore, firstTryScore, secondTryScore);

  return {
    id: `grade-${student.id}-${subject.toLowerCase()}-${term.toLowerCase()}`,
    studentId: student.id,
    studentName: student.fullName,
    studentCode: student.studentCode,
    grade: student.grade,
    className: student.className,
    subject,
    term,
    testScore,
    firstTryScore,
    secondTryScore,
    finalScore: derived.finalScore,
    bandLabel: derived.bandLabel,
    passStatus: derived.passStatus,
    usedSecondTry: derived.usedSecondTry,
    moderationStatus,
    notes,
  };
}

export function loadGradeEntries() {
  if (typeof window === "undefined") {
    return seedGradeEntries();
  }

  const stored = window.localStorage.getItem(GRADES_STORAGE_KEY);
  if (!stored) {
    return seedGradeEntries();
  }

  try {
    const parsed = JSON.parse(stored) as ManagedGradeEntry[];
    return Array.isArray(parsed) ? parsed.map(refreshGradeEntry) : seedGradeEntries();
  } catch {
    return seedGradeEntries();
  }
}

export function persistGradeEntries(nextEntries: ManagedGradeEntry[]) {
  window.localStorage.setItem(GRADES_STORAGE_KEY, JSON.stringify(nextEntries));
}

export function classGradeEntries(
  entries: ManagedGradeEntry[],
  grade: string,
  className: string,
  subject: AssessmentSubject,
  term: AcademicTerm,
) {
  return entries.filter(
    (entry) =>
      entry.grade === grade &&
      entry.className === className &&
      entry.subject === subject &&
      entry.term === term,
  );
}

export function buildGradeEntriesForClass({
  roster,
  subject,
  term,
  drafts,
  moderationStatus,
}: {
  roster: Array<{
    id: string;
    fullName: string;
    studentCode: string;
    grade: string;
    className: string;
  }>;
  subject: AssessmentSubject;
  term: AcademicTerm;
  drafts: GradeDraft[];
  moderationStatus: ModerationStatus;
}) {
  return roster.map((student) => {
    const draft = drafts.find((item) => item.studentId === student.id);
    const testScore = sanitizeScore(draft?.testScore ?? "0");
    const firstTryScore = sanitizeScore(draft?.firstTryScore ?? "0");
    const secondTryScore = sanitizeOptionalScore(draft?.secondTryScore ?? "");
    const derived = deriveGradeMetrics(testScore, firstTryScore, secondTryScore);

    return {
      id: `grade-${student.id}-${subject.toLowerCase()}-${term.toLowerCase()}`,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      grade: student.grade,
      className: student.className,
      subject,
      term,
      testScore,
      firstTryScore,
      secondTryScore,
      finalScore: derived.finalScore,
      bandLabel: derived.bandLabel,
      passStatus: derived.passStatus,
      usedSecondTry: derived.usedSecondTry,
      moderationStatus,
      notes: draft?.notes.trim() ?? "",
    } satisfies ManagedGradeEntry;
  });
}

export function replaceGradeEntriesForSelection({
  currentEntries,
  grade,
  className,
  subject,
  term,
  nextEntries,
}: {
  currentEntries: ManagedGradeEntry[];
  grade: string;
  className: string;
  subject: AssessmentSubject;
  term: AcademicTerm;
  nextEntries: ManagedGradeEntry[];
}) {
  const filtered = currentEntries.filter(
    (entry) =>
      !(
        entry.grade === grade &&
        entry.className === className &&
        entry.subject === subject &&
        entry.term === term
      ),
  );

  return [...nextEntries, ...filtered];
}

export function deriveGradeMetrics(testScore: number, firstTryScore: number, secondTryScore: number | null) {
  const gradingSettings = loadGradingSettings();
  const examScore = secondTryScore ?? firstTryScore;
  const finalScore = clampScore(Math.round((testScore + examScore) / 2), gradingSettings.scaleMin, gradingSettings.scaleMax);
  const bandLabel = mozambiqueBand(finalScore);
  const usedSecondTry = secondTryScore !== null;
  const passStatus = finalScore >= gradingSettings.passMark ? "Pass" : "Fail";

  return { finalScore, bandLabel, usedSecondTry, passStatus } as const;
}

export function mozambiqueBand(score: number) {
  return gradingBandLabel(score, loadGradingSettings());
}

export function refreshGradeEntry(entry: ManagedGradeEntry) {
  const derived = deriveGradeMetrics(entry.testScore, entry.firstTryScore, entry.secondTryScore);
  return {
    ...entry,
    finalScore: derived.finalScore,
    bandLabel: derived.bandLabel,
    passStatus: derived.passStatus,
    usedSecondTry: derived.usedSecondTry,
  };
}

export function sanitizeScore(value: string) {
  const settings = loadGradingSettings();
  return clampScore(Number(value) || 0, settings.scaleMin, settings.scaleMax);
}

export function sanitizeOptionalScore(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const settings = loadGradingSettings();
  return clampScore(Number(trimmed) || 0, settings.scaleMin, settings.scaleMax);
}

export function subjectOptions() {
  return uniqueSubjectOptions();
}

function clampScore(value: number, min = defaultGradingSettings.scaleMin, max = defaultGradingSettings.scaleMax) {
  if (value < min) {
    return min;
  }

  if (value > max) {
    return max;
  }

  return value;
}
