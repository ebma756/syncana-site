"use client";

import Link from "next/link";
import { AppRole } from "@/lib/rbac";
import { useSession } from "./SessionProvider";

type DashboardData = {
  totalStudents: number;
  feeCollectionPct: number;
  revenueMTD: number;
  cashFlowMTD: number;
  attendanceToday: number;
  revenueChange: string;
  cashFlowChange: string;
  feeOutstanding: number;
  absencesToday: number;
  estimatedFeesThisMonth: number;
  feesCollectedThisMonth: number;
  feesRemainingThisMonth: number;
  cashFlowSeries: Array<{ label: string; income: number; expense: number }>;
  feeCollection: Array<{ class: string; collected: number }>;
  alerts: Array<{ id: string; text: string; time: string; color: string }>;
  recentPayments: Array<{
    student: string;
    class: string;
    amount: string;
    date: string;
    status: string;
  }>;
};

export default function DashboardOverview({ data }: { data: DashboardData }) {
  const { currentUser, roleMeta } = useSession();
  if (!currentUser) {
    return null;
  }
  const roleView = roleMeta[currentUser.role];
  const heroActions = heroActionRoutes[currentUser.role];
  const dashboardTitle =
    currentUser.role === "super_admin" ? "Institutional Health Dashboard" : roleView.dashboardTitle;
  const dashboardCopy =
    currentUser.role === "super_admin"
      ? "Monitor enrollment, collection health, cash flow, and live operational risk from one command view."
      : roleView.dashboardCopy;
  const statCards = buildStatCards(currentUser.role, roleView, data);
  const cashFlowScale = Math.max(
    1,
    ...data.cashFlowSeries.flatMap((point) => [point.income, point.expense]),
  );

  return (
    <section className="sis-dashboard">
      <div className="sis-hero-card">
        <div>
          <p className="sis-eyebrow">{roleView.dashboardEyebrow}</p>
          <h1 className="sis-hero-title">{dashboardTitle}</h1>
          <p className="sis-hero-copy">{dashboardCopy}</p>
        </div>
        <div className="sis-hero-actions">
          <DashboardAction
            label={heroActions.secondaryLabel ?? roleView.secondaryAction}
            href={heroActions.secondary}
            variant="secondary"
          />
          <DashboardAction
            label={heroActions.primaryLabel ?? roleView.primaryAction}
            href={heroActions.primary}
            variant="primary"
          />
        </div>
      </div>

      <div className="sis-stats-grid">
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            label={card.label}
            value={card.value}
            subcopy={card.subcopy}
            detail={"detail" in card && typeof card.detail === "string" ? card.detail : undefined}
            tone={card.tone}
            badge={"badge" in card && typeof card.badge === "string" ? card.badge : undefined}
            icon={card.icon}
          />
        ))}
      </div>

      <div className="sis-dashboard-grid sis-dashboard-grid-analytics">
        <section className="sis-panel">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Cash flow</h2>
              <p className="sis-panel-subtitle">Monthly income versus payroll expenditure overview.</p>
            </div>
            <div className="sis-cashflow-legend">
              <span className="sis-cashflow-key sis-cashflow-key-expense">Expenses</span>
              <span className="sis-cashflow-key sis-cashflow-key-income">Income</span>
            </div>
          </div>

          <div className="sis-cashflow-chart">
            {data.cashFlowSeries.map((point) => (
              <div className="sis-cashflow-item" key={point.label}>
                <div className="sis-cashflow-bars">
                  <span
                    className="sis-cashflow-bar sis-cashflow-bar-expense"
                    style={{ height: `${Math.max(18, (point.expense / cashFlowScale) * 100)}%` }}
                  />
                  <span
                    className="sis-cashflow-bar sis-cashflow-bar-income"
                    style={{ height: `${Math.max(18, (point.income / cashFlowScale) * 100)}%` }}
                  />
                </div>
                <div className="sis-cashflow-values">
                  <span>{formatMT(point.income)}</span>
                  <span>{formatMT(point.expense)}</span>
                </div>
                <div className="sis-cashflow-label">{point.label}</div>
              </div>
            ))}
          </div>

          <div className="sis-cashflow-summary">
            <span className="sis-cashflow-summary-label">Net movement this month</span>
            <strong className="sis-cashflow-summary-value">{formatMT(data.cashFlowMTD)}</strong>
            <span className="sis-cashflow-summary-change">{data.cashFlowChange}</span>
          </div>
        </section>

        <div className="sis-dashboard-stack">
          <section className="sis-panel">
            <div className="sis-panel-header">
              <div>
                <h2 className="sis-panel-title">Alerts center</h2>
                <p className="sis-panel-subtitle">Operational issues that need attention today.</p>
              </div>
              <Link href="/sis/tasks" className="sis-link-button">
                View alerts
              </Link>
            </div>
            <div className="sis-alert-list sis-alert-list-cards">
              {data.alerts.slice(0, 3).map((alert) => (
                <article
                  className="sis-alert-card"
                  key={alert.id}
                  style={{
                    backgroundColor: `${alert.color}14`,
                    borderColor: `${alert.color}33`,
                  }}
                >
                  <span className="sis-alert-dot" style={{ backgroundColor: alert.color }} />
                  <div>
                    <div className="sis-alert-text">{alert.text}</div>
                    <div className="sis-alert-time">{alert.time}</div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="sis-panel sis-estimate-panel">
            <div>
              <p className="sis-estimate-kicker">Estimated Fee This Month</p>
              <h2 className="sis-estimate-value">{formatMT(data.estimatedFeesThisMonth)}</h2>
              <p className="sis-estimate-copy">Expected collections based on active learners and the current fee setup.</p>
            </div>

            <div className="sis-estimate-ring" aria-hidden="true">
              <div className="sis-estimate-ring-inner" />
            </div>

            <div className="sis-estimate-breakdown">
              <div className="sis-estimate-metric">
                <span className="sis-estimate-label">Collections</span>
                <strong>{formatMT(data.feesCollectedThisMonth)}</strong>
              </div>
              <div className="sis-estimate-divider" />
              <div className="sis-estimate-metric">
                <span className="sis-estimate-label">Remaining</span>
                <strong>{formatMT(data.feesRemainingThisMonth)}</strong>
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="sis-dashboard-grid sis-dashboard-grid-secondary">
        <section className="sis-panel">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Recent fee payments</h2>
              <p className="sis-panel-subtitle">Latest posted collections across classes.</p>
            </div>
            <Link href="/sis/fees" className="sis-link-button">
              Open ledger
            </Link>
          </div>
          <div className="sis-table-wrap">
            <table className="sis-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentPayments.map((payment) => (
                  <tr key={`${payment.student}-${payment.date}`}>
                    <td>{payment.student}</td>
                    <td>{payment.class}</td>
                    <td>{payment.amount}</td>
                    <td>{payment.date}</td>
                    <td>
                      <span className="sis-status-pill">{payment.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="sis-panel">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Fee collection by class</h2>
              <p className="sis-panel-subtitle">See which grades need faster follow-up this week.</p>
            </div>
            <Link href="/sis/fees" className="sis-link-button">
              Open fees
            </Link>
          </div>
          <div className="sis-progress-list">
            {data.feeCollection.map((item) => (
              <div className="sis-progress-row" key={item.class}>
                <div className="sis-progress-meta">
                  <span>{item.class}</span>
                  <span>{item.collected}%</span>
                </div>
                <div className="sis-bar">
                  <div className="sis-bar-fill" style={{ width: `${item.collected}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function DashboardAction({
  label,
  href,
  variant,
}: {
  label: string;
  href?: string;
  variant: "primary" | "secondary";
}) {
  const className = `sis-button sis-button-${variant}`;
  if (!href) {
    return (
      <span className={`${className} sis-button-disabled`} aria-disabled="true">
        <span>{label}</span>
        <span className="sis-button-note">Coming soon</span>
      </span>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function StatIcon({ name }: { name: "students" | "collection" | "revenue" | "attendance" }) {
  if (name === "students") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M9 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 1a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM4 18.5c0-2.1 2.6-3.5 5-3.5s5 1.4 5 3.5V20H4v-1.5Zm11.5 1.5v-1.2c0-1-.4-1.9-1.1-2.6 1.9.1 4.6 1 4.6 3V20h-3.5Z" fill="currentColor" />
      </svg>
    );
  }

  if (name === "collection") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11Zm3 2v7h10v-7H7Zm5 1.3c1.2 0 2 .6 2 1.5 0 .8-.5 1.2-1.7 1.5-.9.2-1.2.3-1.2.7 0 .3.3.5.8.5.6 0 1-.2 1.5-.6l1 .8c-.6.7-1.4 1-2.5 1-1.4 0-2.4-.7-2.4-1.8 0-.9.7-1.4 2-1.7.7-.1 1-.3 1-.6 0-.2-.2-.4-.7-.4-.5 0-.9.2-1.3.5l-1-.8c.7-.7 1.5-1.1 2.5-1.1Z" fill="currentColor" />
      </svg>
    );
  }

  if (name === "revenue") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 18h14v2H3V4h2v14Zm3-4.5 2.8-2.8 2.2 2.2 4-4L19 10.9 13 17l-2.2-2.2L9 16.6l-1-3.1Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 4h-1.4A2 2 0 0 0 15.7 3H8.3a2 2 0 0 0-1.9 1H5a2 2 0 0 0-2 2v13h18V6a2 2 0 0 0-2-2ZM12 8a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 7.5c2.4 0 4.5 1.2 5 2.5H7c.5-1.3 2.6-2.5 5-2.5Z" fill="currentColor" />
    </svg>
  );
}

function StatCard({
  label,
  value,
  subcopy,
  detail,
  tone,
  badge,
  icon,
}: {
  label: string;
  value: string;
  subcopy: string;
  detail?: string;
  tone: "emerald" | "amber" | "blue" | "teal";
  badge?: string;
  icon: "students" | "collection" | "revenue" | "attendance";
}) {
  return (
    <article className={`sis-stat-card sis-stat-card-${tone}`}>
      <div className="sis-stat-head">
        <span className={`sis-stat-icon sis-stat-icon-${tone}`}>
          <StatIcon name={icon} />
        </span>
        {badge ? <span className={`sis-stat-badge sis-stat-badge-${tone}`}>{badge}</span> : null}
      </div>
      <div className="sis-stat-body">
        <p className="sis-stat-label">{label}</p>
        <h2 className="sis-stat-value">{value}</h2>
        <p className="sis-stat-subcopy">{subcopy}</p>
        {detail ? <p className="sis-stat-detail">{detail}</p> : null}
      </div>
      {tone === "amber" ? (
        <div className="sis-stat-progress">
          <span className="sis-stat-progress-fill" style={{ width: value }} />
        </div>
      ) : null}
    </article>
  );
}

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

function fillStatCopy(template: string, count: number) {
  return template.replace("{count}", `${count}`);
}

function buildStatCards(role: AppRole, roleView: ReturnType<typeof useSession>["roleMeta"][AppRole], data: DashboardData) {
  if (role === "super_admin") {
    return [
      {
        label: "Total students",
        value: `${data.totalStudents}`,
        subcopy: roleView.statNotes[0],
        badge: "+12 this term",
        icon: "students" as const,
        tone: "emerald" as const,
      },
      {
        label: "Fee collection",
        value: `${data.feeCollectionPct}%`,
        subcopy: `${data.feeOutstanding} outstanding`,
        badge: "Q3 progress",
        icon: "collection" as const,
        tone: "amber" as const,
      },
      {
        label: "Revenue (MTD)",
        value: formatMT(data.revenueMTD),
        subcopy: data.revenueChange,
        badge: "+8% vs last month",
        icon: "revenue" as const,
        tone: "blue" as const,
      },
      {
        label: "Attendance today",
        value: `${data.attendanceToday}%`,
        subcopy: `${data.absencesToday} absences`,
        badge: `${data.absencesToday} absences`,
        icon: "attendance" as const,
        tone: "teal" as const,
      },
    ];
  }

  return [
    {
      label: roleView.statLabels[0],
      value: `${data.totalStudents}`,
      subcopy: roleView.statNotes[0],
      icon: "students" as const,
      tone: "emerald" as const,
    },
    {
      label: roleView.statLabels[1],
      value: `${data.feeCollectionPct}%`,
      subcopy: fillStatCopy(roleView.statNotes[1], data.feeOutstanding),
      icon: "collection" as const,
      tone: "amber" as const,
    },
    {
      label: roleView.statLabels[2],
      value: formatMT(data.revenueMTD),
      subcopy: roleView.statNotes[2],
      icon: "revenue" as const,
      tone: "blue" as const,
    },
    {
      label: roleView.statLabels[3],
      value: `${data.attendanceToday}%`,
      subcopy: fillStatCopy(roleView.statNotes[3], data.absencesToday),
      icon: "attendance" as const,
      tone: "teal" as const,
    },
  ];
}
const heroActionRoutes: Record<
  AppRole,
  { primary?: string; secondary?: string; primaryLabel?: string; secondaryLabel?: string }
> = {
  super_admin: {
    primary: "/sis/students/new",
    secondary: "/sis/reports",
    primaryLabel: "New admission",
    secondaryLabel: "Export report",
  },
  pedagogy_coordinator: { primary: "/sis/grades", secondary: "/sis/timetable" },
  secretary_admin: { primary: "/sis/students/new", secondary: "/sis/fees" },
  teacher: { primary: "/sis/grades", secondary: "/sis/attendance" },
  parent: {},
  staff_support: { primary: "/sis/tasks", secondary: "/sis/calendar" },
};
