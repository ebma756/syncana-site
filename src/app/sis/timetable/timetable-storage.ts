import { loadStudents } from "../students/student-storage";
import { loadManagedClasses, managedClassPairs } from "../classes/class-storage";
import { loadStaffMembers, seedStaff } from "../employees/employee-storage";
import { defaultSubjectCatalog, uniqueSubjectOptions } from "../subjects/subject-storage";

export type TimetableDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
export type TimetableSubject = string;

export type TimetableEntry = {
  id: string;
  day: TimetableDay;
  startTime: string;
  endTime: string;
  grade: string;
  className: string;
  subject: TimetableSubject;
  teacherId: string;
  teacherName: string;
  room: string;
  notes: string;
};

export type TimetableFormState = {
  day: TimetableDay;
  startTime: string;
  endTime: string;
  grade: string;
  className: string;
  subject: TimetableSubject;
  teacherId: string;
  room: string;
  notes: string;
};

export const TIMETABLE_STORAGE_KEY = "sis-timetable";
export const timetableDays: TimetableDay[] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
export const timeOptions = ["07:30", "08:20", "09:10", "09:20", "10:10", "11:00", "11:10", "12:00", "13:00", "13:50"];

const seedTeachers = seedStaff.filter((member) => member.role === "teacher" && member.status === "Active");
const seedClasses = managedClassPairs(loadManagedClasses());

export const initialTimetableFormState: TimetableFormState = {
  day: "Monday",
  startTime: "07:30",
  endTime: "08:20",
  grade: seedClasses[0]?.grade ?? "Grade 1",
  className: seedClasses[0]?.className ?? "A",
  subject: defaultSubjectCatalog[0]!,
  teacherId: seedTeachers[0]?.id ?? "",
  room: "Room 1",
  notes: "",
};

const seedTimetableEntries: TimetableEntry[] = [
  createSeedEntry("Monday", "07:30", "08:20", "Grade 1", "A", "Portuguese", seedTeachers[0], "Room 1"),
  createSeedEntry("Monday", "09:20", "10:10", "Grade 3", "A", "Mathematics", seedTeachers[0], "Room 4"),
  createSeedEntry("Tuesday", "07:30", "08:20", "Grade 5", "B", "Science", seedTeachers[0], "Lab 1"),
  createSeedEntry("Wednesday", "10:10", "11:00", "Grade 1", "A", "Mathematics", seedTeachers[0], "Room 1"),
  createSeedEntry("Thursday", "08:20", "09:10", "Grade 3", "A", "Science", seedTeachers[0], "Lab 1"),
  createSeedEntry("Friday", "11:10", "12:00", "Grade 5", "B", "Portuguese", seedTeachers[0], "Room 5"),
].filter(Boolean) as TimetableEntry[];

function createSeedEntry(
  day: TimetableDay,
  startTime: string,
  endTime: string,
  grade: string,
  className: string,
  subject: TimetableSubject,
  teacher: (typeof seedTeachers)[number] | undefined,
  room: string,
): TimetableEntry | null {
  if (!teacher) {
    return null;
  }

  return {
    id: `tt-${day.toLowerCase()}-${grade.toLowerCase().replace(/\s+/g, "-")}-${className.toLowerCase()}-${startTime.replace(":", "")}`,
    day,
    startTime,
    endTime,
    grade,
    className,
    subject,
    teacherId: teacher.id,
    teacherName: teacher.name,
    room,
    notes: "",
  };
}

export function loadTimetableEntries() {
  if (typeof window === "undefined") {
    return seedTimetableEntries;
  }

  const stored = window.localStorage.getItem(TIMETABLE_STORAGE_KEY);
  if (!stored) {
    return seedTimetableEntries;
  }

  try {
    const parsed = JSON.parse(stored) as TimetableEntry[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedTimetableEntries;
  } catch {
    return seedTimetableEntries;
  }
}

export function persistTimetableEntries(nextEntries: TimetableEntry[]) {
  window.localStorage.setItem(TIMETABLE_STORAGE_KEY, JSON.stringify(nextEntries));
}

export function teacherOptions() {
  const activeTeachers = loadStaffMembers().filter((member) => member.status === "Active" && member.role === "teacher");
  return activeTeachers.length > 0 ? activeTeachers : loadStaffMembers().filter((member) => member.status === "Active");
}

export function timetableClassOptions() {
  const managedPairs = managedClassPairs(loadManagedClasses());
  if (managedPairs.length > 0) {
    return managedPairs.map(({ grade, className }) => ({ grade, className }));
  }

  const students = loadStudents().filter((student) => student.status === "Active");
  const pairs = Array.from(new Set(students.map((student) => `${student.grade}::${student.className}`)));
  return pairs.map((pair) => {
    const [grade, className] = pair.split("::");
    return { grade, className };
  });
}

export function timetableSubjects() {
  return uniqueSubjectOptions() as TimetableSubject[];
}

export function upsertTimetableEntry({
  currentEntries,
  form,
  editingId,
  teacherName,
}: {
  currentEntries: TimetableEntry[];
  form: TimetableFormState;
  editingId: string | null;
  teacherName: string;
}) {
  const payload: TimetableEntry = {
    id:
      editingId ??
      `tt-${form.day.toLowerCase()}-${form.grade.toLowerCase().replace(/\s+/g, "-")}-${form.className.toLowerCase()}-${form.startTime.replace(":", "")}-${form.teacherId}`,
    day: form.day,
    startTime: form.startTime,
    endTime: form.endTime,
    grade: form.grade,
    className: form.className,
    subject: form.subject,
    teacherId: form.teacherId,
    teacherName,
    room: form.room.trim() || "Room",
    notes: form.notes.trim(),
  };

  if (!editingId) {
    return [payload, ...currentEntries];
  }

  return currentEntries.map((entry) => (entry.id === editingId ? payload : entry));
}

export function deleteTimetableEntry(currentEntries: TimetableEntry[], entryId: string) {
  return currentEntries.filter((entry) => entry.id !== entryId);
}

export function toTimetableFormState(entry: TimetableEntry | null): TimetableFormState {
  if (!entry) {
    return initialTimetableFormState;
  }

  return {
    day: entry.day,
    startTime: entry.startTime,
    endTime: entry.endTime,
    grade: entry.grade,
    className: entry.className,
    subject: entry.subject,
    teacherId: entry.teacherId,
    room: entry.room,
    notes: entry.notes,
  };
}

export function timetableEntriesForTeacher(entries: TimetableEntry[], teacherId: string) {
  return entries.filter((entry) => entry.teacherId === teacherId);
}

export function timetableEntriesForClass(entries: TimetableEntry[], grade: string, className: string) {
  return entries.filter((entry) => entry.grade === grade && entry.className === className);
}

export function sortTimetableEntries(entries: TimetableEntry[]) {
  return [...entries].sort((a, b) => {
    const dayDiff = timetableDays.indexOf(a.day) - timetableDays.indexOf(b.day);
    if (dayDiff !== 0) {
      return dayDiff;
    }

    return a.startTime.localeCompare(b.startTime);
  });
}

export function timetableConflicts(entries: TimetableEntry[]) {
  return entries.filter((entry, index) =>
    entries.some(
      (other, otherIndex) =>
        otherIndex !== index &&
        entry.day === other.day &&
        entry.startTime === other.startTime &&
        (entry.teacherId === other.teacherId || (entry.grade === other.grade && entry.className === other.className)),
    ),
  );
}
