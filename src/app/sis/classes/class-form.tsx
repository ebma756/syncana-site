"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import {
  buildClassPayload,
  ClassFormState,
  defaultClassNames,
  defaultGradeLevels,
  findManagedClassById,
  loadManagedClasses,
  persistManagedClasses,
  seedClasses,
  teacherAssignmentOptions,
  toClassFormState,
} from "./class-storage";

export default function ClassForm() {
  const editId = useSearchParams().get("edit");
  const [classes, setClasses] = useState(seedClasses);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setClasses(loadManagedClasses());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const editableClass = findManagedClassById(classes, editId);

  if (editId && !editableClass) {
    return (
      <section className="sis-workspace sis-employees-page">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">{isHydrated ? "Class not found" : "Loading class record"}</h2>
              <p className="sis-panel-subtitle">
                {isHydrated ? "We could not find that class in local storage." : "Fetching the saved class profile."}
              </p>
            </div>
          </div>
        </section>
      </section>
    );
  }

  return <ClassFormContent key={editId ?? "new"} editId={editId} initialForm={toClassFormState(editableClass)} />;
}

function ClassFormContent({ editId, initialForm }: { editId: string | null; initialForm: ClassFormState }) {
  const router = useRouter();
  const [form, setForm] = useState(initialForm.classTeacherId ? initialForm : { ...initialForm, classTeacherId: teacherAssignmentOptions()[0]?.id ?? "" });
  const [isSaving, setIsSaving] = useState(false);
  const teachers = teacherAssignmentOptions();

  function updateForm<K extends keyof ClassFormState>(key: K, value: ClassFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildClassPayload(form, editId);
    if (!payload) {
      return;
    }

    setIsSaving(true);

    startTransition(() => {
      const currentClasses = loadManagedClasses();
      const nextClasses = editId
        ? currentClasses.map((item) => (item.id === editId ? payload : item))
        : [payload, ...currentClasses];

      persistManagedClasses(nextClasses);
      router.push("/sis/classes");
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light sis-form-panel-narrow">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Class setup</h2>
            <p className="sis-panel-subtitle">Create the academic container before enrolling students or assigning subjects.</p>
          </div>
          <div className="sis-row-actions sis-row-actions-wrap">
            <Link href="/sis/classes" className="sis-button sis-button-secondary">
              Back to classes
            </Link>
            <div className="sis-chip chip-syncing">{form.grade}</div>
          </div>
        </div>

        <form className="sis-form" onSubmit={handleSubmit}>
          <div className="sis-form-grid">
            <label className="sis-field">
              <span className="sis-field-label">Grade</span>
              <select className="sis-input sis-select" value={form.grade} onChange={(event) => updateForm("grade", event.target.value)}>
                {defaultGradeLevels.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Class name</span>
              <select className="sis-input sis-select" value={form.className} onChange={(event) => updateForm("className", event.target.value)}>
                {defaultClassNames.map((className) => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Academic year</span>
              <input className="sis-input" value={form.academicYear} onChange={(event) => updateForm("academicYear", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Monthly tuition</span>
              <input className="sis-input" type="number" min="0" value={form.monthlyTuition} onChange={(event) => updateForm("monthlyTuition", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Class teacher</span>
              <select className="sis-input sis-select" value={form.classTeacherId} onChange={(event) => updateForm("classTeacherId", event.target.value)}>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Capacity</span>
              <input className="sis-input" type="number" min="1" value={form.capacity} onChange={(event) => updateForm("capacity", event.target.value)} />
            </label>

            <label className="sis-field">
              <span className="sis-field-label">Status</span>
              <select className="sis-input sis-select" value={form.status} onChange={(event) => updateForm("status", event.target.value as ClassFormState["status"])}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </label>

            <label className="sis-field sis-field-span-2">
              <span className="sis-field-label">Notes</span>
              <textarea className="sis-input sis-textarea" value={form.notes} onChange={(event) => updateForm("notes", event.target.value)} placeholder="Optional notes for this class" />
            </label>
          </div>

          <div className="sis-form-actions">
            <button className="sis-button sis-button-primary" type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : editId ? "Update class" : "Create class"}
            </button>
            <Link href="/sis/classes" className="sis-button sis-button-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </section>
  );
}
