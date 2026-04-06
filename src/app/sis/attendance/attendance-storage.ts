import { loadStudents, seedStudents } from "../students/student-storage";

export type AttendanceStatus = "present" | "late" | "absent" | "excused";

export type AttendanceEntry = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  grade: string;
  className: string;
  date: string;
  status: AttendanceStatus;
  note: string;
};

export type AttendanceDraft = {
  studentId: string;
  status: AttendanceStatus;
  note: string;
};

export const ATTENDANCE_STORAGE_KEY = "sis-attendance-ledger";
export const defaultAttendanceDate = "2026-03-29";

function seedAttendance(): AttendanceEntry[] {
  const activeStudents = seedStudents.filter((student) => student.status === "Active");

  return [
    createSeedEntry(activeStudents[0]!, defaultAttendanceDate, "present", ""),
    createSeedEntry(activeStudents[1]!, defaultAttendanceDate, "late", "Arrived after assembly"),
  ];
}

function createSeedEntry(
  student: (typeof seedStudents)[number],
  date: string,
  status: AttendanceStatus,
  note: string,
): AttendanceEntry {
  return {
    id: `${date}-${student.id}`,
    studentId: student.id,
    studentName: student.fullName,
    studentCode: student.studentCode,
    grade: student.grade,
    className: student.className,
    date,
    status,
    note,
  };
}

export function loadAttendanceEntries() {
  if (typeof window === "undefined") {
    return seedAttendance();
  }

  const stored = window.localStorage.getItem(ATTENDANCE_STORAGE_KEY);
  if (!stored) {
    return seedAttendance();
  }

  try {
    const parsed = JSON.parse(stored) as AttendanceEntry[];
    return Array.isArray(parsed) ? parsed : seedAttendance();
  } catch {
    return seedAttendance();
  }
}

export function persistAttendanceEntries(nextEntries: AttendanceEntry[]) {
  window.localStorage.setItem(ATTENDANCE_STORAGE_KEY, JSON.stringify(nextEntries));
}

export function classRoster(grade: string, className: string) {
  return loadStudents().filter(
    (student) => student.status === "Active" && student.grade === grade && student.className === className,
  );
}

export function attendanceForClassDate(entries: AttendanceEntry[], grade: string, className: string, date: string) {
  return entries.filter((entry) => entry.grade === grade && entry.className === className && entry.date === date);
}

export function buildDailyAttendanceEntries({
  grade,
  className,
  date,
  drafts,
}: {
  grade: string;
  className: string;
  date: string;
  drafts: AttendanceDraft[];
}) {
  const roster = classRoster(grade, className);

  return roster.map((student) => {
    const draft = drafts.find((item) => item.studentId === student.id);
    return {
      id: `${date}-${student.id}`,
      studentId: student.id,
      studentName: student.fullName,
      studentCode: student.studentCode,
      grade: student.grade,
      className: student.className,
      date,
      status: draft?.status ?? "present",
      note: draft?.note ?? "",
    } satisfies AttendanceEntry;
  });
}

export function replaceAttendanceForClassDate({
  currentEntries,
  grade,
  className,
  date,
  nextDailyEntries,
}: {
  currentEntries: AttendanceEntry[];
  grade: string;
  className: string;
  date: string;
  nextDailyEntries: AttendanceEntry[];
}) {
  const filtered = currentEntries.filter(
    (entry) => !(entry.grade === grade && entry.className === className && entry.date === date),
  );

  return [...nextDailyEntries, ...filtered];
}

export function latestAbsenceAlerts(entries: AttendanceEntry[]) {
  return entries
    .filter((entry) => entry.status === "absent" || entry.status === "late")
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);
}
