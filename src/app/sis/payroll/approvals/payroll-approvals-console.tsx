"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import {
  defaultPayrollPeriod,
  generatePayrollRun,
  loadPayrollEntries,
  loadSalaryAdvances,
  PayrollEntry,
  persistPayrollEntries,
  persistSalaryAdvances,
  replacePayrollRun,
  SalaryAdvance,
  updatePayrollEntry,
  updateSalaryAdvance,
} from "../payroll-storage";

type ApprovalTypeFilter = "all" | "payroll" | "advance";
type ApprovalStateFilter = "all" | "pending" | "approved" | "rejected" | "closed";

type ApprovalItem =
  | {
      id: string;
      kind: "payroll";
      personId: string;
      title: string;
      subtitle: string;
      month: string;
      amountLabel: string;
      statusLabel: string;
      normalizedState: Exclude<ApprovalStateFilter, "all">;
      href: string;
      raw: PayrollEntry;
    }
  | {
      id: string;
      kind: "advance";
      personId: string;
      title: string;
      subtitle: string;
      month: string;
      amountLabel: string;
      statusLabel: string;
      normalizedState: Exclude<ApprovalStateFilter, "all">;
      href: string;
      raw: SalaryAdvance;
    };

export default function PayrollApprovalsConsole() {
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [period, setPeriod] = useState("2026-03");
  const [typeFilter, setTypeFilter] = useState<ApprovalTypeFilter>("all");
  const [stateFilter, setStateFilter] = useState<ApprovalStateFilter>("pending");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setPayrollEntries(loadPayrollEntries());
      setSalaryAdvances(loadSalaryAdvances());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const approvalItems = useMemo<ApprovalItem[]>(() => {
    const payrollItems: ApprovalItem[] = payrollEntries
      .filter((entry) => entry.period === period)
      .map((entry) => ({
        id: `payroll-${entry.id}`,
        kind: "payroll",
        personId: entry.staffId,
        title: entry.employeeName,
        subtitle: `${entry.employeeCode} · ${entry.department}`,
        month: entry.period,
        amountLabel: formatMT(entry.netSalary),
        statusLabel: entry.status,
        normalizedState: normalizePayrollState(entry.status),
        href: `/sis/payroll/${entry.staffId}?month=${entry.period}`,
        raw: entry,
      }));

    const advanceItems: ApprovalItem[] = salaryAdvances
      .filter((advance) => advance.requestDate.startsWith(period))
      .map((advance) => ({
        id: `advance-${advance.id}`,
        kind: "advance",
        personId: advance.staffId,
        title: advance.employeeName,
        subtitle: `${advance.employeeCode} · ${advance.deductionMode === "full" ? "Full recovery" : "Partial recovery"}`,
        month: advance.requestDate.slice(0, 7),
        amountLabel: formatMT(advance.amount),
        statusLabel: advance.status,
        normalizedState: normalizeAdvanceState(advance.status),
        href: "/sis/payroll/advances",
        raw: advance,
      }));

    return [...payrollItems, ...advanceItems]
      .filter((item) => (typeFilter === "all" ? true : item.kind === typeFilter))
      .filter((item) => (stateFilter === "all" ? true : item.normalizedState === stateFilter))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [payrollEntries, period, salaryAdvances, stateFilter, typeFilter]);

  const summary = useMemo(() => {
    const pending = approvalItems.filter((item) => item.normalizedState === "pending").length;
    const approved = approvalItems.filter((item) => item.normalizedState === "approved").length;
    const rejected = approvalItems.filter((item) => item.normalizedState === "rejected").length;
    const closed = approvalItems.filter((item) => item.normalizedState === "closed").length;
    return { pending, approved, rejected, closed };
  }, [approvalItems]);

  function approvePayroll(entryId: string) {
    startTransition(() => {
      const next = payrollEntries.map((entry) => (entry.id === entryId ? updatePayrollEntry(entry, { status: "approved" }) : entry));
      persistPayrollEntries(next);
      setPayrollEntries(next);
    });
  }

  function approveAdvance(advanceId: string) {
    startTransition(() => {
      const next = updateSalaryAdvance(salaryAdvances, advanceId, { status: "approved" });
      persistSalaryAdvances(next);
      setSalaryAdvances(next);
      refreshPayroll(next);
    });
  }

  function rejectAdvance(advanceId: string) {
    startTransition(() => {
      const next = updateSalaryAdvance(salaryAdvances, advanceId, { status: "rejected" });
      persistSalaryAdvances(next);
      setSalaryAdvances(next);
      refreshPayroll(next);
    });
  }

  function refreshPayroll(nextAdvances: SalaryAdvance[]) {
    let nextEntries = loadPayrollEntries();
    const periods = new Set(nextEntries.map((entry) => entry.period));
    periods.add(defaultPayrollPeriod);

    Array.from(periods).forEach((periodKey) => {
      const nextRun = generatePayrollRun(periodKey, nextEntries, nextAdvances);
      nextEntries = replacePayrollRun({ currentEntries: nextEntries, period: periodKey, nextRun });
    });

    persistPayrollEntries(nextEntries);
    setPayrollEntries(nextEntries);
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <p className="sis-panel-subtitle">
            Review salary items and salary advances that are pending approval, already approved, rejected, or closed.
          </p>
          <div className="sis-chip chip-syncing">{period}</div>
        </div>
        <div className="sis-kpi-strip">
        <Kpi label="Pending" value={`${summary.pending}`} note="Awaiting review" />
        <Kpi label="Approved" value={`${summary.approved}`} note="Ready for next step" />
        <Kpi label="Rejected" value={`${summary.rejected}`} note="Stopped or declined" />
        <Kpi label="Closed" value={`${summary.closed}`} note="Paid or settled" />
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Approval queue</h2>
            <p className="sis-panel-subtitle">Filter payroll and salary-advance items by month, type, and approval state.</p>
          </div>
        </div>

        <div className="sis-filter-bar">
          <label className="sis-field">
            <span className="sis-field-label">Month</span>
            <input className="sis-input" type="month" value={period} onChange={(event) => setPeriod(event.target.value)} />
          </label>
          <label className="sis-field">
            <span className="sis-field-label">Type</span>
            <select className="sis-input sis-select" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value as ApprovalTypeFilter)}>
              <option value="all">All</option>
              <option value="payroll">Payroll</option>
              <option value="advance">Salary advance</option>
            </select>
          </label>
          <label className="sis-field">
            <span className="sis-field-label">Approval state</span>
            <select className="sis-input sis-select" value={stateFilter} onChange={(event) => setStateFilter(event.target.value as ApprovalStateFilter)}>
              <option value="all">All</option>
              <option value="pending">Pending approval</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="closed">Closed</option>
            </select>
          </label>
        </div>

        {approvalItems.length > 0 ? (
          <div className="sis-payroll-list">
            {approvalItems.map((item) => (
              <article className="sis-payroll-card" key={item.id}>
                <div className="sis-payroll-card-main">
                  <div className="sis-payroll-card-head">
                    <div>
                      <div className="sis-data-heading">{item.title}</div>
                      <div className="sis-data-meta">{item.subtitle}</div>
                    </div>
                    <span className={`sis-chip ${approvalChip(item.normalizedState)}`}>{item.statusLabel}</span>
                  </div>

                  <div className="sis-payroll-card-grid">
                    <div>
                      <div className="sis-payroll-card-label">Type</div>
                      <div className="sis-payroll-card-value">{item.kind === "payroll" ? "Payroll payment" : "Salary advance"}</div>
                    </div>
                    <div>
                      <div className="sis-payroll-card-label">Month</div>
                      <div className="sis-payroll-card-value">{item.month}</div>
                    </div>
                    <div>
                      <div className="sis-payroll-card-label">{item.kind === "payroll" ? "Net amount" : "Requested amount"}</div>
                      <div className="sis-payroll-card-value">{item.amountLabel}</div>
                    </div>
                  </div>
                </div>

                <div className="sis-row-actions sis-row-actions-wrap">
                  {item.kind === "payroll" && item.raw.status === "draft" ? (
                    <button className="sis-table-action-button" type="button" onClick={() => approvePayroll(item.raw.id)}>
                      Approve
                    </button>
                  ) : null}
                  {item.kind === "advance" && item.raw.status === "requested" ? (
                    <>
                      <button className="sis-table-action-button" type="button" onClick={() => approveAdvance(item.raw.id)}>
                        Approve
                      </button>
                      <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => rejectAdvance(item.raw.id)}>
                        Reject
                      </button>
                    </>
                  ) : null}
                  <Link className="sis-table-action-button sis-table-action-button-muted" href={item.href}>
                    Open source
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="sis-empty-state">No approval items match this filter for the selected month.</div>
        )}
      </section>
    </section>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <article className="sis-kpi">
      <div className="sis-kpi-label">{label}</div>
      <div className="sis-kpi-value">{value}</div>
      <div className="sis-kpi-note">{note}</div>
    </article>
  );
}

function normalizePayrollState(status: PayrollEntry["status"]): Exclude<ApprovalStateFilter, "all"> {
  if (status === "paid") {
    return "closed";
  }

  if (status === "approved") {
    return "approved";
  }

  return "pending";
}

function normalizeAdvanceState(status: SalaryAdvance["status"]): Exclude<ApprovalStateFilter, "all"> {
  if (status === "approved") {
    return "approved";
  }

  if (status === "rejected") {
    return "rejected";
  }

  if (status === "settled") {
    return "closed";
  }

  return "pending";
}

function approvalChip(state: Exclude<ApprovalStateFilter, "all">) {
  if (state === "approved" || state === "closed") {
    return "chip-up";
  }

  if (state === "rejected") {
    return "chip-error";
  }

  return "chip-pending";
}

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}
