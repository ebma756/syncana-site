"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Permission } from "@/lib/rbac";
import { useSession } from "./SessionProvider";

const navGroups = [
  {
    title: "Main",
    items: [
      { href: "/sis", label: "Dashboard", required: ["dashboard.view"] },
      { href: "/sis/tasks", label: "Tasks & Approvals", required: ["dashboard.view"] },
      { href: "/sis/academics", label: "Pedagogy Hub", required: ["subjects.manage", "timetable.manage", "grades.review"] },
      { href: "/sis/operations", label: "Secretary/Admin", required: ["students.enroll", "fees.invoices.create", "expenses.create"] },
    ],
  },
  {
    title: "Settings",
    items: [
      { href: "/sis/settings/profile", label: "Institute Profile", required: ["settings.manage"] },
      { href: "/sis/settings/fees", label: "Fee Structure", required: ["settings.manage"] },
      { href: "/sis/settings/banks", label: "Fee Invoice Accounts", required: ["settings.manage"] },
      { href: "/sis/settings/grading", label: "Marks Grading", required: ["settings.manage"] },
    ],
  },
  {
    title: "Students",
    items: [
      { href: "/sis/students", label: "All Students", required: ["students.view", "students.enroll"] },
      { href: "/sis/students/new", label: "Add Student", required: ["students.enroll"] },
    ],
  },
  {
    title: "Classes",
    items: [
      { href: "/sis/classes", label: "All Classes", required: ["subjects.manage", "teachers.assign"] },
      { href: "/sis/classes/new", label: "New Class", required: ["subjects.manage", "teachers.assign"] },
    ],
  },
  {
    title: "Subjects",
    items: [
      { href: "/sis/subjects", label: "Classes With Subjects", required: ["subjects.manage", "teachers.assign"] },
      { href: "/sis/subjects/new", label: "Assign Subjects", required: ["subjects.manage", "teachers.assign"] },
    ],
  },
  {
    title: "Employees",
    items: [
      { href: "/sis/employees", label: "All Employees", required: ["staff.manage"] },
      { href: "/sis/employees/new", label: "Add New", required: ["staff.manage"] },
    ],
  },
  {
    title: "Academic",
    items: [
      { href: "/sis/attendance", label: "Attendance", required: ["attendance.mark.school", "attendance.mark.assigned", "attendance.view.child"] },
      { href: "/sis/grades", label: "Grades & Exams", required: ["grades.enter.assigned", "grades.review", "reports.cards.view"] },
    ],
  },
  {
    title: "Calendar",
    items: [
      { href: "/sis/calendar", label: "Academic Calendar", required: ["calendar.manage", "communication.calendar.view"], exactMatch: true },
      { href: "/sis/calendar/exams", label: "Exam Scheduler", required: ["assessments.manage", "communication.calendar.view"] },
    ],
  },
  {
    title: "Timetable",
    items: [
      { href: "/sis/timetable", label: "View Timetable", required: ["timetable.manage", "timetable.view.assigned"], exactMatch: true },
      { href: "/sis/timetable/editor", label: "Timetable Editor", required: ["timetable.manage"] },
    ],
  },
  {
    title: "Finance",
    items: [
      { href: "/sis/fees", label: "School Fees", required: ["fees.invoices.create", "fees.balances.view"] },
      { href: "/sis/store", label: "Store", required: ["store.sales.record", "store.inventory.manage"] },
    ],
  },
  {
    title: "Reports",
    items: [
      { href: "/sis/reports", label: "Reports Hub", required: ["students.view", "students.enroll", "subjects.manage", "fees.reports.view", "cashflow.view", "payroll.view", "reports.cards.view", "reports.cards.generate"], exactMatch: true },
      { href: "/sis/reports/students", label: "Student Reports", required: ["students.view", "students.enroll", "subjects.manage", "reports.cards.generate"] },
      { href: "/sis/reports/fees", label: "Fee Collection", required: ["fees.reports.view", "fees.balances.view"] },
      { href: "/sis/reports/cash-flow", label: "Cash Flow", required: ["cashflow.view", "payroll.view"] },
      { href: "/sis/reports/profit-loss", label: "P&L", required: ["cashflow.view", "payroll.view"] },
      { href: "/sis/reports/accounts", label: "Accounts", required: ["fees.reports.view", "cashflow.view", "payroll.view"] },
      { href: "/sis/reports/custom", label: "Customised Reports", required: ["students.view", "students.enroll", "fees.reports.view", "cashflow.view", "payroll.view", "reports.cards.generate"] },
    ],
  },
  {
    title: "Salary",
    items: [
      { href: "/sis/payroll", label: "Pay Salary", required: ["payroll.manage", "payroll.view"] },
      { href: "/sis/payroll/approvals", label: "Approvals", required: ["payroll.manage", "payroll.view"] },
      { href: "/sis/payroll/advances", label: "Salary Advances", required: ["payroll.manage", "payroll.view"] },
      { href: "/sis/payroll/slips", label: "Salary Paid Slip", required: ["payroll.view", "payroll.manage"] },
      { href: "/sis/payroll/reports", label: "Salary Report", required: ["payroll.view", "payroll.manage"] },
    ],
  },
  {
    title: "Other",
    items: [
      { href: "/sis/comms", label: "Communication", required: ["communication.announcements.send_school", "communication.messages.parent_teacher", "communication.messages.admin_parent"] },
    ],
  },
] satisfies Array<{
  title: string;
  items: Array<{ href: string; label: string; required: Permission[]; exactMatch?: boolean }>;
}>;

export default function SidebarNav() {
  const pathname = usePathname();
  const { canAny } = useSession();
  const visibleGroups = useMemo(
    () =>
      navGroups
        .map((group) => ({
          ...group,
          visibleItems: group.items.filter((item) => canAny(item.required)),
        }))
        .filter((group) => group.visibleItems.length > 0),
    [canAny],
  );
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setOpenGroups((current) => {
        const next: Record<string, boolean> = {};

        for (const group of visibleGroups) {
          const groupActive = group.visibleItems.some((item) => isItemActive(pathname, item));
          const fallbackOpen = group.title === "Main" || groupActive;
          next[group.title] = current[group.title] ?? fallbackOpen;
          if (groupActive) {
            next[group.title] = true;
          }
        }

        const currentKeys = Object.keys(current);
        const nextKeys = Object.keys(next);
        if (currentKeys.length !== nextKeys.length) {
          return next;
        }

        for (const key of nextKeys) {
          if (current[key] !== next[key]) {
            return next;
          }
        }

        return current;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname, visibleGroups]);

  return (
    <nav className="sis-nav">
      {visibleGroups.map((group) => (
        <NavGroup
          key={group.title}
          group={group}
          pathname={pathname}
          isOpen={openGroups[group.title] ?? group.title === "Main"}
          onToggle={() =>
            setOpenGroups((current) => ({
              ...current,
              [group.title]: !(current[group.title] ?? group.title === "Main"),
            }))
          }
        />
      ))}
    </nav>
  );
}

function NavGroup({
  group,
  pathname,
  isOpen,
  onToggle,
}: {
  group: (typeof navGroups)[number] & {
    visibleItems: (typeof navGroups)[number]["items"];
  };
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const groupActive = group.visibleItems.some((item) => isItemActive(pathname, item));

  return (
    <div
      className={`sis-nav-group${
        group.title === "Main" || group.title === "Settings" || group.title === "Employees" || group.title === "Students" || group.title === "Classes" || group.title === "Subjects" || group.title === "Salary" || group.title === "Timetable" || group.title === "Calendar" || group.title === "Reports"
          ? " sis-nav-group-employees"
          : ""
      }${isOpen ? " sis-nav-group-open" : ""}${groupActive ? " sis-nav-group-active" : ""}`}
    >
      <button className="sis-nav-group-toggle" type="button" onClick={onToggle} aria-expanded={isOpen}>
        <span className="sis-nav-group-label">
          <span className="sis-nav-group-icon" aria-hidden="true">
            <GroupIcon title={group.title} />
          </span>
          <span className="sis-nav-section">{group.title}</span>
        </span>
        <span className="sis-nav-chevron" aria-hidden="true">
          <ChevronIcon />
        </span>
      </button>
      <div className={`sis-nav-group-body${isOpen ? "" : " sis-nav-group-body-collapsed"}`}>
        {group.visibleItems.map((item) => {
          const isActive = isItemActive(pathname, item);
        return (
          <Link
            key={`${group.title}-${item.label}`}
            href={item.href}
            className={`sis-nav-link${isActive ? " sis-nav-link-active" : ""}${
              group.title === "Main" || group.title === "Settings" || group.title === "Employees" || group.title === "Students" || group.title === "Classes" || group.title === "Subjects" || group.title === "Salary" || group.title === "Timetable" || group.title === "Calendar" || group.title === "Reports"
                ? " sis-nav-sublink"
                : ""
            }`}
          >
            {item.label}
          </Link>
        );
        })}
      </div>
    </div>
  );
}

function isItemActive(pathname: string, item: (typeof navGroups)[number]["items"][number]) {
  return item.exactMatch
    ? pathname === item.href
    : item.href === "/sis"
      ? pathname === "/sis"
      : pathname === item.href || pathname.startsWith(`${item.href}/`);
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 5l5 5-5 5" />
    </svg>
  );
}

function GroupIcon({ title }: { title: string }) {
  const common = {
    viewBox: "0 0 20 20",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  switch (title) {
    case "Main":
      return (
        <svg {...common}>
          <path d="M3 8.5 10 3l7 5.5V17H3V8.5Z" />
          <path d="M8 17v-4h4v4" />
        </svg>
      );
    case "Settings":
      return (
        <svg {...common}>
          <path d="M4 6h12" />
          <path d="M4 10h12" />
          <path d="M4 14h12" />
          <circle cx="7" cy="6" r="1.5" />
          <circle cx="13" cy="10" r="1.5" />
          <circle cx="9" cy="14" r="1.5" />
        </svg>
      );
    case "Students":
      return (
        <svg {...common}>
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="13.5" cy="8" r="2" />
          <path d="M3.5 16c.6-2.3 2.4-3.5 5-3.5s4.4 1.2 5 3.5" />
          <path d="M11.5 15c.4-1.7 1.7-2.6 3.7-2.6 1 0 1.8.2 2.3.6" />
        </svg>
      );
    case "Classes":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="6" height="5" />
          <rect x="11" y="4" width="6" height="5" />
          <rect x="3" y="11" width="6" height="5" />
          <rect x="11" y="11" width="6" height="5" />
        </svg>
      );
    case "Subjects":
      return (
        <svg {...common}>
          <path d="M5 4.5h8a2 2 0 0 1 2 2V16l-4-1.8L7 16V6.5a2 2 0 0 1 2-2Z" />
          <path d="M7 6h6" />
        </svg>
      );
    case "Employees":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="14" height="10" rx="1.5" />
          <path d="M7 5V3.5h6V5" />
          <path d="M3 9h14" />
        </svg>
      );
    case "Academic":
      return (
        <svg {...common}>
          <path d="M2.5 7.5 10 4l7.5 3.5L10 11 2.5 7.5Z" />
          <path d="M5 9.2V13c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V9.2" />
        </svg>
      );
    case "Calendar":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="14" height="12" rx="1.5" />
          <path d="M6 3v4" />
          <path d="M14 3v4" />
          <path d="M3 8h14" />
        </svg>
      );
    case "Timetable":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="14" height="12" rx="1.5" />
          <path d="M3 8h14" />
          <path d="M8 4v12" />
          <path d="M12.5 8v8" />
        </svg>
      );
    case "Finance":
      return (
        <svg {...common}>
          <path d="M4 6.5h10.5A1.5 1.5 0 0 1 16 8v7.5H5.5A1.5 1.5 0 0 1 4 14V6.5Z" />
          <path d="M4 8h11.5" />
          <circle cx="13" cy="11.8" r="1.1" />
        </svg>
      );
    case "Reports":
      return (
        <svg {...common}>
          <path d="M4 16V9" />
          <path d="M9 16V5" />
          <path d="M14 16v-3" />
          <path d="M3 16h14" />
        </svg>
      );
    case "Salary":
      return (
        <svg {...common}>
          <rect x="3" y="5" width="14" height="10" rx="1.5" />
          <path d="M10 7.5v5" />
          <path d="M12 8.7c0-.8-.9-1.2-2-1.2s-2 .4-2 1.2 1 1.1 2 1.3 2 .5 2 1.4-1 1.4-2 1.4-2-.5-2-1.4" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M4 5h12v8H7l-3 3V5Z" />
        </svg>
      );
  }
}
