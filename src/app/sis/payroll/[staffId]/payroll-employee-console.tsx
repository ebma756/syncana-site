"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "../../components/SessionProvider";
import { findStaffMemberById, loadStaffMembers, ManagedStaffMember } from "../../employees/employee-storage";
import {
  defaultPayrollPeriod,
  loadPayrollEntries,
  loadPayrollSettings,
  loadSalaryAdvances,
  payrollEntriesForPeriod,
  PayrollEntry,
  payrollDueDate,
  payrollDueState,
  PayrollDueState,
  PayrollMethod,
  PayrollSettings,
  persistPayrollEntries,
  persistSalaryAdvances,
  SalaryAdvance,
  scheduledAdvanceDeduction,
  settlePayrollPayment,
  todayDateString,
} from "../payroll-storage";

const LOW_NET_WARNING_RATIO = 0.5;

export default function PayrollEmployeeConsole({ staffId }: { staffId: string }) {
  const { can } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const monthParam = searchParams.get("month");
  const [staff, setStaff] = useState<ManagedStaffMember | null>(null);
  const [payrollEntries, setPayrollEntries] = useState<PayrollEntry[]>([]);
  const [salaryAdvances, setSalaryAdvances] = useState<SalaryAdvance[]>([]);
  const [payrollSettings, setPayrollSettings] = useState<PayrollSettings>(loadPayrollSettings());
  const [paymentDate, setPaymentDate] = useState("2026-03-29");
  const [bonusAmount, setBonusAmount] = useState("0");
  const [deductionAmount, setDeductionAmount] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState<PayrollMethod>("Bank Transfer");
  const period = monthParam ?? defaultPayrollPeriod;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const members = loadStaffMembers();
      setStaff(findStaffMemberById(members, staffId));
      setPayrollEntries(loadPayrollEntries());
      setPayrollSettings(loadPayrollSettings());
      setSalaryAdvances(loadSalaryAdvances());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [staffId]);

  const currentEntry = useMemo(
    () => payrollEntriesForPeriod(payrollEntries, period).find((entry) => entry.staffId === staffId) ?? null,
    [payrollEntries, period, staffId],
  );

  useEffect(() => {
    if (!currentEntry || currentEntry.status === "paid") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setBonusAmount(`${currentEntry.adjustment}`);
      setDeductionAmount(`${currentEntry.manualDeduction}`);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [currentEntry]);

  const scheduledAdvance = useMemo(
    () => (staff ? scheduledAdvanceDeduction(salaryAdvances, staff.id) : 0),
    [salaryAdvances, staff],
  );
  const dueDate = useMemo(() => payrollDueDate(period, payrollSettings.salaryDueDay), [payrollSettings.salaryDueDay, period]);
  const dueState = useMemo(
    () => payrollDueState(period, payrollSettings.salaryDueDay, todayDateString(), currentEntry ? [currentEntry] : [], staff ? 1 : 0),
    [currentEntry, payrollSettings.salaryDueDay, period, staff],
  );
  const outstandingAdvanceBalance = useMemo(
    () =>
      staff
        ? salaryAdvances
            .filter((advance) => advance.staffId === staff.id)
            .reduce((sum, advance) => sum + advance.remainingAmount, 0)
        : 0,
    [salaryAdvances, staff],
  );

  const projectedNet = staff
    ? Math.max(staff.monthlySalary + (Number(bonusAmount) || 0) - (Number(deductionAmount) || 0) - scheduledAdvance, 0)
    : 0;
  const lowNetThreshold = staff ? staff.monthlySalary * LOW_NET_WARNING_RATIO : 0;
  const showLowNetWarning = Boolean(staff) && projectedNet > 0 && projectedNet < lowNetThreshold;

  function backToPayroll() {
    router.push(`/sis/payroll?month=${period}`);
  }

  function syncPeriod(nextPeriod: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("month", nextPeriod);
    router.replace(`/sis/payroll/${staffId}?${params.toString()}`);
  }

  function completePayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!staff) {
      return;
    }

    startTransition(() => {
      const settlement = settlePayrollPayment({
        currentEntries: payrollEntries,
        currentAdvances: salaryAdvances,
        period,
        staff,
        adjustment: Number(bonusAmount) || 0,
        manualDeduction: Number(deductionAmount) || 0,
        paymentMethod,
        paidDate: paymentDate,
      });
      persistPayrollEntries(settlement.nextEntries);
      persistSalaryAdvances(settlement.nextAdvances);
      setPayrollEntries(settlement.nextEntries);
      setSalaryAdvances(settlement.nextAdvances);
      router.push(`/sis/payroll?month=${period}`);
    });
  }

  if (!staff) {
    return (
      <section className="sis-workspace sis-employees-page">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Employee not found</h2>
              <p className="sis-panel-subtitle">This payroll employee record could not be found.</p>
            </div>
          </div>
          <div className="sis-row-actions">
            <button className="sis-table-action-button" type="button" onClick={backToPayroll}>
              Back to payroll
            </button>
          </div>
        </section>
      </section>
    );
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

      <div className="sis-workspace-intro sis-employees-surface sis-payroll-focus-header">
        <div className="sis-workspace-copy">
          <h2 className="sis-workspace-title">{staff.name}</h2>
          <p className="sis-workspace-text">
            Review this employee&apos;s payroll context for {period} and complete payment once the numbers look right.
          </p>
        </div>
        <div className="sis-row-actions sis-row-actions-wrap">
          <Link href={`/sis/payroll?month=${period}`} className="sis-button sis-button-secondary">
            Back to salary queue
          </Link>
          <div className={`sis-chip ${currentEntry?.status === "paid" ? "chip-up" : "chip-syncing"}`}>
            {currentEntry?.status === "paid" ? "Paid" : dueStateLabel(dueState)}
          </div>
        </div>
      </div>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Employee payroll context</h2>
            <p className="sis-panel-subtitle">This summary keeps only the context you need before completing salary payment.</p>
          </div>
        </div>

        <div className="sis-data-list sis-payroll-context-list">
          <article className="sis-data-item">
            <div>
              <div className="sis-data-heading">{staff.name}</div>
              <div className="sis-data-meta">
                {staff.employeeCode} · {toReadableRole(staff.role)} · {staff.department}
              </div>
            </div>
            <div className="sis-data-side">{formatMT(staff.monthlySalary)}</div>
          </article>
            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">Salary due date</div>
                <div className="sis-data-meta">This employee salary for the selected month is tied to the school-wide due day.</div>
              </div>
              <div className="sis-data-side">
                {formatDate(dueDate)} · {dueStateText(dueState)}
              </div>
            </article>
            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">Outstanding advance balance</div>
                <div className="sis-data-meta">All requested, approved, or partially recovered advances linked to this employee.</div>
            </div>
            <div className="sis-data-side">{formatMT(outstandingAdvanceBalance)}</div>
          </article>
          <article className="sis-data-item">
            <div>
              <div className="sis-data-heading">Scheduled advance deduction this month</div>
              <div className="sis-data-meta">Only approved advances contribute to this month’s payroll recovery.</div>
            </div>
            <div className="sis-data-side">{formatMT(scheduledAdvance)}</div>
          </article>
        </div>
      </section>

      {currentEntry?.status === "paid" ? (
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Salary already paid</h2>
              <p className="sis-panel-subtitle">This employee already has a completed payroll entry for the selected month.</p>
            </div>
          </div>

          <div className="sis-data-list">
            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">Net salary paid</div>
                <div className="sis-data-meta">
                  {currentEntry.paymentMethod ?? "Method not set"} · {currentEntry.paidDate ?? "No paid date"}
                </div>
              </div>
              <div className="sis-data-side">{formatMT(currentEntry.netSalary)}</div>
            </article>
            <article className="sis-data-item">
              <div>
                <div className="sis-data-heading">Deductions used</div>
                <div className="sis-data-meta">
                  Manual {formatMT(currentEntry.manualDeduction)} + advance {formatMT(currentEntry.advanceDeduction)}
                </div>
              </div>
              <div className="sis-data-side">{formatMT(currentEntry.deduction)}</div>
            </article>
          </div>

          <div className="sis-row-actions sis-row-actions-wrap">
            <Link className="sis-table-action-button" href={`/sis/payroll/slips/${currentEntry.id}`}>
              View paid slip
            </Link>
            <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={backToPayroll}>
              Back to salary queue
            </button>
          </div>
        </section>
      ) : (
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Complete salary payment</h2>
              <p className="sis-panel-subtitle">Finish payroll for this employee, then return to the monthly salary queue.</p>
            </div>
          </div>

          <form className="sis-form" onSubmit={completePayment}>
            <div className="sis-form-grid sis-payroll-payment-grid">
              <label className="sis-field">
                <span className="sis-field-label">Payroll month</span>
                <input className="sis-input" type="month" value={period} onChange={(event) => syncPeriod(event.target.value)} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Payment date</span>
                <input className="sis-input" type="date" value={paymentDate} onChange={(event) => setPaymentDate(event.target.value)} disabled={!can("payroll.manage")} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Payment method</span>
                <select className="sis-input sis-select" value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PayrollMethod)} disabled={!can("payroll.manage")}>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cash">Cash</option>
                  <option value="POS">POS</option>
                </select>
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Fixed salary</span>
                <input className="sis-input" value={`${staff.monthlySalary}`} readOnly />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Bonus</span>
                <input className="sis-input" type="number" value={bonusAmount} onChange={(event) => setBonusAmount(event.target.value)} disabled={!can("payroll.manage")} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Manual deduction</span>
                <input className="sis-input" type="number" value={deductionAmount} onChange={(event) => setDeductionAmount(event.target.value)} disabled={!can("payroll.manage")} />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Advance deduction this salary</span>
                <input className="sis-input" value={`${scheduledAdvance}`} readOnly />
              </label>
              <label className="sis-field">
                <span className="sis-field-label">Projected net salary</span>
                <input className="sis-input" value={`${projectedNet}`} readOnly />
              </label>
            </div>

            {showLowNetWarning ? (
              <div className="sis-inline-note sis-warning-note">
                Warning: this payment leaves {staff.name} with {formatMT(projectedNet)} net pay, below the warning threshold of {formatMT(lowNetThreshold)}.
              </div>
            ) : null}

            <div className="sis-row-actions sis-row-actions-wrap">
              <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={backToPayroll}>
                Back to salary queue
              </button>
              <button className="sis-button sis-button-primary" type="submit" disabled={!can("payroll.manage")}>
                Complete Payment
              </button>
            </div>
          </form>
        </section>
      )}
    </section>
  );
}

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function dueStateLabel(state: PayrollDueState) {
  if (state === "closed") {
    return "Closed";
  }

  if (state === "due_today") {
    return "Due today";
  }

  if (state === "overdue") {
    return "Overdue";
  }

  return "Upcoming";
}

function dueStateText(state: PayrollDueState) {
  if (state === "closed") {
    return "closed";
  }

  if (state === "due_today") {
    return "due today";
  }

  if (state === "overdue") {
    return "overdue";
  }

  return "upcoming";
}

function toReadableRole(role: string) {
  return role.replace(/_/g, " ");
}
