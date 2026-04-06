import { mockAcademicHub } from "@/app/sis/mock-data";
import PermissionGate from "@/app/sis/components/PermissionGate";

export default function AcademicsPage() {
  const data = mockAcademicHub;

  return (
    <PermissionGate required={["subjects.manage", "timetable.manage", "grades.review"]}>
      <section className="sis-workspace">
        <section className="sis-panel sis-panel-light sis-academics-summary-panel">
          <div className="sis-operations-summary-grid sis-academics-summary-grid">
            <SummaryItem label="Timetable coverage" value={`${data.summary.timetableCoverage}%`} note="Published class schedule" />
            <SummaryItem label="Reports published" value={`${data.summary.publishedReports}`} note="End-of-term cards issued" />
            <SummaryItem label="Students at risk" value={`${data.summary.underperformingStudents}`} note="Need interventions" />
            <SummaryItem label="Grade approvals" value={`${data.summary.pendingGradeApprovals}`} note="Coordinator review queue" />
          </div>
        </section>

        <div className="sis-academics-grid">
          <section className="sis-panel sis-panel-light sis-academics-main-panel">
            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Academic schedule</h2>
                <p className="sis-panel-subtitle">The next major teaching and assessment milestones that need coordination.</p>
              </div>
              <div className="sis-chip chip-syncing">Academic command active</div>
            </div>
            <div className="sis-data-list sis-data-list-dense">
              {data.schedule.map((item) => (
                <article className="sis-data-item sis-data-item-compact" key={item.item}>
                  <div>
                    <div className="sis-data-heading">{item.item}</div>
                    <div className="sis-data-meta">{item.date}</div>
                  </div>
                  <div className={`sis-chip ${scheduleChipClass(item.status)}`}>{item.status}</div>
                </article>
              ))}
            </div>
          </section>

          <section className="sis-panel sis-panel-light sis-academics-focus-panel">
            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Coordinator focus areas</h2>
                <p className="sis-panel-subtitle">Priority workstreams that define the pedagogy lead role.</p>
              </div>
            </div>
            <div className="sis-academics-focus-list">
              {data.tasks.map((task, index) => (
                <article className="sis-academics-focus-item" key={task}>
                  <span className="sis-academics-focus-index">0{index + 1}</span>
                  <div className="sis-academics-focus-copy">
                    <div className="sis-academics-focus-text">{task}</div>
                    <div className="sis-academics-focus-note">{focusAreaNote(index)}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Class performance and curriculum progress</h2>
              <p className="sis-panel-subtitle">Review class completion levels, weak cohorts, and where intervention is needed next.</p>
            </div>
          </div>
          <div className="sis-data-list sis-data-list-dense">
            {data.classes.map((entry) => (
              <article className="sis-data-item sis-data-item-compact sis-academics-performance-row" key={entry.name}>
                <div>
                  <div className="sis-data-heading">{entry.name}</div>
                  <div className="sis-data-meta">Teacher: {entry.teacher}</div>
                </div>
                <div className="sis-academics-performance-meta">
                  <div className="sis-academics-performance-value">{entry.progress}% complete</div>
                  <div className="sis-academics-progress-bar" aria-hidden="true">
                    <span className="sis-academics-progress-fill" style={{ width: `${entry.progress}%` }} />
                  </div>
                </div>
                <div className="sis-academics-performance-status">
                  <div className={`sis-chip ${issueChipClass(entry.issues)}`}>{issueStatusLabel(entry.issues)}</div>
                  <div className="sis-data-meta">{entry.issues}</div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </PermissionGate>
  );
}

function SummaryItem({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="sis-operations-summary-item">
      <div className="sis-kpi-label">{label}</div>
      <div className="sis-operations-summary-value">{value}</div>
      <div className="sis-kpi-note">{note}</div>
    </article>
  );
}

function scheduleChipClass(status: string) {
  if (status === "Published") {
    return "chip-up";
  }
  if (status === "Draft") {
    return "chip-pending";
  }
  return "chip-syncing";
}

function issueChipClass(issue: string) {
  if (issue === "On track") {
    return "chip-up";
  }
  if (issue.includes("below pass mark")) {
    return "chip-error";
  }
  return "chip-pending";
}

function issueStatusLabel(issue: string) {
  if (issue === "On track") {
    return "Healthy";
  }
  if (issue.includes("below pass mark")) {
    return "At risk";
  }
  return "Attention";
}

function focusAreaNote(index: number) {
  const notes = [
    "Align staffing decisions with actual subject and class needs.",
    "Keep the academic calendar and timetable in a publish-ready state.",
    "Close the grading cycle and release results without delay.",
    "Track progression decisions and curriculum support priorities.",
  ];
  return notes[index] ?? "";
}
