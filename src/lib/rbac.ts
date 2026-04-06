export const permissions = [
  "settings.manage",
  "dashboard.view",
  "dashboard.finance.view",
  "dashboard.academics.view",
  "alerts.view",
  "staff.manage",
  "staff.roles.assign",
  "staff.attendance.view",
  "staff.performance.view",
  "teachers.view",
  "teachers.assign",
  "payroll.manage",
  "payroll.view",
  "students.enroll",
  "students.view",
  "students.transfer",
  "students.withdraw",
  "students.archive",
  "students.documents.manage",
  "students.certificates.print",
  "attendance.mark.school",
  "attendance.mark.assigned",
  "attendance.view.school",
  "attendance.view.child",
  "attendance.reports.view",
  "attendance.absence.notify",
  "fees.structures.manage",
  "fees.invoices.create",
  "fees.payments.record",
  "fees.balances.view",
  "fees.reminders.send",
  "fees.reports.view",
  "fees.waivers.approve",
  "expenses.create",
  "expenses.approve",
  "expenses.view",
  "cashflow.view",
  "store.sales.record",
  "store.inventory.manage",
  "store.reports.view",
  "subjects.manage",
  "timetable.manage",
  "timetable.view.assigned",
  "calendar.manage",
  "grading.manage",
  "assessments.manage",
  "grades.enter.assigned",
  "grades.review",
  "grades.publish",
  "reports.cards.generate",
  "reports.cards.view",
  "promotions.manage",
  "curriculum.progress.view",
  "performance.reports.view",
  "communication.announcements.send_teachers",
  "communication.announcements.send_school",
  "communication.messages.parent_teacher",
  "communication.messages.admin_parent",
  "communication.calendar.view",
  "notifications.schedule",
  "parent.children.view",
  "payments.history.view",
  "receipts.view",
] as const;

export type Permission = (typeof permissions)[number];

export type AppRole =
  | "super_admin"
  | "pedagogy_coordinator"
  | "secretary_admin"
  | "teacher"
  | "parent"
  | "staff_support";

type RoleDefinition = {
  label: string;
  shortLabel: string;
  subtitle: string;
  dashboardEyebrow: string;
  dashboardTitle: string;
  dashboardCopy: string;
  primaryAction: string;
  secondaryAction: string;
  statLabels: [string, string, string, string];
  statNotes: [string, string, string, string];
  permissions: Permission[] | ["*"];
};

export const roleDefinitions: Record<AppRole, RoleDefinition> = {
  super_admin: {
    label: "Super Admin",
    shortLabel: "SA",
    subtitle: "Full access across owner, pedagogy, and secretary workflows",
    dashboardEyebrow: "Super Admin Overview",
    dashboardTitle: "Run the whole school from one command view.",
    dashboardCopy:
      "Full visibility into finance, staff, pedagogy, enrollment, attendance, and school operations, with role assignment handled when staff members are created.",
    primaryAction: "Add staff member",
    secondaryAction: "Approve payroll",
    statLabels: ["Total students", "Fee collection", "Revenue (MTD)", "Attendance today"],
    statNotes: ["+12 this term", "{count} outstanding", "+8% vs last month", "{count} absences"],
    permissions: ["*"],
  },
  pedagogy_coordinator: {
    label: "Pedagogy Coordinator",
    shortLabel: "PC",
    subtitle: "Academic leadership, grades, timetable, and teacher coordination",
    dashboardEyebrow: "Pedagogy Coordinator",
    dashboardTitle: "Track teaching quality, assessments, and curriculum progress.",
    dashboardCopy:
      "This role focuses on subjects, teacher assignment, timetable, grading, report cards, student performance, and academic planning.",
    primaryAction: "Review grades",
    secondaryAction: "Open timetable",
    statLabels: ["Students tracked", "Fee context", "Academic throughput", "Attendance today"],
    statNotes: ["+12 this term", "{count} families to follow up", "Reports on track", "{count} absences to review"],
    permissions: [
      "dashboard.view",
      "dashboard.academics.view",
      "alerts.view",
      "teachers.view",
      "staff.attendance.view",
      "subjects.manage",
      "teachers.assign",
      "timetable.manage",
      "calendar.manage",
      "grading.manage",
      "assessments.manage",
      "grades.review",
      "grades.publish",
      "reports.cards.generate",
      "promotions.manage",
      "curriculum.progress.view",
      "performance.reports.view",
      "communication.announcements.send_teachers",
      "communication.calendar.view",
      "attendance.reports.view",
    ],
  },
  secretary_admin: {
    label: "Secretary/Admin",
    shortLabel: "AD",
    subtitle: "Enrollment, fees, attendance support, store, and parent comms",
    dashboardEyebrow: "Secretary/Admin Desk",
    dashboardTitle: "Keep the school front office moving without missing a step.",
    dashboardCopy:
      "This role handles student intake, fee operations, receipts, reminders, attendance support, expenses, store activity, and routine parent communication.",
    primaryAction: "Enroll student",
    secondaryAction: "Issue receipt",
    statLabels: ["New enrollments", "Invoices due", "Daily cash", "Parent messages"],
    statNotes: ["This week", "{count} outstanding", "Reconcile by end of day", "{count} follow-ups"],
    permissions: [
      "dashboard.view",
      "alerts.view",
      "students.enroll",
      "students.view",
      "students.transfer",
      "students.withdraw",
      "students.archive",
      "students.documents.manage",
      "students.certificates.print",
      "attendance.mark.school",
      "attendance.view.school",
      "attendance.reports.view",
      "attendance.absence.notify",
      "fees.invoices.create",
      "fees.payments.record",
      "fees.balances.view",
      "fees.reminders.send",
      "fees.reports.view",
      "expenses.create",
      "expenses.view",
      "cashflow.view",
      "store.sales.record",
      "store.inventory.manage",
      "store.reports.view",
      "communication.announcements.send_school",
      "communication.messages.admin_parent",
      "notifications.schedule",
      "payments.history.view",
      "receipts.view",
    ],
  },
  teacher: {
    label: "Teacher",
    shortLabel: "TC",
    subtitle: "Assigned classes, attendance, grades, and parent messaging",
    dashboardEyebrow: "Teacher View",
    dashboardTitle: "Manage your classes, gradebook, and attendance with clarity.",
    dashboardCopy:
      "Teachers work inside their assigned classes and subjects, handling attendance, assessments, grade entry, and parent communication.",
    primaryAction: "Open gradebook",
    secondaryAction: "Mark attendance",
    statLabels: ["Assigned students", "Class follow-up", "Assessment load", "Attendance today"],
    statNotes: ["Active class roster", "{count} families to note", "Pending submissions", "{count} absences flagged"],
    permissions: [
      "dashboard.view",
      "attendance.mark.assigned",
      "attendance.reports.view",
      "timetable.view.assigned",
      "assessments.manage",
      "grades.enter.assigned",
      "performance.reports.view",
      "communication.messages.parent_teacher",
      "communication.calendar.view",
    ],
  },
  parent: {
    label: "Parent",
    shortLabel: "PA",
    subtitle: "Child info, grades, attendance, fees, and school communication",
    dashboardEyebrow: "Parent View",
    dashboardTitle: "Follow your child’s progress, fees, and school updates.",
    dashboardCopy:
      "Parents can monitor their children, view grades and attendance, download report cards, track balances, and communicate with teachers.",
    primaryAction: "View report card",
    secondaryAction: "Message teacher",
    statLabels: ["Children enrolled", "Balances", "Academic progress", "Attendance today"],
    statNotes: ["Family overview", "{count} due soon", "Latest report cycle", "{count} alerts"],
    permissions: [
      "parent.children.view",
      "attendance.view.child",
      "fees.balances.view",
      "payments.history.view",
      "receipts.view",
      "reports.cards.view",
      "communication.messages.parent_teacher",
      "communication.calendar.view",
    ],
  },
  staff_support: {
    label: "Staff Collaborator",
    shortLabel: "SC",
    subtitle: "General school collaborator with basic operational visibility",
    dashboardEyebrow: "Staff Collaborator",
    dashboardTitle: "Stay aligned with school updates and assigned support tasks.",
    dashboardCopy:
      "This generic collaborator role is for non-teaching staff who need a limited operational view without access to sensitive admin or academic controls.",
    primaryAction: "View updates",
    secondaryAction: "Open calendar",
    statLabels: ["Tasks today", "Alerts", "Calendar", "Attendance today"],
    statNotes: ["Assigned support work", "{count} notices", "School schedule", "{count} check-ins"],
    permissions: ["dashboard.view", "alerts.view", "communication.calendar.view"],
  },
};

export function getPermissionsForRole(role: AppRole): Permission[] | ["*"] {
  return roleDefinitions[role].permissions;
}

export function hasPermission(role: AppRole, permission: Permission): boolean {
  const granted = getPermissionsForRole(role);
  return granted[0] === "*" || granted.includes(permission);
}

export function hasAnyPermission(role: AppRole, required: Permission[]): boolean {
  const granted = getPermissionsForRole(role);
  return granted[0] === "*" || required.some((permission) => granted.includes(permission));
}
