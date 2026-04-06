"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { loadStudents } from "../students/student-storage";
import {
  loadManagedClasses,
  ManagedClass,
  persistManagedClasses,
  seedClasses,
} from "./class-storage";

export default function ClassesConsole() {
  const [classes, setClasses] = useState<ManagedClass[]>(seedClasses);
  const [query, setQuery] = useState("");
  const students = useMemo(() => loadStudents(), []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setClasses(loadManagedClasses());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const filteredClasses = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) {
      return classes;
    }

    return classes.filter((item) => {
      return (
        item.displayName.toLowerCase().includes(term) ||
        item.classTeacherName.toLowerCase().includes(term) ||
        item.academicYear.includes(term)
      );
    });
  }, [classes, query]);

  function toggleStatus(classId: string) {
    startTransition(() => {
      setClasses((current) => {
        const next = current.map((item) =>
          item.id === classId ? { ...item, status: item.status === "Active" ? "Inactive" : "Active" } : item,
        );
        persistManagedClasses(next);
        return next;
      });
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light sis-filter-panel">
        <div className="sis-employees-toolbar">
          <input
            className="sis-input sis-employee-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search class"
          />
          <Link href="/sis/classes/new" className="sis-button sis-button-primary">
            Add New
          </Link>
        </div>
      </section>

      <section className="sis-employees-grid sis-employees-surface-grid">
        {filteredClasses.map((item) => {
          const classStudents = students.filter(
            (student) => student.status === "Active" && student.grade === item.grade && student.className === item.className,
          );
          return (
            <article className="sis-employee-card sis-class-card" key={item.id}>
              <div className="sis-class-card-top">
                <div>
                  <h3 className="sis-employee-name">{item.displayName}</h3>
                  <p className="sis-employee-role">{item.classTeacherName || "No class teacher assigned"}</p>
                </div>
                <span className={`sis-chip ${item.status === "Active" ? "chip-up" : "chip-pending"}`}>{item.status}</span>
              </div>
              <p className="sis-employee-meta">{classStudents.length} active students</p>
              <p className="sis-employee-meta">Academic year {item.academicYear}</p>
              <p className="sis-employee-meta">Monthly tuition {item.monthlyTuition.toLocaleString()} MT</p>
              <p className="sis-employee-meta">Capacity {item.capacity}</p>
              {item.notes ? <p className="sis-employee-meta">{item.notes}</p> : null}
              <div className="sis-employee-actions">
                <Link href={`/sis/classes/new?edit=${item.id}`} className="sis-card-icon-button">
                  Edit
                </Link>
                <button
                  type="button"
                  className="sis-card-icon-button sis-card-icon-button-warning"
                  onClick={() => toggleStatus(item.id)}
                >
                  {item.status === "Active" ? "Deactivate" : "Reactivate"}
                </button>
              </div>
            </article>
          );
        })}

        <Link href="/sis/classes/new" className="sis-employee-card sis-employee-card-add">
          <div className="sis-employee-add-icon">+</div>
          <h3 className="sis-employee-name">Add New</h3>
          <p className="sis-employee-role">Create class and assign teacher</p>
        </Link>
      </section>
    </section>
  );
}
