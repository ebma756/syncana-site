"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useSession } from "../components/SessionProvider";
import {
  calendarEventTypes,
  CalendarEventFormState,
  deleteCalendarEvent,
  eventStatuses,
  initialCalendarEventFormState,
  loadCalendarEvents,
  persistCalendarEvents,
  sortedCalendarEvents,
  toCalendarEventFormState,
  upsertCalendarEvent,
} from "./calendar-storage";
import { termOptions } from "../grades/grades-storage";
import type { AcademicCalendarEvent } from "./calendar-storage";

export default function CalendarConsole() {
  const { can } = useSession();
  const canManageCalendar = can("calendar.manage");
  const [events, setEvents] = useState<AcademicCalendarEvent[]>([]);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [eventForm, setEventForm] = useState<CalendarEventFormState>(initialCalendarEventFormState);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setEvents(loadCalendarEvents());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const orderedEvents = useMemo(() => sortedCalendarEvents(events), [events]);
  const upcomingEvents = useMemo(
    () => orderedEvents.filter((event) => event.status !== "completed").slice(0, 10),
    [orderedEvents],
  );
  const summary = useMemo(() => {
    const publishedEvents = events.filter((event) => event.status === "published").length;
    return {
      upcomingEvents: events.filter((event) => event.status !== "completed").length,
      publishedEvents,
      plannedEvents: events.filter((event) => event.status === "planned").length,
      completedEvents: events.filter((event) => event.status === "completed").length,
    };
  }, [events]);

  function updateEventForm<K extends keyof CalendarEventFormState>(key: K, value: CalendarEventFormState[K]) {
    setEventForm((current) => ({ ...current, [key]: value }));
  }

  function resetEventForm() {
    setEditingEventId(null);
    setEventForm(initialCalendarEventFormState);
  }

  function saveEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eventForm.title.trim()) {
      return;
    }

    startTransition(() => {
      setEvents((current) => {
        const next = upsertCalendarEvent({ currentEvents: current, form: eventForm, editingId: editingEventId });
        persistCalendarEvents(next);
        return next;
      });
      resetEventForm();
    });
  }

  function editEvent(event: AcademicCalendarEvent) {
    setEditingEventId(event.id);
    setEventForm(toCalendarEventFormState(event));
  }

  function removeEvent(id: string) {
    startTransition(() => {
      setEvents((current) => {
        const next = deleteCalendarEvent(current, id);
        persistCalendarEvents(next);
        return next;
      });
      if (editingEventId === id) {
        resetEventForm();
      }
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <p className="sis-panel-subtitle">
            Plan term milestones, holidays, report-card dates, meetings, and exam windows without mixing them into the
            exam session scheduler.
          </p>
          <div className="sis-chip chip-syncing">
            {canManageCalendar ? "Coordinator controls active" : "Read-only academic calendar"}
          </div>
        </div>

        <div className="sis-kpi-strip">
        <Kpi label="Upcoming events" value={`${summary.upcomingEvents}`} note="Not yet completed" />
        <Kpi label="Published" value={`${summary.publishedEvents}`} note="Shared with school" />
        <Kpi label="Planned" value={`${summary.plannedEvents}`} note="Still in planning" />
        <Kpi label="Completed" value={`${summary.completedEvents}`} note="Archived milestones" />
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <p className="sis-panel-subtitle">
              Publish the term rhythm: exam windows, holidays, meetings, and report-card milestones.
            </p>
          </div>
        </div>

        {canManageCalendar ? (
          <form className="sis-form" onSubmit={saveEvent}>
            <div className="sis-form-grid">
              <label className="sis-field sis-field-span-2">
                <span className="sis-field-label">Event title</span>
                <input
                  className="sis-input"
                  value={eventForm.title}
                  onChange={(input) => updateEventForm("title", input.target.value)}
                  placeholder="Term 1 exam week"
                />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Event type</span>
                <select
                  className="sis-input sis-select"
                  value={eventForm.eventType}
                  onChange={(input) => updateEventForm("eventType", input.target.value as CalendarEventFormState["eventType"])}
                >
                  {calendarEventTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Term</span>
                <select
                  className="sis-input sis-select"
                  value={eventForm.term}
                  onChange={(input) => updateEventForm("term", input.target.value as CalendarEventFormState["term"])}
                >
                  {termOptions.map((term) => (
                    <option key={term} value={term}>
                      {term}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Start date</span>
                <input className="sis-input" type="date" value={eventForm.startDate} onChange={(input) => updateEventForm("startDate", input.target.value)} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">End date</span>
                <input className="sis-input" type="date" value={eventForm.endDate} onChange={(input) => updateEventForm("endDate", input.target.value)} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Audience</span>
                <input className="sis-input" value={eventForm.audience} onChange={(input) => updateEventForm("audience", input.target.value)} placeholder="School / Teachers / Parents" />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Status</span>
                <select
                  className="sis-input sis-select"
                  value={eventForm.status}
                  onChange={(input) => updateEventForm("status", input.target.value as CalendarEventFormState["status"])}
                >
                  {eventStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>
              <label className="sis-field sis-field-span-2">
                <span className="sis-field-label">Notes</span>
                <textarea className="sis-input sis-textarea" value={eventForm.notes} onChange={(input) => updateEventForm("notes", input.target.value)} placeholder="Optional planning notes" />
              </label>
            </div>

            <div className="sis-form-actions">
              <button className="sis-button sis-button-primary" type="submit">
                {editingEventId ? "Update event" : "Add event"}
              </button>
              {editingEventId && (
                <button className="sis-button sis-button-secondary" type="button" onClick={resetEventForm}>
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="sis-empty-state">Your role can view the academic calendar, but only pedagogy leadership can edit it.</div>
        )}

        <div className="sis-divider" />

        <div className="sis-data-list">
          {upcomingEvents.map((event) => (
            <article className="sis-data-item" key={event.id}>
              <div>
                <div className="sis-data-heading">{event.title}</div>
                <div className="sis-data-meta">
                  {event.eventType} · {event.term} · {event.startDate}
                  {event.endDate !== event.startDate ? ` to ${event.endDate}` : ""}
                </div>
                <div className="sis-data-meta">{event.audience}</div>
              </div>
              <div className="sis-row-actions">
                <span className={`sis-chip ${eventChip(event.status)}`}>{event.status}</span>
                {canManageCalendar && (
                  <>
                    <button type="button" className="sis-table-action-button" onClick={() => editEvent(event)}>
                      Edit
                    </button>
                    <button type="button" className="sis-table-action-button sis-table-action-button-warning" onClick={() => removeEvent(event.id)}>
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))}
          {upcomingEvents.length === 0 && <div className="sis-empty-state">No academic events planned yet.</div>}
        </div>
      </section>
    </section>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="sis-kpi">
      <div className="sis-kpi-label">{label}</div>
      <div className="sis-kpi-value">{value}</div>
      <div className="sis-kpi-note">{note}</div>
    </article>
  );
}

function eventChip(status: CalendarEventFormState["status"]) {
  if (status === "published") {
    return "chip-syncing";
  }

  if (status === "completed") {
    return "chip-up";
  }

  return "chip-pending";
}
