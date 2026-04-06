"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useSession } from "../../components/SessionProvider";
import { loadStaffMembers, ManagedStaffMember, seedStaff } from "../../employees/employee-storage";
import {
  appendSalaryAdvance,
  buildSalaryAdvance,
  defaultPayrollPeriod,
  generatePayrollRun,
  loadPayrollEntries,
  loadSalaryAdvances,
  persistPayrollEntries,
  persistSalaryAdvances,
  replacePayrollRun,
  SalaryAdvance,
  SalaryAdvanceDeductionMode,
  SalaryAdvanceStatus,
  updateSalaryAdvance,
} from "../payroll-storage";

export default function PayrollAdvancesConsole() {
  const { can } = useSession();
  const [staffMembers, setStaffMembers] = useState<ManagedStaffMember[]>(() =>
    seedStaff.filter((member) => member.status === "Active"),
  );
  const [salaryAdvances, setSalaryAdvances] = useState(() => loadSalaryAdvances());
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [advanceDate, setAdvanceDate] = useState("2026-03-29");
  const [advanceAmount, setAdvanceAmount] = useState("0");
  const [advanceMode, setAdvanceMode] = useState<SalaryAdvanceDeductionMode>("full");
  const [advanceInstallment, setAdvanceInstallment] = useState("0");
  const [advanceNotes, setAdvanceNotes] = useState("");

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const activeStaff = loadStaffMembers().filter((member) => member.status === "Active");
      setStaffMembers(activeStaff);
      setSelectedStaffId((current) => current || activeStaff[0]?.id || "");
      setSalaryAdvances(loadSalaryAdvances());
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectedStaff = staffMembers.find((member) => member.id === selectedStaffId) ?? null;
  const selectedAdvances = useMemo(
    () =>
      salaryAdvances
        .filter((advance) => advance.staffId === selectedStaffId)
        .sort((a, b) => (a.requestDate > b.requestDate ? -1 : 1)),
    [salaryAdvances, selectedStaffId],
  );

  const summary = useMemo(() => {
    const requested = salaryAdvances.filter((advance) => advance.status === "requested").length;
    const approved = salaryAdvances.filter((advance) => advance.status === "approved").length;
    const settled = salaryAdvances.filter((advance) => advance.status === "settled").length;
    const outstanding = salaryAdvances.reduce((sum, advance) => sum + advance.remainingAmount, 0);
    return { requested, approved, settled, outstanding };
  }, [salaryAdvances]);

  function requestAdvance(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedStaff) {
      return;
    }

    const advance = buildSalaryAdvance({
      staff: selectedStaff,
      requestDate: advanceDate,
      amount: Number(advanceAmount) || 0,
      deductionMode: advanceMode,
      installmentAmount: advanceMode === "partial" ? Number(advanceInstallment) || 0 : null,
      notes: advanceNotes,
    });

    if (!advance) {
      return;
    }

    startTransition(() => {
      const nextAdvances = appendSalaryAdvance(salaryAdvances, advance);
      persistSalaryAdvances(nextAdvances);
      setSalaryAdvances(nextAdvances);
      refreshPayroll(nextAdvances);
      setAdvanceAmount("0");
      setAdvanceInstallment("0");
      setAdvanceNotes("");
    });
  }

  function refreshPayroll(nextAdvances: SalaryAdvance[]) {
    const current = loadPayrollEntries();
    const periods = new Set(current.map((entry) => entry.period));
    periods.add(defaultPayrollPeriod);

    let nextEntries = current;
    Array.from(periods).forEach((period) => {
      const nextRun = generatePayrollRun(period, nextEntries, nextAdvances);
      nextEntries = replacePayrollRun({ currentEntries: nextEntries, period, nextRun });
    });

    persistPayrollEntries(nextEntries);
  }

  function updateAdvance(advanceId: string, changes: Partial<Pick<SalaryAdvance, "deductionMode" | "installmentAmount" | "status" | "notes">>) {
    startTransition(() => {
      const nextAdvances = updateSalaryAdvance(salaryAdvances, advanceId, changes);
      persistSalaryAdvances(nextAdvances);
      setSalaryAdvances(nextAdvances);
      refreshPayroll(nextAdvances);
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <p className="sis-panel-subtitle">
            Manage advance requests, approvals, recovery plans, and remaining balances separately from salary payment processing.
          </p>
          <div className="sis-chip chip-syncing">{summary.requested} pending approval</div>
        </div>
        <div className="sis-kpi-strip">
        <Kpi label="Requested" value={`${summary.requested}`} note="Waiting for approval" />
        <Kpi label="Approved" value={`${summary.approved}`} note="Contributing to payroll recovery" />
        <Kpi label="Settled" value={`${summary.settled}`} note="Fully recovered" />
        <Kpi label="Outstanding" value={formatMT(summary.outstanding)} note="Remaining balance across all advances" />
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <p className="sis-panel-subtitle">Pick one employee, request a new advance, and manage recovery from the same focused view.</p>
          </div>
        </div>

        <div className="sis-filter-bar">
          <label className="sis-field">
            <span className="sis-field-label">Employee</span>
            <select className="sis-input sis-select" value={selectedStaffId} onChange={(event) => setSelectedStaffId(event.target.value)}>
              <option value="">Select employee</option>
              {staffMembers.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {selectedStaff ? (
          <div className="sis-workspace-grid">
            <section className="sis-panel sis-panel-light">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Request advance</h2>
                  <p className="sis-panel-subtitle">Create a new advance request to be approved and recovered later.</p>
                </div>
              </div>

              <form className="sis-form" onSubmit={requestAdvance}>
                <div className="sis-form-grid">
                  <label className="sis-field">
                    <span className="sis-field-label">Employee</span>
                    <input className="sis-input" value={selectedStaff.name} readOnly />
                  </label>
                  <label className="sis-field">
                    <span className="sis-field-label">Advance date</span>
                    <input className="sis-input" type="date" value={advanceDate} onChange={(event) => setAdvanceDate(event.target.value)} disabled={!can("payroll.manage")} />
                  </label>
                  <label className="sis-field">
                    <span className="sis-field-label">Advance amount</span>
                    <input className="sis-input" type="number" min="0" value={advanceAmount} onChange={(event) => setAdvanceAmount(event.target.value)} disabled={!can("payroll.manage")} />
                  </label>
                  <label className="sis-field">
                    <span className="sis-field-label">Recovery mode</span>
                    <select className="sis-input sis-select" value={advanceMode} onChange={(event) => setAdvanceMode(event.target.value as SalaryAdvanceDeductionMode)} disabled={!can("payroll.manage")}>
                      <option value="full">Deduct in full</option>
                      <option value="partial">Deduct partially</option>
                    </select>
                  </label>
                  <label className="sis-field">
                    <span className="sis-field-label">Installment amount</span>
                    <input
                      className="sis-input"
                      type="number"
                      min="0"
                      value={advanceInstallment}
                      onChange={(event) => setAdvanceInstallment(event.target.value)}
                      disabled={!can("payroll.manage") || advanceMode !== "partial"}
                    />
                  </label>
                  <label className="sis-field sis-field-span-2">
                    <span className="sis-field-label">Notes</span>
                    <textarea className="sis-input sis-textarea" value={advanceNotes} onChange={(event) => setAdvanceNotes(event.target.value)} disabled={!can("payroll.manage")} />
                  </label>
                </div>

                <div className="sis-form-actions">
                  <button className="sis-button sis-button-primary" type="submit" disabled={!can("payroll.manage")}>
                    Request advance
                  </button>
                </div>
              </form>
            </section>

            <section className="sis-panel sis-panel-light">
              <div className="sis-panel-header">
                <div>
                  <h2 className="sis-panel-title">Advance history</h2>
                  <p className="sis-panel-subtitle">View, approve, reject, and adjust recovery settings per advance.</p>
                </div>
              </div>

              {selectedAdvances.length > 0 ? (
                <div className="sis-data-list">
                  {selectedAdvances.map((advance) => (
                    <article className="sis-data-item" key={advance.id}>
                      <div className="sis-advance-main">
                        <div className="sis-data-heading">{formatMT(advance.amount)} advance</div>
                        <div className="sis-data-meta">
                          {advance.requestDate} · recovered {formatMT(advance.deductedAmount)} · remaining {formatMT(advance.remainingAmount)}
                        </div>
                        <div className="sis-advance-controls">
                          <label className="sis-field">
                            <span className="sis-field-label">Recovery mode</span>
                            <select
                              className="sis-input sis-select"
                              value={advance.deductionMode}
                              onChange={(event) =>
                                updateAdvance(advance.id, { deductionMode: event.target.value as SalaryAdvanceDeductionMode })
                              }
                              disabled={!can("payroll.manage") || advance.status === "rejected" || advance.status === "settled"}
                            >
                              <option value="full">Deduct in full</option>
                              <option value="partial">Deduct partially</option>
                            </select>
                          </label>
                          <label className="sis-field">
                            <span className="sis-field-label">Installment</span>
                            <input
                              className="sis-input"
                              type="number"
                              min="0"
                              value={advance.installmentAmount ?? 0}
                              onChange={(event) =>
                                updateAdvance(advance.id, { installmentAmount: Number(event.target.value) || 0, deductionMode: "partial" })
                              }
                              disabled={!can("payroll.manage") || advance.status === "rejected" || advance.status === "settled"}
                            />
                          </label>
                        </div>
                        <div className="sis-data-meta">{advance.notes || "No note recorded"}</div>
                        <div className="sis-row-actions sis-row-actions-wrap">
                          {advance.status === "requested" ? (
                            <>
                              <button className="sis-table-action-button" type="button" onClick={() => updateAdvance(advance.id, { status: "approved" })} disabled={!can("payroll.manage")}>
                                Approve
                              </button>
                              <button className="sis-table-action-button sis-table-action-button-muted" type="button" onClick={() => updateAdvance(advance.id, { status: "rejected" })} disabled={!can("payroll.manage")}>
                                Reject
                              </button>
                            </>
                          ) : advance.status === "rejected" ? (
                            <button className="sis-table-action-button" type="button" onClick={() => updateAdvance(advance.id, { status: "requested" })} disabled={!can("payroll.manage")}>
                              Re-open request
                            </button>
                          ) : null}
                        </div>
                      </div>
                      <div className="sis-data-side">
                        <span className={`sis-chip ${advanceStatusChip(advance.status)}`}>{advance.status}</span>
                        <div className="sis-advance-balance">{formatMT(advance.remainingAmount)} remaining</div>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="sis-empty-state">No salary advances recorded for this employee yet.</div>
              )}
            </section>
          </div>
        ) : (
          <div className="sis-empty-state">Choose an employee to manage salary advances.</div>
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

function formatMT(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

function advanceStatusChip(status: SalaryAdvanceStatus) {
  if (status === "approved" || status === "settled") {
    return "chip-up";
  }

  if (status === "rejected") {
    return "chip-error";
  }

  return "chip-pending";
}
