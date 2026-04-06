"use client";

import { useEffect, useMemo, useState } from "react";
import { printCurrentPage } from "./report-client-utils";
import { buildFeeCollectionRows, formatMt, loadReportsSnapshot, ReportsSnapshot } from "./report-storage";

export default function AccountsReportConsole() {
  const [snapshot, setSnapshot] = useState<ReportsSnapshot | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("All methods");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSnapshot(loadReportsSnapshot());
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, []);

  const feeRows = useMemo(() => (snapshot ? buildFeeCollectionRows(snapshot) : []), [snapshot]);
  const filteredFeeRows = useMemo(
    () =>
      feeRows.filter((row) => {
        if (selectedPaymentMethod === "All methods") return true;
        return row.paymentMethod === selectedPaymentMethod;
      }),
    [feeRows, selectedPaymentMethod],
  );

  const paymentBreakdown = useMemo(() => {
    return ["Cash", "POS", "Bank Transfer", "Not recorded"].map((method) => ({
      method,
      amount: filteredFeeRows
        .filter((row) => row.paymentMethod === method)
        .reduce((sum, row) => sum + row.amountPaid, 0),
      invoices: filteredFeeRows.filter((row) => row.paymentMethod === method).length,
    }));
  }, [filteredFeeRows]);

  const payrollPaid = useMemo(
    () => (snapshot ? snapshot.payrollEntries.filter((entry) => entry.status === "paid").reduce((sum, entry) => sum + entry.netSalary, 0) : 0),
    [snapshot],
  );

  return (
    <section className="sis-workspace">
      <section className="sis-panel sis-panel-light">
        <div className="sis-page-metrics sis-page-metrics-compact">
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Collected fees</span>
            <span className="sis-page-metric-value">{formatMt(filteredFeeRows.reduce((sum, row) => sum + row.amountPaid, 0))}</span>
            <span className="sis-page-metric-note">Filtered by the selected payment method</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Outstanding</span>
            <span className="sis-page-metric-value">{formatMt(filteredFeeRows.reduce((sum, row) => sum + row.balance, 0))}</span>
            <span className="sis-page-metric-note">Still unpaid in the current fee ledger</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Payroll paid</span>
            <span className="sis-page-metric-value">{formatMt(payrollPaid)}</span>
            <span className="sis-page-metric-note">Total payroll already paid</span>
          </article>
          <article className="sis-page-metric">
            <span className="sis-page-metric-label">Bank accounts</span>
            <span className="sis-page-metric-value">{snapshot?.banks.length ?? 0}</span>
            <span className="sis-page-metric-note">Fee invoice account records configured</span>
          </article>
        </div>

        <div className="sis-report-toolbar">
          <div className="sis-report-filter-bar sis-report-filter-bar-compact">
            <label className="sis-field">
              <span className="sis-field-label">Payment method</span>
              <select className="sis-input sis-select" value={selectedPaymentMethod} onChange={(event) => setSelectedPaymentMethod(event.target.value)}>
                {["All methods", "Cash", "POS", "Bank Transfer", "Not recorded"].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="sis-row-actions">
            <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={printCurrentPage}>
              Print / PDF
            </button>
          </div>
        </div>
      </section>

      <div className="sis-report-hub-lower">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Payment method breakdown</h2>
              <p className="sis-panel-subtitle">Operational view of how fee collections are being received.</p>
            </div>
          </div>
          <div className="sis-data-list sis-data-list-dense">
            {paymentBreakdown.map((entry) => (
              <article className="sis-data-item sis-data-item-compact" key={entry.method}>
                <div>
                  <div className="sis-data-heading">{entry.method}</div>
                  <div className="sis-data-meta">{entry.invoices} invoice rows matched</div>
                </div>
                <div className="sis-data-side">{formatMt(entry.amount)}</div>
              </article>
            ))}
          </div>
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Bank accounts on fee invoices</h2>
              <p className="sis-panel-subtitle">Configured accounts currently available for transfer instructions.</p>
            </div>
          </div>
          {snapshot && snapshot.banks.length > 0 ? (
            <div className="sis-data-list sis-data-list-dense">
              {snapshot.banks.map((bank) => (
                <article className="sis-data-item sis-data-item-compact" key={bank.id}>
                  <div>
                    <div className="sis-data-heading">{bank.bankName}</div>
                    <div className="sis-data-meta">{bank.accountNumber} · {bank.branchAddress}</div>
                  </div>
                  <div className="sis-data-side">
                    <span className={`sis-chip ${bank.isDefault ? "chip-up" : "chip-syncing"}`}>{bank.isDefault ? "Default" : "Available"}</span>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="sis-empty-state">No invoice bank accounts are configured yet.</div>
          )}
        </section>
      </div>
    </section>
  );
}
