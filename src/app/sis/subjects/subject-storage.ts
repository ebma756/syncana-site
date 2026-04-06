import { loadStaffMembers, seedStaff } from "../employees/employee-storage";
import { loadManagedClasses, managedClassPairs } from "../classes/class-storage";

export type ManagedSubjectAssignment = {
  id: string;
  classId: string;
  grade: string;
  className: string;
  subjectName: string;
  teacherId: string;
  teacherName: string;
  examMarks: number;
  notes: string;
};

export type SubjectAssignmentRow = {
  id: string;
  subjectName: string;
  teacherId: string;
  examMarks: string;
};

export const SUBJECT_STORAGE_KEY = "sis-subject-assignments";
export const defaultSubjectCatalog = ["Mathematics", "Portuguese", "Science", "History", "English", "Phys. Ed."];

const seedTeachers = seedStaff.filter((member) => member.role === "teacher" && member.status === "Active");
const seedClassPairs = managedClassPairs(loadManagedClasses());

export function makeSubjectRow(index = 1): SubjectAssignmentRow {
  return {
    id: `subject-row-${index}`,
    subjectName: defaultSubjectCatalog[index - 1] ?? "",
    teacherId: seedTeachers[0]?.id ?? "",
    examMarks: "20",
  };
}

export const initialSubjectRows = [makeSubjectRow(1), makeSubjectRow(2)];

const seedAssignments: ManagedSubjectAssignment[] = [
  createSeedAssignment(seedClassPairs[0]?.id ?? "class-grade-1-a", seedClassPairs[0]?.grade ?? "Grade 1", seedClassPairs[0]?.className ?? "A", "Portuguese", seedTeachers[0]?.id ?? "", seedTeachers[0]?.name ?? "Unassigned", 20),
  createSeedAssignment(seedClassPairs[0]?.id ?? "class-grade-1-a", seedClassPairs[0]?.grade ?? "Grade 1", seedClassPairs[0]?.className ?? "A", "Mathematics", seedTeachers[0]?.id ?? "", seedTeachers[0]?.name ?? "Unassigned", 20),
  createSeedAssignment(seedClassPairs[0]?.id ?? "class-grade-1-a", seedClassPairs[0]?.grade ?? "Grade 1", seedClassPairs[0]?.className ?? "A", "Science", seedTeachers[0]?.id ?? "", seedTeachers[0]?.name ?? "Unassigned", 20),
];

function createSeedAssignment(
  classId: string,
  grade: string,
  className: string,
  subjectName: string,
  teacherId: string,
  teacherName: string,
  examMarks: number,
): ManagedSubjectAssignment {
  return {
    id: `subject-${classId}-${subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    classId,
    grade,
    className,
    subjectName,
    teacherId,
    teacherName,
    examMarks,
    notes: "",
  };
}

export function loadSubjectAssignments() {
  if (typeof window === "undefined") {
    return seedAssignments;
  }

  const stored = window.localStorage.getItem(SUBJECT_STORAGE_KEY);
  if (!stored) {
    return seedAssignments;
  }

  try {
    const parsed = JSON.parse(stored) as ManagedSubjectAssignment[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedAssignments;
  } catch {
    return seedAssignments;
  }
}

export function persistSubjectAssignments(nextAssignments: ManagedSubjectAssignment[]) {
  window.localStorage.setItem(SUBJECT_STORAGE_KEY, JSON.stringify(nextAssignments));
}

export function subjectTeacherOptions() {
  const activeTeachers = loadStaffMembers().filter((member) => member.status === "Active" && member.role === "teacher");
  return activeTeachers.length > 0 ? activeTeachers : seedTeachers;
}

export function classAssignments(assignments: ManagedSubjectAssignment[], classId: string) {
  return assignments.filter((item) => item.classId === classId);
}

export function uniqueSubjectOptions(assignments?: ManagedSubjectAssignment[]) {
  const source = assignments ?? loadSubjectAssignments();
  const names = Array.from(new Set(source.map((item) => item.subjectName))).filter(Boolean);
  return names.length > 0 ? names : defaultSubjectCatalog;
}

export function subjectOptionsForClass(classId: string) {
  const names = Array.from(new Set(classAssignments(loadSubjectAssignments(), classId).map((item) => item.subjectName)));
  return names.length > 0 ? names : defaultSubjectCatalog;
}

export function groupedAssignments(assignments: ManagedSubjectAssignment[]) {
  const pairs = managedClassPairs(loadManagedClasses());
  return pairs.map((item) => ({
    classId: item.id,
    grade: item.grade,
    className: item.className,
    displayName: item.displayName,
    subjects: classAssignments(assignments, item.id),
  }));
}

export function replaceSubjectsForClass({
  currentAssignments,
  classId,
  grade,
  className,
  rows,
}: {
  currentAssignments: ManagedSubjectAssignment[];
  classId: string;
  grade: string;
  className: string;
  rows: SubjectAssignmentRow[];
}) {
  const teachers = subjectTeacherOptions();
  const cleanedRows = rows
    .map((row) => ({
      ...row,
      subjectName: row.subjectName.trim(),
      examMarks: row.examMarks.trim(),
    }))
    .filter((row) => row.subjectName);

  const nextAssignments = cleanedRows.map((row) => {
    const teacher = teachers.find((item) => item.id === row.teacherId);
    return {
      id: `subject-${classId}-${row.subjectName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      classId,
      grade,
      className,
      subjectName: row.subjectName,
      teacherId: row.teacherId,
      teacherName: teacher?.name ?? "Unassigned",
      examMarks: Number(row.examMarks) || 20,
      notes: "",
    } satisfies ManagedSubjectAssignment;
  });

  const remaining = currentAssignments.filter((item) => item.classId !== classId);
  return [...nextAssignments, ...remaining];
}
