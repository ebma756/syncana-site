"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import {
  defaultStudentPackageEnrollments,
  loadExtracurricularPackages,
  loadStudentPackageEnrollments,
  persistStudentPackageEnrollments,
  StudentExtracurricularPackageEnrollment,
} from "../settings/settings-storage";
import {
  buildStudentPayload,
  classOptions,
  findStudentById,
  gradeOptions,
  loadStudents,
  persistStudents,
  seedStudents,
  StudentFormState,
  StudentGender,
  StudentStatus,
  toStudentFormState,
} from "./student-storage";

export default function StudentForm() {
  const editId = useSearchParams().get("edit");
  const [students, setStudents] = useState(seedStudents);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStudents(loadStudents());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const editableStudent = findStudentById(students, editId);

  if (editId && !editableStudent) {
    return (
      <section className="sis-workspace sis-employees-page">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">{isHydrated ? "Student not found" : "Loading student record"}</h2>
              <p className="sis-panel-subtitle">
                {isHydrated
                  ? "We could not find that student record in local storage."
                  : "Fetching the saved student profile before editing."}
              </p>
            </div>
          </div>
        </section>
      </section>
    );
  }

  return <StudentFormContent key={editId ?? "new"} editId={editId} initialForm={toStudentFormState(editableStudent)} />;
}

function StudentFormContent({
  editId,
  initialForm,
}: {
  editId: string | null;
  initialForm: StudentFormState;
}) {
  const router = useRouter();
  const [form, setForm] = useState<StudentFormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);
  const [packages, setPackages] = useState(() => loadExtracurricularPackages().filter((entry) => entry.isActive));
  const [enrollments, setEnrollments] = useState<StudentExtracurricularPackageEnrollment[]>(defaultStudentPackageEnrollments);
  const availableGrades = gradeOptions();
  const availableClasses = classOptions(form.grade);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPackages(loadExtracurricularPackages().filter((entry) => entry.isActive));
      setEnrollments(loadStudentPackageEnrollments());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectedPackageIds = editId
    ? enrollments.filter((entry) => entry.studentId === editId && entry.status === "active").map((entry) => entry.packageId)
    : enrollments.filter((entry) => entry.studentId === "__new__" && entry.status === "active").map((entry) => entry.packageId);

  function updateForm<K extends keyof StudentFormState>(key: K, value: StudentFormState[K]) {
    setForm((current) => {
      if (key === "grade") {
        const nextGrade = value as StudentFormState["grade"];
        const nextClasses = classOptions(nextGrade);
        return {
          ...current,
          grade: nextGrade,
          className: nextClasses.includes(current.className) ? current.className : nextClasses[0] ?? current.className,
        };
      }

      return { ...current, [key]: value };
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildStudentPayload(form, editId);
    if (!payload) {
      return;
    }

    setIsSaving(true);

    startTransition(() => {
      const currentStudents = loadStudents();
      const nextStudents = editId
        ? currentStudents.map((student) => (student.id === editId ? payload : student))
        : [payload, ...currentStudents];

      persistStudents(nextStudents);
      persistStudentPackageEnrollments(
        [
          ...enrollments.filter((entry) => entry.studentId !== editId && entry.studentId !== "__new__"),
          ...selectedPackageIds.map((packageId) => ({
            id: `enrollment-${payload.id}-${packageId}`,
            studentId: payload.id,
            packageId,
            status: "active" as const,
            startDate: payload.academicYear ? `${payload.academicYear}-01-01` : "2026-01-01",
          })),
        ],
      );
      router.push("/sis/students");
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <div className="sis-workspace-grid">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Student profile</h2>
              <p className="sis-panel-subtitle">Core identity, class assignment, and enrollment status.</p>
            </div>
            <div className="sis-row-actions sis-row-actions-wrap">
              <Link href="/sis/students" className="sis-button sis-button-secondary">
                Back to students
              </Link>
              <div className="sis-chip chip-syncing">{form.grade}</div>
            </div>
          </div>

          <form className="sis-form" onSubmit={handleSubmit}>
            <div className="sis-form-grid">
              <label className="sis-field">
                <span className="sis-field-label">Student code</span>
                <input
                  className="sis-input"
                  value={form.studentCode}
                  onChange={(event) => updateForm("studentCode", event.target.value)}
                  placeholder="STD-005"
                />
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Full name</span>
                <input
                  className="sis-input"
                  value={form.fullName}
                  onChange={(event) => updateForm("fullName", event.target.value)}
                  placeholder="Student full name"
                />
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Gender</span>
                <select
                  className="sis-input sis-select"
                  value={form.gender}
                  onChange={(event) => updateForm("gender", event.target.value as StudentGender)}
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Birth date</span>
                <input
                  className="sis-input"
                  type="date"
                  value={form.birthDate}
                  onChange={(event) => updateForm("birthDate", event.target.value)}
                />
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Grade</span>
                <select
                  className="sis-input sis-select"
                  value={form.grade}
                  onChange={(event) => updateForm("grade", event.target.value)}
                >
                  {availableGrades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Class</span>
                <select
                  className="sis-input sis-select"
                  value={form.className}
                  onChange={(event) => updateForm("className", event.target.value)}
                >
                  {availableClasses.map((className) => (
                    <option key={className} value={className}>
                      {className}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Academic year</span>
                <input
                  className="sis-input"
                  value={form.academicYear}
                  onChange={(event) => updateForm("academicYear", event.target.value)}
                  placeholder="2026"
                />
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Status</span>
                <select
                  className="sis-input sis-select"
                  value={form.status}
                  onChange={(event) => updateForm("status", event.target.value as StudentStatus)}
                >
                  <option value="Active">Active</option>
                  <option value="Transferred">Transferred</option>
                  <option value="Withdrawn">Withdrawn</option>
                  <option value="Archived">Archived</option>
                </select>
              </label>

              <label className="sis-field sis-field-span-2">
                <span className="sis-field-label">Home address</span>
                <input
                  className="sis-input"
                  value={form.homeAddress}
                  onChange={(event) => updateForm("homeAddress", event.target.value)}
                  placeholder="Neighborhood, district, city"
                />
              </label>
            </div>

            <div className="sis-divider" />

            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Extracurricular package enrollment</h2>
                <p className="sis-panel-subtitle">Attach the billed extracurricular add-on if this student joins the package.</p>
              </div>
            </div>

            <div className="sis-checkbox-grid">
              {packages.length > 0 ? (
                packages.map((pkg) => (
                  <label className="sis-checkbox-card" key={pkg.id}>
                    <input
                      type="checkbox"
                      checked={selectedPackageIds.includes(pkg.id)}
                      onChange={(event) =>
                        setEnrollments((current) => {
                          const targetStudentId = editId ?? "__new__";
                          const withoutPackage = current.filter((entry) => !(entry.studentId === targetStudentId && entry.packageId === pkg.id));
                          if (!event.target.checked) {
                            return withoutPackage;
                          }

                          return [
                            ...withoutPackage,
                            {
                              id: `enrollment-${targetStudentId}-${pkg.id}`,
                              studentId: targetStudentId,
                              packageId: pkg.id,
                              status: "active",
                              startDate: form.academicYear ? `${form.academicYear}-01-01` : "2026-01-01",
                            },
                          ];
                        })
                      }
                    />
                    <span>
                      {pkg.name} · {pkg.monthlyFee.toLocaleString()} MT / month
                    </span>
                  </label>
                ))
              ) : (
                <div className="sis-empty-state">No extracurricular package has been configured yet in Settings.</div>
              )}
            </div>

            <div className="sis-divider" />

            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Guardian details</h2>
                <p className="sis-panel-subtitle">Primary parent or guardian contact for fees, attendance, and alerts.</p>
              </div>
            </div>

            <div className="sis-form-grid">
              <label className="sis-field">
                <span className="sis-field-label">Guardian name</span>
                <input
                  className="sis-input"
                  value={form.guardianName}
                  onChange={(event) => updateForm("guardianName", event.target.value)}
                  placeholder="Parent or guardian name"
                />
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Relationship</span>
                <input
                  className="sis-input"
                  value={form.guardianRelationship}
                  onChange={(event) => updateForm("guardianRelationship", event.target.value)}
                  placeholder="Mother, father, aunt..."
                />
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Guardian phone</span>
                <input
                  className="sis-input"
                  value={form.guardianPhone}
                  onChange={(event) => updateForm("guardianPhone", event.target.value)}
                  placeholder="+258 84 000 0000"
                />
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Guardian email</span>
                <input
                  className="sis-input"
                  type="email"
                  value={form.guardianEmail}
                  onChange={(event) => updateForm("guardianEmail", event.target.value)}
                  placeholder="parent@family.local"
                />
              </label>

              <label className="sis-field sis-field-span-2">
                <span className="sis-field-label">Notes</span>
                <textarea
                  className="sis-input sis-textarea"
                  value={form.notes}
                  onChange={(event) => updateForm("notes", event.target.value)}
                  placeholder="Certificates, transfer notes, health or admin notes"
                />
              </label>
            </div>

            <div className="sis-form-actions">
              <button className="sis-button sis-button-primary" type="submit" disabled={isSaving}>
                {editId ? "Save student" : "Enroll student"}
              </button>
              <Link href="/sis/students" className="sis-button sis-button-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Enrollment preview</h2>
              <p className="sis-panel-subtitle">Quick summary of the record that will be saved.</p>
            </div>
          </div>

          <div className="sis-data-list">
            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">{form.fullName || "Student name"}</div>
                <div className="sis-data-meta">{form.studentCode || "Student code will be generated if empty"}</div>
              </div>
              <div className="sis-data-side">{form.status}</div>
            </article>

            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">Class placement</div>
                <div className="sis-data-meta">
                  {form.grade} · Class {form.className}
                </div>
              </div>
              <div className="sis-data-side">Year {form.academicYear}</div>
            </article>

            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">Primary guardian</div>
                <div className="sis-data-meta">{form.guardianName || "Guardian name"}</div>
                <div className="sis-data-meta">{form.guardianPhone || "Guardian phone"}</div>
              </div>
              <div className="sis-data-side">{form.guardianRelationship || "Relationship"}</div>
            </article>

            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">Operational use</div>
                <div className="sis-data-meta">Fees, attendance, notifications, and report cards all depend on this record.</div>
              </div>
            </article>
          </div>
        </section>
      </div>
    </section>
  );
}
