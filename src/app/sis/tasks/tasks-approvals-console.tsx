"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppRole } from "@/lib/rbac";
import { useSession } from "../components/SessionProvider";
import { loadCalendarEvents, loadExamSessions } from "../calendar/calendar-storage";
import { loadManagedClasses } from "../classes/class-storage";
import { loadStaffMembers } from "../employees/employee-storage";
import { loadInvoices } from "../fees/fee-storage";
import { classGradeEntries, loadGradeEntries } from "../grades/grades-storage";
import {
  loadPayrollEntries,
  loadPayrollSettings,
  loadSalaryAdvances,
  PayrollEntry,
  payrollDueDate,
  payrollDueState,
  PayrollSettings,
  SalaryAdvance,
  todayDateString,
} from "../payroll/payroll-storage";
import { loadStudents } from "../students/student-storage";
import { groupedAssignments, loadSubjectAssignments, ManagedSubjectAssignment } from "../subjects/subject-storage";
import {
  loadFeeInvoiceBankAccounts,
  loadInstituteProfileSettings,
  FeeInvoiceBankAccount,
  InstituteProfileSettings,
} from "../settings/settings-storage";
import { loadTimetableEntries, timetableConflicts, timetableEntriesForTeacher } from "../timetable/timetable-storage";

type TaskPriority = "high" | "medium" | "low";

type TaskSection = "approval" | "task";

type TaskItem = {
  id: string;
  section: TaskSection;
  title: string;
  description: string;
  sourceLabel: string;
  href: string;
  priority: TaskPriority;
  visibleTo: AppRole[];
  visibleUserIds?: string[];
};

export default function TasksApprovalsConsole() {
  const { currentUser } = useSession();
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(loadPayrollSettings());
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [studentsLoaded, setStudentsLoaded] = useState(loadStudents());
  const [classesLoaded, setClassesLoaded] = useState(loadManagedClasses());
  const [subjectAssignments, setSubjectAssignments] = useState(loadSubjectAssignments());
  const [invoices, setInvoices] = useState(loadInvoices());
  const [gradeEntries, setGradeEntries] = useState(loadGradeEntries());
  const [timetableEntries, setTimetableEntries] = useState(loadTimetableEntries());
  const [calendarEvents, setCalendarEvents] = useState(loadCalendarEvents());
  const [examSessions, setExamSessions] = useState(loadExamSessions());
  const [instituteProfile, setInstituteProfile] = useState<InstituteProfileSettings>(loadInstituteProfileSettings());
  const [bankAccounts, setBankAccounts] = useState<FeeInvoiceBankAccount[]>(loadFeeInvoiceBankAccounts());

  useEffect(() => {
    const syncAll = () => {
      setPayrollEntries(loadPayrollEntries());
      setPayrollSettings(loadPayrollSettings());
      setSalaryAdvances(loadSalaryAdvances());
      setStudentsLoaded(loadStudents());
      setClassesLoaded(loadManagedClasses());
      setSubjectAssignments(loadSubjectAssignments());
      setInvoices(loadInvoices());
      setGradeEntries(loadGradeEntries());
      setTimetableEntries(loadTimetableEntries());
      setCalendarEvents(loadCalendarEvents());
      setExamSessions(loadExamSessions());
      setInstituteProfile(loadInstituteProfileSettings());
      setBankAccounts(loadFeeInvoiceBankAccounts());
    };

    const timeoutId = window.setTimeout(syncAll, 0);
    window.addEventListener("sis:settings-updated", syncAll);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener("sis:settings-updated", syncAll);
    };
  }, []);

  const role = currentUser?.role ?? null;
  const allItems = useMemo(
    () =>
      buildTaskItems({
        payrollEntries,
        payrollSettings,
        salaryAdvances,
        students: studentsLoaded,
        classes: classesLoaded,
        subjectAssignments,
        invoices,
        gradeEntries,
        timetableEntries,
        calendarEvents,
        examSessions,
        instituteProfile,
        bankAccounts,
      }),
    [
      payrollEntries,
      payrollSettings,
      salaryAdvances,
      studentsLoaded,
      classesLoaded,
      subjectAssignments,
      invoices,
      gradeEntries,
      timetableEntries,
      calendarEvents,
      examSessions,
      instituteProfile,
      bankAccounts,
    ],
  );

  const visibleItems = useMemo(() => {
    if (!role || !currentUser) {
      return [] as TaskItem[];
    }

    return allItems
      .filter((item) => item.visibleTo.includes(role))
      .filter((item) => !item.visibleUserIds || item.visibleUserIds.includes(currentUser.id))
      .sort(byPriority);
  }, [allItems, currentUser, role]);

  const showApprovals = role === "super_admin";
  const pendingApprovals = useMemo(
    () => visibleItems.filter((item) => item.section === "approval"),
    [visibleItems],
  );
  const openTasks = useMemo(
    () => visibleItems.filter((item) => item.section === "task"),
    [visibleItems],
  );
  const highPriorityCount = visibleItems.filter((item) => item.priority === "high").length;

  if (!role || role === "parent") {
    return null;
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">{showApprovals ? "Pending approvals" : "My queue"}</span>
            <span className="sis-page-metric-value">{showApprovals ? pendingApprovals.length : openTasks.length}</span>
            <span className="sis-page-metric-note">
              {showApprovals ? "Awaiting formal review" : "Tasks relevant to this role"}
            </span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Open tasks</span>
            <span className="sis-page-metric-value">{openTasks.length}</span>
            <span className="sis-page-metric-note">Incomplete setup or follow-up work</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">High priority</span>
            <span className="sis-page-metric-value">{highPriorityCount}</span>
            <span className="sis-page-metric-note">Needs attention first</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Open items</span>
            <span className="sis-page-metric-value">{visibleItems.length}</span>
            <span className="sis-page-metric-note">Direct links back to the source screens</span>
          </article>
        </div>
      </section>

      <div className="sis-workspace-grid">
        {showApprovals ? (
          <section className="sis-panel sis-panel-light">
            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Pending approvals</h2>
                <p className="sis-panel-subtitle">Formal approvals waiting on a manager decision.</p>
              </div>
            </div>

            {pendingApprovals.length > 0 ? (
              <div className="sis-data-list">
                {pendingApprovals.map((item) => (
                  <TaskRow item={item} key={item.id} />
                ))}
              </div>
            ) : (
              <div className="sis-empty-state">No pending approvals right now.</div>
            )}
          </section>
        ) : null}

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">{showApprovals ? "Open tasks" : "My open tasks"}</h2>
              <p className="sis-panel-subtitle">
                {showApprovals
                  ? "Operational tasks that help improve data quality and system completeness."
                  : "Actionable work items derived from your role and current system data."}
              </p>
            </div>
          </div>

          {openTasks.length > 0 ? (
            <div className="sis-data-list">
              {openTasks.map((item) => (
                <TaskRow item={item} key={item.id} />
              ))}
            </div>
          ) : (
            <div className="sis-empty-state">No open tasks detected for this role right now.</div>
          )}
        </section>
      </div>
    </section>
  );
}

function TaskRow({ item }: { item: TaskItem }) {
  return (
    <article className="sis-data-item">
      <div>
        <div className="sis-data-heading">{item.title}</div>
        <div className="sis-data-meta">{item.description}</div>
      </div>
      <div className="sis-row-actions sis-row-actions-wrap">
        <span className={`sis-chip ${priorityChip(item.priority)}`}>{item.priority}</span>
        <Link className={`sis-table-action-button${item.section === "task" ? " sis-table-action-button-muted" : ""}`} href={item.href}>
          {item.sourceLabel}
        </Link>
      </div>
    </article>
  );
}

function buildTaskItems({
  payrollEntries,
  payrollSettings,
  salaryAdvances,
  students,
  classes,
  subjectAssignments,
  invoices,
  gradeEntries,
  timetableEntries,
  calendarEvents,
  examSessions,
  instituteProfile,
  bankAccounts,
}: {
  payrollEntries: PayrollEntry[];
  payrollSettings: PayrollSettings;
  salaryAdvances: SalaryAdvance[];
  students: ReturnType<typeof loadStudents>;
  classes: ReturnType<typeof loadManagedClasses>;
  subjectAssignments: ReturnType<typeof loadSubjectAssignments>;
  invoices: ReturnType<typeof loadInvoices>;
  gradeEntries: ReturnType<typeof loadGradeEntries>;
  timetableEntries: ReturnType<typeof loadTimetableEntries>;
  calendarEvents: ReturnType<typeof loadCalendarEvents>;
  examSessions: ReturnType<typeof loadExamSessions>;
  instituteProfile: InstituteProfileSettings;
  bankAccounts: FeeInvoiceBankAccount[];
}) {
  const superAdminRoles: AppRole[] = ["super_admin"];
  const pedagogyRoles: AppRole[] = ["pedagogy_coordinator"];
  const secretaryRoles: AppRole[] = ["secretary_admin"];
  const staffSupportRoles: AppRole[] = ["staff_support"];

  const items: TaskItem[] = [];
  const today = todayDateString();
  const currentPeriod = today.slice(0, 7);
  const currentPeriodEntries = payrollEntries.filter((entry) => entry.period === currentPeriod);
  const activeStaffCount = loadStaffMembers().filter((member) => member.status === "Active").length;
  const currentDueState = payrollDueState(
    currentPeriod,
    payrollSettings.salaryDueDay,
    today,
    currentPeriodEntries,
    activeStaffCount,
  );
  const paidCount = currentPeriodEntries.filter((entry) => entry.status === "paid").length;
  const unpaidCount = Math.max(activeStaffCount - paidCount, 0);

  const profileMissingFields = [
    !instituteProfile.instituteName.trim() ? "institute name" : null,
    !instituteProfile.phone.trim() ? "phone number" : null,
    !instituteProfile.address.trim() ? "address" : null,
    !instituteProfile.country.trim() ? "country" : null,
  ].filter(Boolean);

  if (profileMissingFields.length > 0) {
    items.push({
      id: "task-settings-profile-incomplete",
      section: "task",
      title: "Institute profile is incomplete",
      description: `Add ${profileMissingFields.join(", ")} so school identity is complete across the SIS.`,
      sourceLabel: "Open settings",
      href: "/sis/settings/profile",
      priority: "medium",
      visibleTo: superAdminRoles,
    });
  }

  if (bankAccounts.length === 0 || !bankAccounts.some((account) => account.isDefault)) {
    items.push({
      id: "task-settings-bank-default",
      section: "task",
      title: "Fee invoice bank details are not fully configured",
      description: bankAccounts.length === 0
        ? "Add at least one bank account for invoice payment instructions."
        : "Choose one default bank account for invoice payment instructions.",
      sourceLabel: "Open bank settings",
      href: "/sis/settings/banks",
      priority: "medium",
      visibleTo: superAdminRoles,
    });
  }

  if (currentDueState !== "closed") {
    const dueDate = payrollDueDate(currentPeriod, payrollSettings.salaryDueDay);
    if (currentDueState === "due_today") {
      items.push({
        id: `task-payroll-due-${currentPeriod}`,
        section: "task",
        title: `Payroll for ${formatPayrollPeriod(currentPeriod)} is due today`,
        description: `Salary payments are due today (${dueDate}) and still need follow-up for remaining unpaid staff.`,
        sourceLabel: "Open payroll",
        href: `/sis/payroll?month=${currentPeriod}`,
        priority: "high",
        visibleTo: [...superAdminRoles, ...secretaryRoles],
      });
    } else if (currentDueState === "overdue") {
      items.push({
        id: `task-payroll-overdue-${currentPeriod}`,
        section: "task",
        title: `Payroll for ${formatPayrollPeriod(currentPeriod)} is overdue`,
        description: `The salary due date was ${dueDate}. Review remaining salary payments and close the payroll run.`,
        sourceLabel: "Open payroll",
        href: `/sis/payroll?month=${currentPeriod}`,
        priority: "high",
        visibleTo: [...superAdminRoles, ...secretaryRoles],
      });
    } else if (unpaidCount > 0) {
      const daysUntilDue = daysBetween(today, dueDate);
      items.push({
        id: `task-payroll-upcoming-${currentPeriod}`,
        section: "task",
        title: `Payroll for ${formatPayrollPeriod(currentPeriod)} is upcoming`,
        description: `Salary is due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} on ${dueDate}. Prepare payroll before the due date.`,
        sourceLabel: "Open payroll",
        href: `/sis/payroll?month=${currentPeriod}`,
        priority: "medium",
        visibleTo: [...superAdminRoles, ...secretaryRoles],
      });
    }
  }

  payrollEntries
    .filter((entry) => entry.status === "draft")
    .forEach((entry) => {
      items.push({
        id: `approval-payroll-${entry.id}`,
        section: "approval",
        title: `${entry.employeeName} salary payment is awaiting approval`,
        description: `${entry.employeeCode} · ${entry.period} · Net ${formatMT(entry.netSalary)}`,
        sourceLabel: "Open payroll payment",
        href: `/sis/payroll/${entry.staffId}?month=${entry.period}`,
        priority: "high",
        visibleTo: superAdminRoles,
      });
    });

  salaryAdvances
    .filter((advance) => advance.status === "requested")
    .forEach((advance) => {
      items.push({
        id: `approval-advance-${advance.id}`,
        section: "approval",
        title: `${advance.employeeName} salary advance needs approval`,
        description: `${advance.employeeCode} · Requested ${formatMT(advance.amount)} · ${advance.deductionMode === "full" ? "Full recovery" : "Partial recovery"}`,
        sourceLabel: "Open salary advances",
        href: "/sis/payroll/advances",
        priority: "high",
        visibleTo: superAdminRoles,
      });
    });

  students
    .filter((student) => student.status === "Active")
    .filter((student) => !student.guardianEmail || !student.homeAddress)
    .forEach((student) => {
      items.push({
        id: `task-student-${student.id}`,
        section: "task",
        title: `${student.fullName} registration is incomplete`,
        description: `Missing ${[
          !student.guardianEmail ? "guardian email" : null,
          !student.homeAddress ? "home address" : null,
        ]
          .filter(Boolean)
          .join(" and ")}`,
        sourceLabel: "Open students",
        href: "/sis/students",
        priority: "high",
        visibleTo: [...superAdminRoles, ...secretaryRoles],
      });
    });

  students
    .filter((student) => student.status === "Withdrawn")
    .forEach((student) => {
      items.push({
        id: `task-withdrawn-${student.id}`,
        section: "task",
        title: `${student.fullName} still needs archive follow-up`,
        description: `${student.studentCode} is marked withdrawn but still needs administrative closure.`,
        sourceLabel: "Review students",
        href: "/sis/students",
        priority: "medium",
        visibleTo: [...superAdminRoles, ...secretaryRoles],
      });
    });

  classes
    .filter((item) => item.status === "Active")
    .filter((item) => !item.classTeacherId || item.classTeacherName === "Unassigned" || item.monthlyTuition <= 0)
    .forEach((item) => {
      items.push({
        id: `task-class-${item.id}`,
        section: "task",
        title: `${item.displayName} class setup is incomplete`,
        description: `${[
          !item.classTeacherId || item.classTeacherName === "Unassigned" ? "missing class teacher" : null,
          item.monthlyTuition <= 0 ? "missing tuition amount" : null,
        ]
          .filter(Boolean)
          .join(" and ")}`,
        sourceLabel: "Open classes",
        href: "/sis/classes",
        priority: "high",
        visibleTo: [...superAdminRoles, ...pedagogyRoles],
      });
    });

  groupedAssignments(subjectAssignments)
    .filter((group) => group.subjects.length === 0)
    .forEach((group) => {
      items.push({
        id: `task-subjects-${group.classId}`,
        section: "task",
        title: `${group.displayName} has no subjects assigned`,
        description: `Assign subjects and teachers before timetable, exams, and grades rely on this class.`,
        sourceLabel: "Assign subjects",
        href: "/sis/subjects/new",
        priority: "high",
        visibleTo: [...superAdminRoles, ...pedagogyRoles],
      });
    });

  invoices
    .filter((invoice) => invoice.status === "overdue")
    .filter((invoice) => invoice.reminderCount === 0)
    .forEach((invoice) => {
      items.push({
        id: `task-invoice-${invoice.id}`,
        section: "task",
        title: `${invoice.studentName} has an overdue invoice with no reminder sent`,
        description: `${invoice.chargeType} · Balance ${formatMT(invoice.balance)} · Due ${invoice.dueDate}`,
        sourceLabel: "Open school fees",
        href: "/sis/fees",
        priority: "medium",
        visibleTo: [...superAdminRoles, ...secretaryRoles],
      });
    });

  const conflicts = timetableConflicts(timetableEntries);
  if (conflicts.length > 0) {
    items.push({
      id: "task-timetable-conflicts",
      section: "task",
      title: `${conflicts.length} timetable conflicts need review`,
      description: "Resolve teacher or class slot overlaps before publishing the schedule broadly.",
      sourceLabel: "Open timetable editor",
      href: "/sis/timetable/editor",
      priority: "high",
      visibleTo: [...superAdminRoles, ...pedagogyRoles],
    });
  }

  gradeEntries
    .filter((entry) => entry.moderationStatus === "submitted")
    .forEach((entry) => {
      items.push({
        id: `task-grade-review-${entry.id}`,
        section: "task",
        title: `${entry.studentName} grades are waiting for academic review`,
        description: `${entry.grade} ${entry.className} · ${entry.subject} · ${entry.term}`,
        sourceLabel: "Open grades",
        href: "/sis/grades",
        priority: "medium",
        visibleTo: [...superAdminRoles, ...pedagogyRoles],
      });
    });

  examSessions
    .filter((session) => session.status === "draft")
    .forEach((session) => {
      items.push({
        id: `task-exam-draft-${session.id}`,
        section: "task",
        title: `${session.subject} exam session is still in draft`,
        description: `${session.grade} ${session.className} · ${session.sessionType} · ${session.examDate}`,
        sourceLabel: "Open exam scheduler",
        href: "/sis/calendar/exams",
        priority: "medium",
        visibleTo: [...superAdminRoles, ...pedagogyRoles],
      });
    });

  calendarEvents
    .filter((event) => event.status === "planned")
    .forEach((event) => {
      items.push({
        id: `task-calendar-${event.id}`,
        section: "task",
        title: `${event.title} is still planned`,
        description: `${event.eventType} · ${event.startDate} to ${event.endDate}`,
        sourceLabel: "Open academic calendar",
        href: "/sis/calendar",
        priority: "low",
        visibleTo: [...pedagogyRoles, ...staffSupportRoles],
      });
    });

  const teacherAssignments = subjectAssignments.reduce<Record<string, ManagedSubjectAssignment[]>>((acc, assignment) => {
    if (!acc[assignment.teacherId]) {
      acc[assignment.teacherId] = [];
    }
    acc[assignment.teacherId]!.push(assignment);
    return acc;
  }, {});

  Object.entries(teacherAssignments).forEach(([teacherId, assignments]) => {
    const ownTimetable = timetableEntriesForTeacher(timetableEntries, teacherId);
    if (ownTimetable.length === 0) {
      items.push({
        id: `task-teacher-timetable-${teacherId}`,
        section: "task",
        title: "Your timetable has no assigned lesson slots",
        description: "You have subject assignments but no visible teaching timetable yet.",
        sourceLabel: "Open timetable",
        href: "/sis/timetable",
        priority: "high",
        visibleTo: teacherRolesFor(teacherId),
        visibleUserIds: [teacherId],
      });
    }

    assignments.forEach((assignment) => {
      const entries = classGradeEntries(
        gradeEntries,
        assignment.grade,
        assignment.className,
        assignment.subjectName,
        "T1",
      );

      if (entries.length === 0) {
        items.push({
          id: `task-gradebook-missing-${assignment.id}`,
          section: "task",
          title: `${assignment.subjectName} gradebook still needs first entries`,
          description: `${assignment.grade} ${assignment.className} · No grades saved yet for T1.`,
          sourceLabel: "Open grades",
          href: "/sis/grades",
          priority: "medium",
          visibleTo: teacherRolesFor(teacherId),
          visibleUserIds: [teacherId],
        });
        return;
      }

      const draftCount = entries.filter((entry) => entry.moderationStatus === "draft").length;
      if (draftCount > 0) {
        items.push({
          id: `task-gradebook-draft-${assignment.id}`,
          section: "task",
          title: `${assignment.subjectName} grades still need submission`,
          description: `${assignment.grade} ${assignment.className} · ${draftCount} learner records still in draft.`,
          sourceLabel: "Open grades",
          href: "/sis/grades",
          priority: "medium",
          visibleTo: teacherRolesFor(teacherId),
          visibleUserIds: [teacherId],
        });
      }
    });
  });

  return items;
}

function teacherRolesFor(teacherId: string): AppRole[] {
  void teacherId;
  return ["teacher"];
}

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

function formatPayrollPeriod(period: string) {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  return Math.max(Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)), 0);
}

function byPriority(a: TaskItem, b: TaskItem) {
  const rank = { high: 0, medium: 1, low: 2 };
  if (rank[a.priority] !== rank[b.priority]) {
    return rank[a.priority] - rank[b.priority];
  }

  return a.title.localeCompare(b.title);
}

function priorityChip(priority: TaskPriority) {
  if (priority === "high") {
    return "chip-error";
  }

  if (priority === "medium") {
    return "chip-pending";
  }

  return "chip-syncing";
}
