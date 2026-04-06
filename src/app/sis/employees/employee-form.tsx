"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useState } from "react";
import { roleDefinitions } from "@/lib/rbac";
import {
  assignableRoles,
  buildStaffPayload,
  findStaffMemberById,
  loadStaffMembers,
  ManagedStaffMember,
  persistStaffMembers,
  seedStaff,
  StaffFormState,
  StaffStatus,
  toStaffFormState,
} from "./employee-storage";

export default function EmployeeForm() {
  const editId = useSearchParams().get("edit");
  const [staffMembers, setStaffMembers] = useState(seedStaff);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStaffMembers(loadStaffMembers());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const editableStaff = findStaffMemberById(staffMembers, editId);

  if (editId && !editableStaff) {
    return (
      <section className="sis-workspace sis-employees-page">
        <div className="sis-page-header">
          <div className="sis-workspace-copy">
            <h1 className="sis-workspace-title">{isHydrated ? "Employee not found" : "Loading employee"}</h1>
            <p className="sis-workspace-text">
              {isHydrated
                ? "We could not find that employee profile in local storage."
                : "Fetching the saved employee profile before editing."}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <EmployeeFormContent
      key={editId ?? "new"}
      editId={editId}
      existingMember={editableStaff}
      initialForm={toStaffFormState(editableStaff)}
    />
  );
}

function EmployeeFormContent({
  editId,
  existingMember,
  initialForm,
}: {
  editId: string | null;
  existingMember: ManagedStaffMember | null;
  initialForm: StaffFormState;
}) {
  const router = useRouter();
  const [form, setForm] = useState<StaffFormState>(initialForm);
  const [isSaving, setIsSaving] = useState(false);

  function updateForm<K extends keyof StaffFormState>(key: K, value: StaffFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildStaffPayload(form, editId, existingMember);
    if (!payload) {
      return;
    }

    setIsSaving(true);

    startTransition(() => {
      const currentStaff = loadStaffMembers();
      const nextStaff = editId
        ? currentStaff.map((member) => (member.id === editId ? payload : member))
        : [payload, ...currentStaff];

      persistStaffMembers(nextStaff);
      router.push("/sis/employees");
    });
  }

  const selectedRole = roleDefinitions[form.role];
  const permissions = selectedRole.permissions[0] === "*" ? [] : selectedRole.permissions;
  const accessPreviewItems =
    selectedRole.permissions[0] === "*"
      ? [
          "Manage school settings, staff roles, approvals, and operational workflows.",
          "Review finance, payroll, fees, and school-wide performance from one place.",
          "Open every academic, student, timetable, and reporting module.",
          "Support all user roles without role-based restrictions.",
        ]
      : permissions.map(toReadablePermission);
  const roleSummary = assignableRoles.find((role) => role.key === form.role)?.summary ?? "Role-based access";

  return (
    <section className="sis-workspace sis-employees-page">
      <div className="sis-workspace-grid sis-employees-form-layout">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <p className="sis-panel-subtitle">Capture only the information needed to onboard this staff profile.</p>
            </div>
            <div className="sis-row-actions sis-row-actions-wrap">
              <Link href="/sis/employees" className="sis-button sis-button-secondary">
                Back to employees
              </Link>
              <div className="sis-chip chip-syncing">{selectedRole.label}</div>
            </div>
          </div>

          <form className="sis-form" onSubmit={handleSubmit}>
            <div className="sis-form-stack">
              <section className="sis-form-section">
                <div className="sis-form-section-header">
                  <h3 className="sis-form-section-title">Identity</h3>
                  <p className="sis-form-section-copy">Who this employee is and how the school can contact them.</p>
                </div>
                <div className="sis-form-grid">
                  <label className="sis-field">
                    <span className="sis-field-label">Employee code</span>
                    <input
                      className="sis-input"
                      value={form.employeeCode}
                      onChange={(event) => updateForm("employeeCode", event.target.value)}
                      placeholder="EMP-005"
                    />
                  </label>

                  <label className="sis-field">
                    <span className="sis-field-label">Employee name</span>
                    <input
                      className="sis-input"
                      value={form.name}
                      onChange={(event) => updateForm("name", event.target.value)}
                      placeholder="Name of employee"
                    />
                  </label>

                  <label className="sis-field">
                    <span className="sis-field-label">Email address</span>
                    <input
                      className="sis-input"
                      type="email"
                      value={form.email}
                      onChange={(event) => updateForm("email", event.target.value)}
                      placeholder="staff@school.local"
                    />
                  </label>

                  <label className="sis-field">
                    <span className="sis-field-label">Mobile number</span>
                    <input
                      className="sis-input"
                      value={form.phone}
                      onChange={(event) => updateForm("phone", event.target.value)}
                      placeholder="+258 84 000 0000"
                    />
                  </label>
                </div>
              </section>

              <section className="sis-form-section">
                <div className="sis-form-section-header">
                  <h3 className="sis-form-section-title">Employment</h3>
                  <p className="sis-form-section-copy">Role, status, join date, and salary details for payroll setup.</p>
                </div>
                <div className="sis-form-grid">
                  <label className="sis-field">
                    <span className="sis-field-label">Employee role</span>
                    <select
                      className="sis-input sis-select"
                      value={form.role}
                      onChange={(event) => updateForm("role", event.target.value as StaffFormState["role"])}
                    >
                      {assignableRoles.map((role) => (
                        <option key={role.key} value={role.key}>
                          {roleDefinitions[role.key].label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="sis-field">
                    <span className="sis-field-label">Date joined</span>
                    <input
                      className="sis-input"
                      type="date"
                      value={form.dateJoined}
                      onChange={(event) => updateForm("dateJoined", event.target.value)}
                    />
                  </label>

                  <label className="sis-field">
                    <span className="sis-field-label">Status</span>
                    <select
                      className="sis-input sis-select"
                      value={form.status}
                      onChange={(event) => updateForm("status", event.target.value as StaffStatus)}
                    >
                      <option value="Active">Active</option>
                      <option value="On Leave">On Leave</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </label>

                  <label className="sis-field">
                    <span className="sis-field-label">Monthly salary (MZN)</span>
                    <input
                      className="sis-input"
                      type="number"
                      min="0"
                      value={form.monthlySalary}
                      onChange={(event) => updateForm("monthlySalary", event.target.value)}
                      placeholder="25000"
                    />
                  </label>
                </div>
              </section>

              <section className="sis-form-section">
                <div className="sis-form-section-header">
                  <h3 className="sis-form-section-title">Assignment</h3>
                  <p className="sis-form-section-copy">The main subject, desk, or department this employee will serve.</p>
                </div>
                <div className="sis-form-grid">
                  <label className="sis-field sis-field-span-2">
                    <span className="sis-field-label">Department / assignment</span>
                    <input
                      className="sis-input"
                      value={form.department}
                      onChange={(event) => updateForm("department", event.target.value)}
                      placeholder="Primary Mathematics"
                    />
                  </label>
                </div>
              </section>
            </div>

            <p className="sis-inline-note">
              Attendance and performance are tracked later from real school activity. This screen is only for onboarding
              and access setup.
            </p>

            <div className="sis-form-actions">
              <button className="sis-button sis-button-primary" type="submit" disabled={isSaving}>
                {editId ? "Save employee" : "Create employee"}
              </button>
              <Link href="/sis/employees" className="sis-button sis-button-secondary">
                Cancel
              </Link>
            </div>
          </form>
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Access preview</h2>
              <p className="sis-panel-subtitle">Review this role in plain language before the profile is saved.</p>
            </div>
          </div>

          <div className="sis-access-preview-card">
            <div className="sis-access-preview-head">
              <div>
                <div className="sis-access-preview-role">{selectedRole.label}</div>
                <div className="sis-access-preview-note">{selectedRole.subtitle}</div>
              </div>
              <div className="sis-access-preview-count">
                {selectedRole.permissions[0] === "*" ? "Full access" : `${permissions.length} permissions`}
              </div>
            </div>
            <div className="sis-access-preview-note">
              Suggested assignment: {form.department || selectedRole.label}
            </div>
          </div>

          <section className="sis-access-preview-section">
            <h3 className="sis-access-preview-title">Role summary</h3>
            <p className="sis-access-preview-note">{roleSummary}</p>
          </section>

          <section className="sis-access-preview-section">
            <h3 className="sis-access-preview-title">This employee will be able to</h3>
            <ul className="sis-access-preview-list">
              {accessPreviewItems.map((item) => (
                <li className="sis-access-preview-item" key={item}>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <p className="sis-inline-note sis-inline-note-compact">
            Access follows the selected role automatically after login. Super admin remains the only profile with full
            school-wide access.
          </p>
        </section>
      </div>
    </section>
  );
}

function toReadablePermission(permission: string) {
  const readableMap: Record<string, string> = {
    "dashboard.view": "Open the main dashboard.",
    "attendance.mark.assigned": "Mark attendance for assigned classes.",
    "attendance.mark.school": "Mark attendance across the school.",
    "attendance.reports.view": "View attendance reports.",
    "attendance.view.school": "Review school attendance records.",
    "attendance.absence.notify": "Send absence follow-up notices.",
    "timetable.view.assigned": "View the assigned timetable.",
    "timetable.manage": "Create and edit timetables.",
    "assessments.manage": "Create and manage assessments.",
    "grades.enter.assigned": "Enter grades for assigned subjects.",
    "grades.review": "Review submitted grades.",
    "grades.publish": "Publish final grade results.",
    "subjects.manage": "Manage subjects and class assignments.",
    "teachers.assign": "Assign teachers to classes or subjects.",
    "reports.cards.generate": "Generate report cards.",
    "promotions.manage": "Manage student promotions.",
    "curriculum.progress.view": "Review curriculum progress.",
    "performance.reports.view": "View performance reports.",
    "communication.messages.parent_teacher": "Exchange messages with parents.",
    "communication.messages.admin_parent": "Support parent communication from the office.",
    "communication.announcements.send_school": "Send school-wide announcements.",
    "communication.announcements.send_teachers": "Send teacher announcements.",
    "communication.calendar.view": "View the academic calendar.",
    "students.enroll": "Register new students.",
    "students.view": "View student records.",
    "students.transfer": "Process transfers.",
    "students.withdraw": "Process withdrawals.",
    "students.archive": "Archive student records.",
    "students.documents.manage": "Manage student documents.",
    "students.certificates.print": "Print student certificates.",
    "fees.invoices.create": "Create fee invoices.",
    "fees.payments.record": "Record fee payments.",
    "fees.balances.view": "View balances and outstanding fees.",
    "fees.reminders.send": "Send fee reminders.",
    "fees.reports.view": "View finance reports.",
    "expenses.create": "Capture school expenses.",
    "expenses.view": "View expense records.",
    "cashflow.view": "Monitor daily cash flow.",
    "store.sales.record": "Record store sales.",
    "store.inventory.manage": "Manage store stock.",
    "store.reports.view": "View store reports.",
    "notifications.schedule": "Schedule routine notifications.",
    "payments.history.view": "Review payment history.",
    "receipts.view": "View issued receipts.",
    "teachers.view": "View teacher records.",
    "staff.attendance.view": "View staff attendance data.",
    "alerts.view": "View school alerts.",
    "calendar.manage": "Manage the academic calendar and exams.",
    "grading.manage": "Maintain grading rules and grading setup.",
  };

  if (readableMap[permission]) {
    return readableMap[permission];
  }

  const cleaned = permission.replace(/\./g, " ").replace(/_/g, " ").trim();
  return `${cleaned.charAt(0).toUpperCase()}${cleaned.slice(1)}.`;
}
