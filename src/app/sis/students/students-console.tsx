"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { classOptions, gradeOptions } from "./student-storage";
import {
  loadExtracurricularPackages,
  loadStudentPackageEnrollments,
  studentPackageSummaries,
} from "../settings/settings-storage";
import {
  loadStudents,
  ManagedStudent,
  persistStudents,
  seedStudents,
  StudentStatus,
} from "./student-storage";

export default function StudentsConsole() {
  const [students, setStudents] = useState<ManagedStudent[]>(seedStudents);
  const [query, setQuery] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedPackageId, setSelectedPackageId] = useState("");
  const [packages, setPackages] = useState(() => loadExtracurricularPackages().filter((entry) => entry.isActive));
  const [packageEnrollmentsVersion, setPackageEnrollmentsVersion] = useState(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStudents(loadStudents());
      setPackages(loadExtracurricularPackages().filter((entry) => entry.isActive));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const syncPackages = () => {
      setPackages(loadExtracurricularPackages().filter((entry) => entry.isActive));
      setPackageEnrollmentsVersion(Date.now());
    };

    window.addEventListener("sis:settings-updated", syncPackages);
    return () => window.removeEventListener("sis:settings-updated", syncPackages);
  }, []);

  const availableGrades = useMemo(() => gradeOptions(), []);
  const availableClasses = useMemo(() => (selectedGrade ? classOptions(selectedGrade) : []), [selectedGrade]);
  const packageMap = useMemo(() => {
    void packageEnrollmentsVersion;
    const activePackages = loadExtracurricularPackages().filter((entry) => entry.isActive);
    const enrollments = loadStudentPackageEnrollments();
    return students.reduce<Record<string, string>>((acc, student) => {
      const names = studentPackageSummaries(student.id, activePackages, enrollments).map((entry) => entry.name);
      acc[student.id] = names.join(", ");
      return acc;
    }, {});
  }, [packageEnrollmentsVersion, students]);

  const filteredStudents = useMemo(() => {
    const term = query.trim().toLowerCase();

    return students.filter((student) => {
      const classLabel = `${student.grade} ${student.className}`.toLowerCase();
      const packageLabel = packageMap[student.id] ?? "";
      const matchesSearch =
        !term ||
        student.fullName.toLowerCase().includes(term) ||
        student.studentCode.toLowerCase().includes(term) ||
        student.guardianName.toLowerCase().includes(term) ||
        student.guardianPhone.toLowerCase().includes(term) ||
        classLabel.includes(term) ||
        student.status.toLowerCase().includes(term) ||
        packageLabel.toLowerCase().includes(term);
      const matchesGrade = !selectedGrade || student.grade === selectedGrade;
      const matchesClass = !selectedClass || student.className === selectedClass;
      const matchesPackage =
        !selectedPackageId ||
        studentPackageSummaries(student.id).some((entry) => entry.id === selectedPackageId);

      return matchesSearch && matchesGrade && matchesClass && matchesPackage;
    });
  }, [packageMap, query, selectedClass, selectedGrade, selectedPackageId, students]);

  const summary = useMemo(() => {
    const active = students.filter((student) => student.status === "Active").length;
    const transferred = students.filter((student) => student.status === "Transferred").length;
    const withdrawn = students.filter((student) => student.status === "Withdrawn").length;
    const archived = students.filter((student) => student.status === "Archived").length;
    return { active, transferred, withdrawn, archived };
  }, [students]);

  function updateStatus(studentId: string, nextStatus: StudentStatus) {
    startTransition(() => {
      setStudents((current) => {
        const next = current.map((student) =>
          student.id === studentId ? { ...student, status: nextStatus } : student,
        );
        persistStudents(next);
        return next;
      });
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light sis-filter-panel">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Showing</span>
            <span className="sis-page-metric-value">
              {filteredStudents.length} of {students.length}
            </span>
            <span className="sis-page-metric-note">Directory results</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Active</span>
            <span className="sis-page-metric-value">{summary.active}</span>
            <span className="sis-page-metric-note">Current enrollment</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Follow-up</span>
            <span className="sis-page-metric-value">{summary.transferred + summary.withdrawn}</span>
            <span className="sis-page-metric-note">Transferred or withdrawn</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Archived</span>
            <span className="sis-page-metric-value">{summary.archived}</span>
            <span className="sis-page-metric-note">Historic records retained</span>
          </article>
        </div>

        <div className="sis-students-filter-row">
          <input
            className="sis-input sis-employee-search sis-students-filter-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search student, code, guardian, class, status, or package"
          />
          <select
            className="sis-input sis-select"
            value={selectedGrade}
            onChange={(event) => {
              const nextGrade = event.target.value;
              setSelectedGrade(nextGrade);
              setSelectedClass((current) => (nextGrade && classOptions(nextGrade).includes(current) ? current : ""));
            }}
          >
            <option value="">All grades</option>
            {availableGrades.map((grade) => (
              <option key={grade} value={grade}>
                {grade}
              </option>
            ))}
          </select>
          <select className="sis-input sis-select" value={selectedClass} onChange={(event) => setSelectedClass(event.target.value)}>
            <option value="">All classes</option>
            {availableClasses.map((className) => (
              <option key={className} value={className}>
                Class {className}
              </option>
            ))}
          </select>
          <select className="sis-input sis-select" value={selectedPackageId} onChange={(event) => setSelectedPackageId(event.target.value)}>
            <option value="">All packages</option>
            {packages.map((pkg) => (
              <option key={pkg.id} value={pkg.id}>
                {pkg.name}
              </option>
            ))}
          </select>
          <Link href="/sis/students/new" className="sis-button sis-button-primary">
            Add Student
          </Link>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Student directory</h2>
            <p className="sis-panel-subtitle">
              Search, filter, and act directly from the main list without leaving the core enrollment workflow.
            </p>
          </div>
          <span className="sis-chip chip-syncing">Package-aware filters active</span>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Student</th>
                <th>Class</th>
                <th>Package</th>
                <th>Guardian</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div className="sis-table-primary">{student.fullName}</div>
                      <div className="sis-table-secondary">{student.studentCode}</div>
                    </td>
                    <td>
                      <div className="sis-table-primary">{student.grade}</div>
                      <div className="sis-table-secondary">Class {student.className}</div>
                    </td>
                    <td>
                      <div className="sis-table-primary">{packageMap[student.id] || "No package"}</div>
                      <div className="sis-table-secondary">
                        {packageMap[student.id] ? "Active extracurricular package" : "Not enrolled in extracurricular package"}
                      </div>
                    </td>
                    <td>
                      <div className="sis-table-primary">{student.guardianName}</div>
                      <div className="sis-table-secondary">{student.guardianPhone}</div>
                    </td>
                    <td>
                      <span className={`sis-chip ${statusChip(student.status)}`}>{student.status}</span>
                    </td>
                    <td>
                      <div className="sis-row-actions">
                        <Link href={`/sis/students/new?edit=${student.id}`} className="sis-table-action-button">
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="sis-table-action-button sis-table-action-button-warning"
                          onClick={() => updateStatus(student.id, student.status === "Transferred" ? "Active" : "Transferred")}
                        >
                          {student.status === "Transferred" ? "Restore" : "Transfer"}
                        </button>
                        <button
                          type="button"
                          className="sis-table-action-button sis-table-action-button-warning"
                          onClick={() => updateStatus(student.id, student.status === "Withdrawn" ? "Active" : "Withdrawn")}
                        >
                          {student.status === "Withdrawn" ? "Reopen" : "Withdraw"}
                        </button>
                        <button
                          type="button"
                          className="sis-table-action-button sis-table-action-button-muted"
                          onClick={() => updateStatus(student.id, student.status === "Archived" ? "Active" : "Archived")}
                        >
                          {student.status === "Archived" ? "Unarchive" : "Archive"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6}>
                    <div className="sis-empty-state">No students match the current grade, class, package, and search filters.</div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function statusChip(status: StudentStatus) {
  if (status === "Active") {
    return "chip-up";
  }

  if (status === "Transferred") {
    return "chip-syncing";
  }

  return "chip-pending";
}
