"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadManagedClasses } from "../classes/class-storage";
import { groupedAssignments, loadSubjectAssignments, ManagedSubjectAssignment } from "./subject-storage";

export default function SubjectsConsole() {
  const [assignments, setAssignments] = useState<ManagedSubjectAssignment[]>([]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadManagedClasses();
      setAssignments(loadSubjectAssignments());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const grouped = useMemo(() => groupedAssignments(assignments), [assignments]);

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light sis-filter-panel">
        <div className="sis-employees-toolbar">
          <Link href="/sis/subjects/new" className="sis-button sis-button-primary">
            Assign Subjects
          </Link>
        </div>
      </section>

      <section className="sis-employees-grid sis-employees-surface-grid">
        {grouped.map((item) => (
          <article className="sis-employee-card sis-class-card" key={item.classId}>
            <div className="sis-class-card-top">
              <div>
                <h3 className="sis-employee-name">{item.displayName}</h3>
                <p className="sis-employee-role">{item.subjects.length} total subjects</p>
              </div>
            </div>

            {item.subjects.length > 0 ? (
              <div className="sis-subject-list">
                {item.subjects.map((subject) => (
                  <article className="sis-subject-item" key={subject.id}>
                    <div>
                      <div className="sis-data-heading">{subject.subjectName}</div>
                      <div className="sis-data-meta">{subject.teacherName}</div>
                    </div>
                    <div className="sis-data-side">{subject.examMarks} marks</div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="sis-empty-state">No subjects assigned yet.</div>
            )}

            <div className="sis-employee-actions">
              <Link href={`/sis/subjects/new?classId=${item.classId}`} className="sis-card-icon-button">
                Assign subjects
              </Link>
            </div>
          </article>
        ))}

        <Link href="/sis/subjects/new" className="sis-employee-card sis-employee-card-add">
          <div className="sis-employee-add-icon">+</div>
          <h3 className="sis-employee-name">Assign Subjects</h3>
          <p className="sis-employee-role">Attach subjects and teachers to a class</p>
        </Link>
      </section>
    </section>
  );
}
