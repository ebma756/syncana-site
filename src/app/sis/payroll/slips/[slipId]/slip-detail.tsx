"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { findPayrollEntryById, loadPayrollEntries, PayrollEntry } from "../../payroll-storage";

const SCHOOL_NAME = "Escola Primaria ABC";
const SCHOOL_LOCATION = "Maputo, Mozambique";
const PAYSLIP_FONT_STORAGE_KEY = "sis-payslip-font-scale";

type PayslipFontScale = "compact" | "standard" | "large";

export default function PayrollSlipDetail({ slipId }: { slipId: string }) {
  const [entry, setEntry] = useState<PayrollEntry | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [fontScale, setFontScale] = useState<PayslipFontScale>("compact");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const match = findPayrollEntryById(loadPayrollEntries(), slipId);
      setEntry(match);
      setIsLoaded(true);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [slipId]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const stored = window.localStorage.getItem(PAYSLIP_FONT_STORAGE_KEY);
      if (stored === "compact" || stored === "standard" || stored === "large") {
        setFontScale(stored);
      }
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const breakdown = useMemo(() => {
    if (!entry) {
      return [];
    }

    return [
      { label: "Fixed salary", amount: entry.grossSalary, tone: "base" },
      { label: "Bonus", amount: entry.adjustment, tone: "positive" },
      { label: "Manual deduction", amount: entry.manualDeduction, tone: "negative" },
      { label: "Advance deduction", amount: entry.advanceDeduction, tone: "negative" },
    ] as const;
  }, [entry]);

  if (!isLoaded) {
    return (
      <section className="sis-workspace sis-employees-page">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h1 className="sis-panel-title">Loading slip</h1>
              <p className="sis-panel-subtitle">Preparing the salary document from local payroll history.</p>
            </div>
          </div>
        </section>
      </section>
    );
  }

  if (!entry) {
    return (
      <section className="sis-workspace sis-employees-page">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h1 className="sis-panel-title">Slip not found</h1>
              <p className="sis-panel-subtitle">
                This salary slip could not be found in local payroll history.
              </p>
            </div>
          </div>
          <div className="sis-row-actions">
            <Link className="sis-table-action-button" href="/sis/payroll/slips">
              Back to paid slips
            </Link>
          </div>
        </section>
      </section>
    );
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <div className="sis-row-actions sis-print-hide">
        <Link className="sis-table-action-button sis-table-action-button-muted" href="/sis/payroll/slips">
          Back to slips
        </Link>
        <label className="sis-payslip-preference">
          <span className="sis-payslip-preference-label">Text size</span>
          <select
            className="sis-input sis-select sis-payslip-preference-select"
            value={fontScale}
            onChange={(event) => {
              const nextScale = event.target.value as PayslipFontScale;
              setFontScale(nextScale);
              window.localStorage.setItem(PAYSLIP_FONT_STORAGE_KEY, nextScale);
            }}
          >
            <option value="compact">Compact</option>
            <option value="standard">Standard</option>
            <option value="large">Large</option>
          </select>
        </label>
        <button className="sis-table-action-button" type="button" onClick={() => window.print()}>
          Print / Save PDF
        </button>
      </div>

      <section className="sis-payslip-sheet" data-font-scale={fontScale}>
        <header className="sis-payslip-header">
          <div>
            <div className="sis-payslip-kicker">Salary paid slip</div>
            <h2 className="sis-payslip-school">{SCHOOL_NAME}</h2>
            <p className="sis-payslip-subcopy">{SCHOOL_LOCATION}</p>
          </div>
          <div className="sis-payslip-badge">Paid</div>
        </header>

        <div className="sis-payslip-meta-grid">
          <article className="sis-payslip-meta-card">
            <div className="sis-payslip-label">Employee</div>
            <div className="sis-payslip-value">{entry.employeeName}</div>
            <div className="sis-payslip-caption">
              {entry.employeeCode} · {entry.roleLabel}
            </div>
          </article>
          <article className="sis-payslip-meta-card">
            <div className="sis-payslip-label">Department</div>
            <div className="sis-payslip-value">{entry.department}</div>
            <div className="sis-payslip-caption">Employee category and work area</div>
          </article>
          <article className="sis-payslip-meta-card">
            <div className="sis-payslip-label">Salary month</div>
            <div className="sis-payslip-value">{formatPayrollPeriod(entry.period)}</div>
            <div className="sis-payslip-caption">Payroll period covered by this payment</div>
          </article>
          <article className="sis-payslip-meta-card">
            <div className="sis-payslip-label">Paid date</div>
            <div className="sis-payslip-value">{formatDate(entry.paidDate)}</div>
            <div className="sis-payslip-caption">{entry.paymentMethod ?? "Payment method not set"}</div>
          </article>
        </div>

        <div className="sis-payslip-summary">
          <div>
            <div className="sis-payslip-label">Slip reference</div>
            <div className="sis-payslip-value">{entry.id}</div>
          </div>
          <div>
            <div className="sis-payslip-label">Net salary paid</div>
            <div className="sis-payslip-total">{formatMT(entry.netSalary)}</div>
          </div>
        </div>

        <div className="sis-payslip-table-wrap">
          <table className="sis-payslip-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {breakdown.map((item) => (
                <tr key={item.label}>
                  <td>{item.label}</td>
                  <td className={item.tone === "negative" ? "sis-payslip-amount-negative" : ""}>
                    {item.tone === "negative" ? `- ${formatMT(item.amount)}` : formatMT(item.amount)}
                  </td>
                </tr>
              ))}
              <tr className="sis-payslip-total-row">
                <td>Net paid</td>
                <td>{formatMT(entry.netSalary)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="sis-payslip-notes-grid">
          <article className="sis-payslip-note-card">
            <div className="sis-payslip-label">Payment details</div>
            <ul className="sis-payslip-list">
              <li>Method: {entry.paymentMethod ?? "--"}</li>
              <li>Status: {entry.status}</li>
              <li>Gross salary: {formatMT(entry.grossSalary)}</li>
              <li>Advance deducted: {formatMT(entry.advanceDeduction)}</li>
            </ul>
          </article>
          <article className="sis-payslip-note-card">
            <div className="sis-payslip-label">Payroll notes</div>
            <p className="sis-payslip-note-text">
              This slip confirms the salary paid for the selected month, including any salary advance recovered from
              this payroll. Keep it for payroll records or export it as a PDF for archive.
            </p>
          </article>
        </div>

        <footer className="sis-payslip-signatures">
          <div className="sis-payslip-signature-block">
            <div className="sis-payslip-signature-line" />
            <div className="sis-payslip-signature-label">Employee signature</div>
          </div>
          <div className="sis-payslip-signature-block">
            <div className="sis-payslip-signature-line" />
            <div className="sis-payslip-signature-label">Authorized by school owner</div>
          </div>
        </footer>
      </section>
    </section>
  );
}

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

function formatPayrollPeriod(period: string) {
  const [year, month] = period.split("-");
  const monthIndex = Number(month) - 1;
  const label = new Date(Number(year), monthIndex, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return label;
}

function formatDate(date?: string) {
  if (!date) {
    return "--";
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
