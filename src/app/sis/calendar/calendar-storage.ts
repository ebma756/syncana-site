import { termOptions, subjectOptions, AcademicTerm, AssessmentSubject } from "../grades/grades-storage";
import { loadManagedClasses, managedClassPairs } from "../classes/class-storage";
import { teacherOptions } from "../timetable/timetable-storage";

export type CalendarEventStatus = "planned" | "published" | "completed";
export type CalendarEventType = "Term milestone" | "Holiday" | "Meeting" | "Report cards" | "Exam window";
export type ExamSessionType = "First Try" | "Second Try";
export type ExamSessionStatus = "draft" | "published" | "completed";

export type AcademicCalendarEvent = {
  id: string;
  title: string;
  eventType: CalendarEventType;
  term: AcademicTerm;
  startDate: string;
  endDate: string;
  audience: string;
  status: CalendarEventStatus;
  notes: string;
};

export type ExamSession = {
  id: string;
  term: AcademicTerm;
  sessionType: ExamSessionType;
  grade: string;
  className: string;
  subject: AssessmentSubject;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilatorTeacherId: string;
  invigilatorTeacherName: string;
  status: ExamSessionStatus;
};

export type CalendarEventFormState = {
  title: string;
  eventType: CalendarEventType;
  term: AcademicTerm;
  startDate: string;
  endDate: string;
  audience: string;
  status: CalendarEventStatus;
  notes: string;
};

export type ExamSessionFormState = {
  term: AcademicTerm;
  sessionType: ExamSessionType;
  grade: string;
  className: string;
  subject: AssessmentSubject;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilatorTeacherId: string;
  status: ExamSessionStatus;
};

export const CALENDAR_EVENTS_STORAGE_KEY = "sis-academic-calendar-events";
export const EXAM_SESSIONS_STORAGE_KEY = "sis-exam-sessions";
export const calendarEventTypes: CalendarEventType[] = [
  "Term milestone",
  "Holiday",
  "Meeting",
  "Report cards",
  "Exam window",
];
export const examSessionTypes: ExamSessionType[] = ["First Try", "Second Try"];
export const eventStatuses: CalendarEventStatus[] = ["planned", "published", "completed"];
export const examStatuses: ExamSessionStatus[] = ["draft", "published", "completed"];
export const examTimeOptions = ["07:30", "08:20", "09:20", "10:10", "11:10", "12:00", "13:00", "13:50", "14:40"];

export const initialCalendarEventFormState: CalendarEventFormState = {
  title: "",
  eventType: "Term milestone",
  term: termOptions[0]!,
  startDate: "2026-04-12",
  endDate: "2026-04-12",
  audience: "School",
  status: "planned",
  notes: "",
};

const firstTeacher = teacherOptions()[0];
const classPairs = managedClassPairs(loadManagedClasses());

export const initialExamSessionFormState: ExamSessionFormState = {
  term: termOptions[0]!,
  sessionType: "First Try",
  grade: classPairs[0]?.grade ?? "Grade 1",
  className: classPairs[0]?.className ?? "A",
  subject: subjectOptions()[0]!,
  examDate: "2026-04-12",
  startTime: "07:30",
  endTime: "08:20",
  room: "Room 3",
  invigilatorTeacherId: firstTeacher?.id ?? "",
  status: "draft",
};

const seedCalendarEvents: AcademicCalendarEvent[] = [
  {
    id: "cal-term1-exams",
    title: "Term 1 exam window",
    eventType: "Exam window",
    term: "T1",
    startDate: "2026-04-12",
    endDate: "2026-04-16",
    audience: "School",
    status: "published",
    notes: "Main exam week for all primary classes.",
  },
  {
    id: "cal-supplementary",
    title: "Supplementary exam session",
    eventType: "Exam window",
    term: "T1",
    startDate: "2026-04-26",
    endDate: "2026-04-27",
    audience: "Affected students",
    status: "planned",
    notes: "Second Try exams for students below pass mark.",
  },
  {
    id: "cal-report-cards",
    title: "Report cards release",
    eventType: "Report cards",
    term: "T1",
    startDate: "2026-05-03",
    endDate: "2026-05-03",
    audience: "Parents and staff",
    status: "planned",
    notes: "PDF reports and parent pickup day.",
  },
];

const seedExamSessions: ExamSession[] = [
  createSeedExamSession("exam-grade3a-math", "T1", "First Try", "Grade 3", "A", "Mathematics", "2026-04-12", "07:30", "08:20", "Room 3", "published"),
  createSeedExamSession("exam-grade3a-port", "T1", "First Try", "Grade 3", "A", "Portuguese", "2026-04-13", "07:30", "08:20", "Room 3", "published"),
  createSeedExamSession("exam-grade5b-sci", "T1", "First Try", "Grade 5", "B", "Science", "2026-04-14", "09:20", "10:10", "Lab 1", "published"),
  createSeedExamSession("exam-grade3a-math-second", "T1", "Second Try", "Grade 3", "A", "Mathematics", "2026-04-26", "07:30", "08:20", "Room 2", "draft"),
].filter(Boolean) as ExamSession[];

function createSeedExamSession(
  id: string,
  term: AcademicTerm,
  sessionType: ExamSessionType,
  grade: string,
  className: string,
  subject: AssessmentSubject,
  examDate: string,
  startTime: string,
  endTime: string,
  room: string,
  status: ExamSessionStatus,
): ExamSession | null {
  const invigilator = teacherOptions()[0];
  if (!invigilator) {
    return null;
  }

  return {
    id,
    term,
    sessionType,
    grade,
    className,
    subject,
    examDate,
    startTime,
    endTime,
    room,
    invigilatorTeacherId: invigilator.id,
    invigilatorTeacherName: invigilator.name,
    status,
  };
}

export function loadCalendarEvents() {
  if (typeof window === "undefined") {
    return seedCalendarEvents;
  }

  const stored = window.localStorage.getItem(CALENDAR_EVENTS_STORAGE_KEY);
  if (!stored) {
    return seedCalendarEvents;
  }

  try {
    const parsed = JSON.parse(stored) as AcademicCalendarEvent[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedCalendarEvents;
  } catch {
    return seedCalendarEvents;
  }
}

export function persistCalendarEvents(nextEvents: AcademicCalendarEvent[]) {
  window.localStorage.setItem(CALENDAR_EVENTS_STORAGE_KEY, JSON.stringify(nextEvents));
}

export function loadExamSessions() {
  if (typeof window === "undefined") {
    return seedExamSessions;
  }

  const stored = window.localStorage.getItem(EXAM_SESSIONS_STORAGE_KEY);
  if (!stored) {
    return seedExamSessions;
  }

  try {
    const parsed = JSON.parse(stored) as ExamSession[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedExamSessions;
  } catch {
    return seedExamSessions;
  }
}

export function persistExamSessions(nextSessions: ExamSession[]) {
  window.localStorage.setItem(EXAM_SESSIONS_STORAGE_KEY, JSON.stringify(nextSessions));
}

export function upsertCalendarEvent({
  currentEvents,
  form,
  editingId,
}: {
  currentEvents: AcademicCalendarEvent[];
  form: CalendarEventFormState;
  editingId: string | null;
}) {
  const payload: AcademicCalendarEvent = {
    id: editingId ?? `event-${slug(form.title)}-${form.startDate}`,
    title: form.title.trim(),
    eventType: form.eventType,
    term: form.term,
    startDate: form.startDate,
    endDate: form.endDate,
    audience: form.audience.trim() || "School",
    status: form.status,
    notes: form.notes.trim(),
  };

  if (!editingId) {
    return [payload, ...currentEvents];
  }

  return currentEvents.map((event) => (event.id === editingId ? payload : event));
}

export function upsertExamSession({
  currentSessions,
  form,
  editingId,
  invigilatorTeacherName,
}: {
  currentSessions: ExamSession[];
  form: ExamSessionFormState;
  editingId: string | null;
  invigilatorTeacherName: string;
}) {
  const payload: ExamSession = {
    id: editingId ?? `exam-${form.term.toLowerCase()}-${slug(form.grade)}-${form.className.toLowerCase()}-${slug(form.subject)}-${form.examDate}`,
    term: form.term,
    sessionType: form.sessionType,
    grade: form.grade,
    className: form.className,
    subject: form.subject,
    examDate: form.examDate,
    startTime: form.startTime,
    endTime: form.endTime,
    room: form.room.trim() || "Room",
    invigilatorTeacherId: form.invigilatorTeacherId,
    invigilatorTeacherName,
    status: form.status,
  };

  if (!editingId) {
    return [payload, ...currentSessions];
  }

  return currentSessions.map((session) => (session.id === editingId ? payload : session));
}

export function deleteCalendarEvent(currentEvents: AcademicCalendarEvent[], id: string) {
  return currentEvents.filter((event) => event.id !== id);
}

export function deleteExamSession(currentSessions: ExamSession[], id: string) {
  return currentSessions.filter((session) => session.id !== id);
}

export function toCalendarEventFormState(event: AcademicCalendarEvent | null): CalendarEventFormState {
  if (!event) {
    return initialCalendarEventFormState;
  }

  return {
    title: event.title,
    eventType: event.eventType,
    term: event.term,
    startDate: event.startDate,
    endDate: event.endDate,
    audience: event.audience,
    status: event.status,
    notes: event.notes,
  };
}

export function toExamSessionFormState(session: ExamSession | null): ExamSessionFormState {
  if (!session) {
    return initialExamSessionFormState;
  }

  return {
    term: session.term,
    sessionType: session.sessionType,
    grade: session.grade,
    className: session.className,
    subject: session.subject,
    examDate: session.examDate,
    startTime: session.startTime,
    endTime: session.endTime,
    room: session.room,
    invigilatorTeacherId: session.invigilatorTeacherId,
    status: session.status,
  };
}

export function sortedCalendarEvents(events: AcademicCalendarEvent[]) {
  return [...events].sort((a, b) => a.startDate.localeCompare(b.startDate));
}

export function sortedExamSessions(sessions: ExamSession[]) {
  return [...sessions].sort((a, b) => {
    const dateDiff = a.examDate.localeCompare(b.examDate);
    if (dateDiff !== 0) {
      return dateDiff;
    }
    return a.startTime.localeCompare(b.startTime);
  });
}

function slug(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}
