"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSession } from "../components/SessionProvider";
import {
  loadTimetableEntries,
  teacherOptions,
  timetableClassOptions,
  timetableConflicts,
  timetableDays,
  timetableEntriesForClass,
  timetableEntriesForTeacher,
  TimetableDay,
  TimetableEntry,
  TimetableSubject,
  sortTimetableEntries,
} from "./timetable-storage";

type ViewMode = "class" | "teacher";

const weekOptions = [
  { id: "week-14", label: "Week 14 - 24-28 Mar" },
  { id: "week-15", label: "Week 15 - 31 Mar-04 Apr" },
];

export default function TimetableConsole() {
  const { can, currentUser } = useSession();
  const canManage = can("timetable.manage");
  const canViewAssigned = can("timetable.view.assigned");
  const currentUserId = currentUser?.id ?? "";
  const currentUserRole = currentUser?.role ?? null;
  const [entries, setEntries] = useState<TimetableEntry[]>([]);
  const [teacherList, setTeacherList] = useState(() => teacherOptions());
  const [classPairs, setClassPairs] = useState(() => timetableClassOptions());
  const [selectedGrade, setSelectedGrade] = useState("Grade 1");
  const [selectedClass, setSelectedClass] = useState("A");
  const [selectedTeacherId, setSelectedTeacherId] = useState("all");
  const [selectedWeek, setSelectedWeek] = useState(weekOptions[0]!.id);
  const [viewMode, setViewMode] = useState<ViewMode>("class");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const nextEntries = loadTimetableEntries();
      const nextTeachers = teacherOptions();
      const nextClassPairs = timetableClassOptions();

      setEntries(nextEntries);
      setTeacherList(nextTeachers);
      setClassPairs(nextClassPairs);

      if (nextClassPairs[0]) {
        setSelectedGrade(nextClassPairs[0].grade);
        setSelectedClass(nextClassPairs[0].className);
      }

      if (currentUserRole === "teacher") {
        setViewMode("teacher");
        setSelectedTeacherId(currentUserId);
      } else {
        setViewMode("class");
        setSelectedTeacherId("all");
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentUserId, currentUserRole]);

  const classOptions = useMemo(
    () =>
      classPairs.map((pair) => ({
        key: `${pair.grade}::${pair.className}`,
        label: `${pair.grade} ${pair.className}`,
      })),
    [classPairs],
  );

  const filteredEntries = useMemo(() => {
    if (currentUserRole === "teacher" && canViewAssigned) {
      return sortTimetableEntries(timetableEntriesForTeacher(entries, currentUserId));
    }

    if (viewMode === "teacher") {
      return sortTimetableEntries(selectedTeacherId && selectedTeacherId !== "all" ? timetableEntriesForTeacher(entries, selectedTeacherId) : entries);
    }

    return sortTimetableEntries(timetableEntriesForClass(entries, selectedGrade, selectedClass));
  }, [canViewAssigned, currentUserId, currentUserRole, entries, selectedClass, selectedGrade, selectedTeacherId, viewMode]);

  const timeRows = useMemo(() => buildTimeRows(entries), [entries]);
  const visibleConflicts = useMemo(() => {
    const visibleIds = new Set(filteredEntries.map((entry) => entry.id));
    return timetableConflicts(entries).filter((entry) => visibleIds.has(entry.id));
  }, [entries, filteredEntries]);

  const legendSubjects = useMemo(() => {
    const unique = Array.from(new Set(filteredEntries.map((entry) => entry.subject)));
    return unique.length > 0 ? unique : ["Mathematics", "Portuguese", "Science"] satisfies TimetableSubject[];
  }, [filteredEntries]);

  const selectedTeacher = useMemo(
    () =>
      teacherList.find((teacher) => teacher.id === (currentUserRole === "teacher" ? currentUserId : selectedTeacherId)) ??
      null,
    [currentUserId, currentUserRole, selectedTeacherId, teacherList],
  );

  const selectionLabel =
    currentUserRole === "teacher" || viewMode === "teacher"
      ? selectedTeacher
        ? `${selectedTeacher.name} timetable`
        : "All teachers timetable"
      : `${selectedGrade} ${selectedClass}`;

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-timetable-shell">
        <div className="sis-timetable-shell-header">
          <div>
            <p className="sis-timetable-shell-subtitle">
              {currentUserRole === "teacher" || viewMode === "teacher"
                ? `Weekly teacher schedule - ${selectedTeacher?.name ?? "Selected teacher"}`
                : "Weekly class schedule - Term 1, 2025"}
            </p>
          </div>

          <div className="sis-timetable-shell-actions">
            <button className="sis-timetable-ghost-button" type="button" onClick={() => window.print()}>
              Print
            </button>
            {canManage && (
              <Link className="sis-timetable-primary-button" href="/sis/timetable/editor">
                Edit timetable
              </Link>
            )}
          </div>
        </div>

        <div className="sis-timetable-controls">
          <label className="sis-field">
            <span className="sis-field-label">Class</span>
            <select
              className="sis-timetable-select"
              value={`${selectedGrade}::${selectedClass}`}
              onChange={(event) => {
                const [grade, className] = event.target.value.split("::");
                setSelectedGrade(grade ?? "Grade 1");
                setSelectedClass(className ?? "A");
              }}
              disabled={currentUserRole === "teacher" || viewMode === "teacher"}
            >
              {classOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sis-field">
            <span className="sis-field-label">Week</span>
            <select className="sis-timetable-select" value={selectedWeek} onChange={(event) => setSelectedWeek(event.target.value)}>
              {weekOptions.map((week) => (
                <option key={week.id} value={week.id}>
                  {week.label}
                </option>
              ))}
            </select>
          </label>

          <label className="sis-field">
            <span className="sis-field-label">View</span>
            <select
              className="sis-timetable-select"
              value={currentUserRole === "teacher" ? "teacher" : viewMode}
              onChange={(event) => setViewMode(event.target.value as ViewMode)}
              disabled={currentUserRole === "teacher"}
            >
              <option value="class">Class view</option>
              <option value="teacher">Teacher view</option>
            </select>
          </label>

          <label className="sis-field">
            <span className="sis-field-label">Teacher</span>
            <select
              className="sis-timetable-select"
              value={currentUserRole === "teacher" ? currentUserId : selectedTeacherId}
              onChange={(event) => setSelectedTeacherId(event.target.value)}
              disabled={currentUserRole === "teacher" || viewMode !== "teacher"}
            >
              {currentUserRole !== "teacher" && <option value="all">All teachers</option>}
              {teacherList.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="sis-timetable-selection-bar">
          <div className="sis-timetable-selection-copy">
            {currentUserRole === "teacher" || viewMode === "teacher"
              ? `Showing the weekly timetable for ${selectedTeacher?.name ?? "all teachers"}.`
              : `Showing the weekly timetable for ${selectedGrade} ${selectedClass}.`}
          </div>
          <div className="sis-chip chip-syncing">{selectionLabel}</div>
        </div>

        <div className="sis-timetable-grid-shell">
          <div className="sis-timetable-grid">
            <div className="sis-timetable-grid-head sis-timetable-grid-head-time">Time</div>
            {timetableDays.map((day) => (
              <div className="sis-timetable-grid-head" key={day}>
                {day}
              </div>
            ))}

            {timeRows.map((row, index) => {
              const cells = buildCellsForRow(filteredEntries, row.startTime);
              const breakLabel = buildBreakLabel(row.endTime, timeRows[index + 1]?.startTime);

              return (
                <FragmentRows
                  key={row.startTime}
                  row={row}
                  cells={cells}
                  breakLabel={breakLabel}
                />
              );
            })}
          </div>
        </div>

        <div className="sis-timetable-footer">
          <div className="sis-timetable-legend">
            {legendSubjects.map((subject) => (
              <div className="sis-timetable-legend-item" key={subject}>
                <span className={`sis-timetable-legend-dot ${subjectClassName(subject)}`} />
                <span>{subject}</span>
              </div>
            ))}
          </div>

          <div className="sis-timetable-inline-meta">
            {visibleConflicts.length} visible conflict{visibleConflicts.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>
    </section>
  );
}

function FragmentRows({
  row,
  cells,
  breakLabel,
}: {
  row: { startTime: string; endTime: string };
  cells: Array<{ day: TimetableDay; entry: TimetableEntry | null }>;
  breakLabel: string | null;
}) {
  return (
    <>
      <div className="sis-timetable-time-cell">{row.startTime}</div>
      {cells.map(({ day, entry }) => (
        <div className="sis-timetable-slot-cell" key={`${day}-${row.startTime}`}>
          {entry ? (
            <article className={`sis-timetable-lesson ${subjectClassName(entry.subject)}`}>
              <div className="sis-timetable-lesson-subject">{entry.subject}</div>
              <div className="sis-timetable-lesson-teacher">{entry.teacherName}</div>
              <div className="sis-timetable-lesson-room">{entry.room}</div>
            </article>
          ) : (
            <div className="sis-timetable-empty-slot" />
          )}
        </div>
      ))}

      {breakLabel && <div className="sis-timetable-break-row">{breakLabel}</div>}
    </>
  );
}

function buildTimeRows(entries: TimetableEntry[]) {
  const keyed = new Map<string, { startTime: string; endTime: string }>();

  for (const entry of sortTimetableEntries(entries)) {
    if (!keyed.has(entry.startTime)) {
      keyed.set(entry.startTime, { startTime: entry.startTime, endTime: entry.endTime });
    }
  }

  return Array.from(keyed.values()).sort((a, b) => a.startTime.localeCompare(b.startTime));
}

function buildCellsForRow(entries: TimetableEntry[], startTime: string) {
  return timetableDays.map((day) => ({
    day,
    entry: entries.find((entry) => entry.day === day && entry.startTime === startTime) ?? null,
  }));
}

function buildBreakLabel(currentEnd?: string, nextStart?: string) {
  if (!currentEnd || !nextStart) {
    return null;
  }

  const currentMinutes = toMinutes(currentEnd);
  const nextMinutes = toMinutes(nextStart);
  if (nextMinutes <= currentMinutes || nextMinutes - currentMinutes < 20) {
    return null;
  }

  return `Break - ${currentEnd} to ${nextStart}`;
}

function toMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function subjectClassName(subject: TimetableSubject) {
  switch (subject) {
    case "Mathematics":
      return "sis-timetable-tone-math";
    case "Portuguese":
      return "sis-timetable-tone-port";
    case "Science":
      return "sis-timetable-tone-sci";
    case "History":
      return "sis-timetable-tone-hist";
    case "English":
      return "sis-timetable-tone-eng";
    case "Phys. Ed.":
      return "sis-timetable-tone-pe";
    default:
      return "sis-timetable-tone-math";
  }
}
