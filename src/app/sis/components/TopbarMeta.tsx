"use client";

import { usePathname } from "next/navigation";
import SyncStatus from "./SyncStatus";
import { useSession } from "./SessionProvider";

const pageMeta: Record<string, { title: string; subtitle: string }> = {
  "/sis": { title: "Dashboard", subtitle: "Term 1, 2025 — Week 14" },
  "/sis/dashboard": { title: "Dashboard", subtitle: "Term 1, 2025 — Week 14" },
  "/sis/tasks": { title: "Tasks & Approvals", subtitle: "Centralized pending approvals and open data-management tasks" },
  "/sis/settings/profile": { title: "Institute Profile", subtitle: "School identity, contact information, and invoice-facing branding" },
  "/sis/settings/fees": { title: "Fee Structure", subtitle: "Grade pricing, discount catalog, extracurricular activities, and billed packages" },
  "/sis/settings/banks": { title: "Fee Invoice Accounts", subtitle: "Bank accounts used on fee invoices and transfer instructions" },
  "/sis/settings/grading": { title: "Marks Grading", subtitle: "Marks grading, pass mark, and fail criteria setup" },
  "/sis/reports": { title: "Reports", subtitle: "Operational school reporting, exports, and saved filtered views" },
  "/sis/reports/students": { title: "Student Reports", subtitle: "Filter student lists, guardian details, and report-card drill-downs" },
  "/sis/reports/fees": { title: "Fee Collection Report", subtitle: "Collections, outstanding balances, and payment-state analysis" },
  "/sis/reports/cash-flow": { title: "Cash Flow Report", subtitle: "Operational inflows and outflows from fees, payroll, and store activity" },
  "/sis/reports/profit-loss": { title: "P&L Report", subtitle: "Operating income versus payroll cost for the selected period" },
  "/sis/reports/accounts": { title: "Accounts Report", subtitle: "Payment-channel mix, bank accounts, and finance totals" },
  "/sis/reports/custom": { title: "Customised Reports", subtitle: "Save filtered report views and reopen them later" },
  "/sis/students": { title: "Students", subtitle: "Enrollment, guardians, transfers, and archives" },
  "/sis/students/new": { title: "Students", subtitle: "Create or update student enrollment records" },
  "/sis/classes": { title: "Classes", subtitle: "Class groups, tuition, capacity, and class teacher assignment" },
  "/sis/classes/new": { title: "Classes", subtitle: "Create or update class groups for the academic setup" },
  "/sis/subjects": { title: "Subjects", subtitle: "Review class-subject assignments and teaching ownership" },
  "/sis/subjects/new": { title: "Subjects", subtitle: "Assign subjects and teachers to each class" },
  "/sis/employees": { title: "Employees", subtitle: "All employees and school collaborators" },
  "/sis/employees/new": { title: "Employees", subtitle: "Create staff and assign role permissions" },
  "/sis/academics": { title: "Pedagogy Hub", subtitle: "Timetable, grades, promotions, and teaching quality" },
  "/sis/operations": { title: "Secretary/Admin", subtitle: "Enrollment, fees, store, and communications" },
  "/sis/attendance": { title: "Attendance", subtitle: "Daily registers and absence monitoring" },
  "/sis/calendar": { title: "Academic Calendar", subtitle: "Academic calendar events, milestones, and term planning" },
  "/sis/calendar/exams": { title: "Exam Scheduler", subtitle: "Schedule first-try and second-try exams by class and subject" },
  "/sis/timetable": { title: "Timetable", subtitle: "Weekly lesson schedule for classes and teachers" },
  "/sis/timetable/editor": { title: "Timetable Editor", subtitle: "Create and adjust weekly lesson slots by class and teacher" },
  "/sis/fees": { title: "Fees & Finance", subtitle: "Invoices, balances, reminders, and finance follow-up" },
  "/sis/payroll": { title: "Pay Salary", subtitle: "Pay employee salary and manage monthly salary runs" },
  "/sis/payroll/approvals": { title: "Payroll Approvals", subtitle: "Review pending and approved payroll items in one place" },
  "/sis/payroll/advances": { title: "Salary Advances", subtitle: "Request, approve, and track advance recovery per employee" },
  "/sis/payroll/slips": { title: "Salary Paid Slip", subtitle: "Review paid salary slips per employee and month" },
  "/sis/payroll/reports": { title: "Salary Report", subtitle: "Monthly salary totals, approvals, and payout reporting" },
  "/sis/grades": { title: "Grades & Exams", subtitle: "Assessment review and report cards" },
  "/sis/store": { title: "Store", subtitle: "Inventory and point-of-sale operations" },
  "/sis/comms": { title: "Communications", subtitle: "Announcements and parent-teacher messaging" },
};

export default function TopbarMeta() {
  const pathname = usePathname();
  const { currentUser, roleMeta } = useSession();
  if (!currentUser) {
    return null;
  }
  const meta = resolvePageMeta(pathname);

  return (
    <div className="sis-topbar">
      <div>
        <div className="sis-page-kicker">{meta.title}</div>
        <div className="sis-page-subtitle">{meta.subtitle} · Logged in as {roleMeta[currentUser.role].label}</div>
      </div>
      <div className="sis-topbar-actions">
        <div className="sis-access-note">Permissions come from the signed-in profile</div>
        <SyncStatus />
      </div>
    </div>
  );
}

function resolvePageMeta(pathname: string) {
  if (pathname.startsWith("/sis/reports/students/cards/")) {
    return { title: "Student Report Card", subtitle: "Printable academic summary for one learner" };
  }

  if (pathname.startsWith("/sis/payroll/") && !pathname.startsWith("/sis/payroll/slips") && !pathname.startsWith("/sis/payroll/reports") && !pathname.startsWith("/sis/payroll/advances")) {
    return { title: "Pay Salary", subtitle: "Process one employee salary payment at a time" };
  }

  if (pageMeta[pathname]) {
    return pageMeta[pathname];
  }

  const prefixMatch = Object.entries(pageMeta)
    .filter(([route]) => route !== "/sis" && pathname.startsWith(`${route}/`))
    .sort((a, b) => b[0].length - a[0].length)[0];

  return prefixMatch?.[1] ?? pageMeta["/sis"];
}
