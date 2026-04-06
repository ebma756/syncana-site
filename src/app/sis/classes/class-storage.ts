import { loadStaffMembers, seedStaff } from "../employees/employee-storage";

export type ManagedClassStatus = "Active" | "Inactive";

export type ManagedClass = {
  id: string;
  grade: string;
  className: string;
  displayName: string;
  academicYear: string;
  monthlyTuition: number;
  classTeacherId: string;
  classTeacherName: string;
  capacity: number;
  status: ManagedClassStatus;
  notes: string;
};

export type ClassFormState = {
  grade: string;
  className: string;
  academicYear: string;
  monthlyTuition: string;
  classTeacherId: string;
  capacity: string;
  status: ManagedClassStatus;
  notes: string;
};

export const CLASS_STORAGE_KEY = "sis-managed-classes";
export const defaultGradeLevels = ["Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6"];
export const defaultClassNames = ["A", "B", "C"];

const seedTeachers = seedStaff.filter((member) => member.role === "teacher" && member.status === "Active");

export const initialClassFormState: ClassFormState = {
  grade: defaultGradeLevels[0]!,
  className: defaultClassNames[0]!,
  academicYear: "2026",
  monthlyTuition: "",
  classTeacherId: seedTeachers[0]?.id ?? "",
  capacity: "30",
  status: "Active",
  notes: "",
};

export const seedClasses: ManagedClass[] = [
  createSeedClass("Grade 1", "A", "2026", 3500, seedTeachers[0]?.id ?? "", seedTeachers[0]?.name ?? "Unassigned", 30, "Active"),
  createSeedClass("Grade 2", "B", "2026", 3600, seedTeachers[1]?.id ?? seedTeachers[0]?.id ?? "", seedTeachers[1]?.name ?? seedTeachers[0]?.name ?? "Unassigned", 28, "Active"),
  createSeedClass("Grade 3", "A", "2026", 3800, seedTeachers[0]?.id ?? "", seedTeachers[0]?.name ?? "Unassigned", 32, "Active"),
  createSeedClass("Grade 5", "B", "2026", 4200, seedTeachers[1]?.id ?? seedTeachers[0]?.id ?? "", seedTeachers[1]?.name ?? seedTeachers[0]?.name ?? "Unassigned", 30, "Active"),
];

function createSeedClass(
  grade: string,
  className: string,
  academicYear: string,
  monthlyTuition: number,
  classTeacherId: string,
  classTeacherName: string,
  capacity: number,
  status: ManagedClassStatus,
): ManagedClass {
  return {
    id: `class-${grade.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${className.toLowerCase()}`,
    grade,
    className,
    displayName: `${grade} ${className}`,
    academicYear,
    monthlyTuition,
    classTeacherId,
    classTeacherName,
    capacity,
    status,
    notes: "",
  };
}

export function loadManagedClasses() {
  if (typeof window === "undefined") {
    return seedClasses;
  }

  const stored = window.localStorage.getItem(CLASS_STORAGE_KEY);
  if (!stored) {
    return seedClasses;
  }

  try {
    const parsed = JSON.parse(stored) as ManagedClass[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedClasses;
  } catch {
    return seedClasses;
  }
}

export function persistManagedClasses(nextClasses: ManagedClass[]) {
  window.localStorage.setItem(CLASS_STORAGE_KEY, JSON.stringify(nextClasses));
}

export function findManagedClassById(classes: ManagedClass[], id: string | null) {
  return id ? classes.find((item) => item.id === id) ?? null : null;
}

export function activeManagedClasses(classes: ManagedClass[]) {
  return classes.filter((item) => item.status === "Active");
}

export function managedGradeOptions(classes: ManagedClass[]) {
  const grades = Array.from(new Set(activeManagedClasses(classes).map((item) => item.grade)));
  return grades.length > 0 ? grades : defaultGradeLevels;
}

export function managedClassOptions(classes: ManagedClass[], grade?: string) {
  const pool = grade ? activeManagedClasses(classes).filter((item) => item.grade === grade) : activeManagedClasses(classes);
  const names = Array.from(new Set(pool.map((item) => item.className)));
  return names.length > 0 ? names : defaultClassNames;
}

export function managedClassPairs(classes: ManagedClass[]) {
  const active = activeManagedClasses(classes);
  if (active.length > 0) {
    return active.map((item) => ({
      id: item.id,
      grade: item.grade,
      className: item.className,
      displayName: item.displayName,
    }));
  }

  return defaultGradeLevels.flatMap((grade) =>
    defaultClassNames.map((className) => ({
      id: `fallback-${grade}-${className}`,
      grade,
      className,
      displayName: `${grade} ${className}`,
    })),
  );
}

export function teacherAssignmentOptions() {
  const activeTeachers = loadStaffMembers().filter((member) => member.status === "Active" && member.role === "teacher");
  return activeTeachers.length > 0 ? activeTeachers : seedTeachers;
}

export function buildClassPayload(form: ClassFormState, editingId: string | null) {
  const grade = form.grade.trim();
  const className = form.className.trim().toUpperCase();
  if (!grade || !className) {
    return null;
  }

  const teacher = teacherAssignmentOptions().find((member) => member.id === form.classTeacherId);

  return {
    id: editingId ?? `class-${grade.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${className.toLowerCase()}`,
    grade,
    className,
    displayName: `${grade} ${className}`,
    academicYear: form.academicYear.trim() || "2026",
    monthlyTuition: Number(form.monthlyTuition) || 0,
    classTeacherId: form.classTeacherId,
    classTeacherName: teacher?.name ?? "Unassigned",
    capacity: Number(form.capacity) || 30,
    status: form.status,
    notes: form.notes.trim(),
  } satisfies ManagedClass;
}

export function toClassFormState(item: ManagedClass | null): ClassFormState {
  if (!item) {
    return {
      ...initialClassFormState,
      classTeacherId: teacherAssignmentOptions()[0]?.id ?? initialClassFormState.classTeacherId,
    };
  }

  return {
    grade: item.grade,
    className: item.className,
    academicYear: item.academicYear,
    monthlyTuition: `${item.monthlyTuition}`,
    classTeacherId: item.classTeacherId,
    capacity: `${item.capacity}`,
    status: item.status,
    notes: item.notes,
  };
}
