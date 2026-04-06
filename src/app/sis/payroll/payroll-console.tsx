"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../components/SessionProvider";
import { loadStaffMembers, ManagedStaffMember, seedStaff } from "../employees/employee-storage";
import {
  defaultPayrollPeriod,
  generatePayrollRun,
  loadPayrollSettings,
  loadPayrollEntries,
  loadSalaryAdvances,
  PayrollDueState,
  payrollEntriesForPeriod,
  payrollDueDate,
  payrollDueState,
  payrollRunEntriesForPeriod,
  PayrollEntry,
  PayrollSettings,
  persistPayrollEntries,
  persistPayrollSettings,
  replacePayrollRun,
  SalaryAdvance,
  todayDateString,
  updatePayrollEntry,
} from "./payroll-storage";

type PayrollStatusFilter = "all" | "unpaid" | "paid";

export default function PayrollConsole() {
  const { can } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const [staffMembers, setStaffMembers] = useState<ManagedStaffMember[]>(() =>
    seedStaff.filter((member) => member.status === "Active"),
  );
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(loadPayrollSettings());
  const [statusFilter, setStatusFilter] = useState<PayrollStatusFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const period = monthParam ?? defaultPayrollPeriod;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setStaffMembers(loadStaffMembers().filter((member) => member.status === "Active"));
      setPayrollEntries(loadPayrollEntries());
      setSalaryAdvances(loadSalaryAdvances());
      setPayrollSettings(loadPayrollSettings());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const periodEntries = useMemo(() => payrollEntriesForPeriod(payrollEntries, period), [payrollEntries, period]);
  const periodRunEntries = useMemo(() => payrollRunEntriesForPeriod(payrollEntries, period), [payrollEntries, period]);
  const dueDate = useMemo(() => payrollDueDate(period, payrollSettings.salaryDueDay), [payrollSettings.salaryDueDay, period]);
  const dueState = useMemo(
    () => payrollDueState(period, payrollSettings.salaryDueDay, todayDateString(), periodEntries, staffMembers.length),
    [payrollSettings.salaryDueDay, period, periodEntries, staffMembers.length],
  );

  const employeeItems = useMemo(() => {
    return staffMembers
      .map((staff) => {
        const entry = periodEntries.find((item) => item.staffId === staff.id) ?? null;
        const isPaid = entry?.status === "paid";
        return { staff, entry, isPaid };
      })
      .filter((item) => {
        const search = searchTerm.trim().toLowerCase();
        if (search) {
          const haystack = [item.staff.name, item.staff.employeeCode, item.staff.role, item.staff.department]
            .join(" ")
            .toLowerCase();
          if (!haystack.includes(search)) {
            return false;
          }
        }

        if (statusFilter === "paid") {
          return item.isPaid;
        }

        if (statusFilter === "unpaid") {
          return !item.isPaid;
        }

        return true;
      })
      .sort((a, b) => {
        if (a.isPaid !== b.isPaid) {
          return a.isPaid ? 1 : -1;
        }
        return a.staff.name.localeCompare(b.staff.name);
      });
  }, [periodEntries, searchTerm, staffMembers, statusFilter]);

  const summary = useMemo(() => {
    const paidCount = periodEntries.filter((entry) => entry.status === "paid").length;
    const unpaidCount = staffMembers.length - paidCount;
    const gross = staffMembers.reduce((sum, member) => sum + member.monthlySalary, 0);
    const scheduledAdvance = periodRunEntries.reduce((sum, entry) => sum + entry.advanceDeduction, 0);
    return { paidCount, unpaidCount, gross, scheduledAdvance, filteredCount: employeeItems.length };
  }, [employeeItems.length, periodEntries, periodRunEntries, staffMembers]);

  useEffect(() => {
    const shouldAutogenerate =
      (dueState === "due_today" || dueState === "overdue") &&
      periodRunEntries.length === 0 &&
      periodEntries.filter((entry) => entry.status === "paid").length < staffMembers.length;

    if (!shouldAutogenerate) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPayrollEntries((current) => {
        const nextRun = generatePayrollRun(period, current, salaryAdvances);
        const next = replacePayrollRun({ currentEntries: current, period, nextRun });
        persistPayrollEntries(next);
        return next;
      });
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [dueState, period, periodEntries, periodRunEntries.length, salaryAdvances, staffMembers.length]);

  function syncPeriod(nextPeriod: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", nextPeriod);
    router.replace(`/sis/payroll?${params.toString()}`);
  }

  function ensureRun() {
    startTransition(() => {
      setPayrollEntries((current) => {
        const nextRun = generatePayrollRun(period, current, salaryAdvances);
        const next = replacePayrollRun({ currentEntries: current, period, nextRun });
        persistPayrollEntries(next);
        return next;
      });
    });
  }

  function approveEntry(entryId: string) {
    startTransition(() => {
      setPayrollEntries((current) => {
        const next = current.map((entry) => (entry.id === entryId ? updatePayrollEntry(entry, { status: "approved" }) : entry));
        persistPayrollEntries(next);
        return next;
      });
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <div className="sis-payroll-subnav" role="tablist" aria-label="Payroll pages">
        <Link href="/sis/payroll" className="sis-payroll-subnav-link sis-payroll-subnav-link-active">
          Pay Salary
        </Link>
        <Link href="/sis/payroll/advances" className="sis-payroll-subnav-link">
          Salary Advances
        </Link>
        <Link href="/sis/payroll/approvals" className="sis-payroll-subnav-link">
          Approvals
        </Link>
        <Link href="/sis/payroll/reports" className="sis-payroll-subnav-link">
          Salary Report
        </Link>
      </div>

      <section className="sis-panel sis-panel-light sis-payroll-summary-panel">
        <div className="sis-panel-header">
          <div className="sis-payroll-summary-grid">
          <article className="sis-payroll-summary-item">
            <span className="sis-page-metric-label">Due state</span>
            <span className="sis-payroll-summary-value">{dueStateLabel(dueState)}</span>
            <span className="sis-page-metric-note">Due {formatLongDate(dueDate)}</span>
          </article>
          <article className="sis-payroll-summary-item">
            <span className="sis-page-metric-label">Paid</span>
            <span className="sis-payroll-summary-value">{summary.paidCount}</span>
            <span className="sis-page-metric-note">Completed this month</span>
          </article>
          <article className="sis-payroll-summary-item">
            <span className="sis-page-metric-label">Still unpaid</span>
            <span className="sis-payroll-summary-value">{summary.unpaidCount}</span>
            <span className="sis-page-metric-note">Remaining queue</span>
          </article>
          <article className="sis-payroll-summary-item">
            <span className="sis-page-metric-label">Advance recovery</span>
            <span className="sis-payroll-summary-value">{formatMT(summary.scheduledAdvance)}</span>
            <span className="sis-page-metric-note">Approved deductions</span>
          </article>
          </div>
          <div className="sis-payroll-settings-compact">
            <span className="sis-field-label">Salary due day</span>
            <input
              className="sis-input sis-payroll-due-input"
              type="number"
              min="1"
              max="31"
              value={payrollSettings.salaryDueDay}
              onChange={(event) => {
                const nextSettings = {
                  salaryDueDay: Number(event.target.value) || 1,
                } satisfies PayrollSettings;
                setPayrollSettings(nextSettings);
                persistPayrollSettings(nextSettings);
              }}
              disabled={!can("payroll.manage")}
            />
          </div>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Employee payment queue</h2>
            <p className="sis-panel-subtitle">
              Choose one employee to open a focused payment screen for {formatPayrollPeriod(period)}. Showing{" "}
              {summary.filteredCount} employees with the current filter.
            </p>
          </div>
          <span className={`sis-chip ${dueStateChip(dueState)}`}>{dueStateLabel(dueState)}</span>
        </div>

        <div className="sis-payroll-filter-bar">
          <label className="sis-field">
            <span className="sis-field-label">Month</span>
            <input className="sis-input" type="month" value={period} onChange={(event) => syncPeriod(event.target.value)} />
          </label>
          <label className="sis-field">
            <span className="sis-field-label">Status</span>
            <select className="sis-input sis-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as PayrollStatusFilter)}>
              <option value="all">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="paid">Paid</option>
            </select>
          </label>
          <label className="sis-field">
            <span className="sis-field-label">Search employee</span>
            <input
              className="sis-input"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Name, code, role, or department"
            />
          </label>
        </div>

        {employeeItems.length > 0 ? (
          <div className="sis-payroll-list">
            {employeeItems.map(({ staff, entry, isPaid }) => (
              <article className="sis-payroll-queue-row" key={staff.id}>
                <div className="sis-payroll-queue-person">
                  <div className="sis-data-heading">{staff.name}</div>
                  <div className="sis-data-meta">
                    {staff.employeeCode} · {toReadableRole(staff.role)} · {staff.department}
                  </div>
                </div>
                <div className="sis-payroll-queue-stat">
                  <div className="sis-payroll-card-label">Fixed salary</div>
                  <div className="sis-payroll-card-value">{formatMT(staff.monthlySalary)}</div>
                </div>
                <div className="sis-payroll-queue-stat">
                  <div className="sis-payroll-card-label">Net salary</div>
                  <div className="sis-payroll-card-value">
                    {entry ? formatMT(entry.netSalary) : formatMT(staff.monthlySalary)}
                  </div>
                </div>
                <div className="sis-payroll-queue-status">
                  <span className={`sis-chip ${isPaid ? "chip-up" : entry?.status === "approved" ? "chip-syncing" : "chip-pending"}`}>
                    {isPaid ? "Paid" : entry?.status === "approved" ? "Approved" : "Not started"}
                  </span>
                </div>
                <div className="sis-row-actions sis-row-actions-wrap sis-payroll-queue-actions">
                  <Link className="sis-table-action-button" href={`/sis/payroll/${staff.id}?month=${period}`}>
                    {isPaid ? "View payment" : "Open payment"}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sis-empty-state">No employees match this filter for the selected salary month.</div>
        )}
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Current payroll run</h2>
            <p className="sis-panel-subtitle">
              This queue follows the month selected above and contains only employees who are still unpaid.
            </p>
          </div>
        </div>

        <div className="sis-row-actions sis-row-actions-wrap">
          <button className="sis-button sis-button-primary" type="button" onClick={ensureRun} disabled={!can("payroll.manage")}>
            Generate payroll run
          </button>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Gross</th>
                <th>Advance deduction</th>
                <th>Net</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {periodRunEntries.map((entry) => (
                <tr key={entry.id}>
                  <td>
                    <div className="sis-table-primary">{entry.employeeName}</div>
                    <div className="sis-table-secondary">
                      {entry.employeeCode} · {entry.department}
                    </div>
                  </td>
                  <td>{formatMT(entry.grossSalary)}</td>
                  <td>{formatMT(entry.advanceDeduction)}</td>
                  <td>{formatMT(entry.netSalary)}</td>
                  <td>
                    <span className={`sis-chip ${statusChip(entry.status)}`}>{entry.status}</span>
                  </td>
                  <td>
                    <div className="sis-row-actions sis-row-actions-wrap">
                      <button className="sis-table-action-button" type="button" onClick={() => approveEntry(entry.id)} disabled={!can("payroll.manage")}>
                        Approve
                      </button>
                      <Link className="sis-table-action-button sis-table-action-button-muted" href={`/sis/payroll/${entry.staffId}?month=${period}`}>
                        Open payment
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {periodRunEntries.length === 0 && (
                <tr>
                  <td colSpan={6}>
                    <div className="sis-empty-state">All paid employees have already been removed from this run for the selected month.</div>
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

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

function statusChip(status: PayrollEntry["status"]) {
  if (status === "paid") {
    return "chip-up";
  }

  if (status === "approved") {
    return "chip-syncing";
  }

  return "chip-pending";
}

function dueStateChip(state: PayrollDueState) {
  if (state === "closed") {
    return "chip-up";
  }

  if (state === "due_today") {
    return "chip-syncing";
  }

  if (state === "overdue") {
    return "chip-error";
  }

  return "chip-pending";
}

function dueStateLabel(state: PayrollDueState) {
  if (state === "due_today") {
    return "Due today";
  }

  if (state === "overdue") {
    return "Overdue";
  }

  if (state === "closed") {
    return "Closed";
  }

  return "Upcoming";
}

function formatPayrollPeriod(period: string) {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

function formatLongDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function toReadableRole(role: string) {
  return role.replace(/_/g, " ");
}
