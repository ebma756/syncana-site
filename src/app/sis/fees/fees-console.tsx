"use client";

import Link from "next/link";
import { startTransition, useEffect, useMemo, useState } from "react";
import { useSession } from "../components/SessionProvider";
import { loadStudents } from "../students/student-storage";
import {
  buildInvoicePayload,
  defaultAmountFor,
  FeeStructure,
  incrementReminder,
  initialInvoiceFormState,
  initialPaymentFormState,
  InvoiceFormState,
  invoiceAmountForStudent,
  loadFeeStructures,
  loadInvoices,
  ManagedInvoice,
  PaymentFormState,
  persistInvoices,
  recordInvoicePayment,
  seedFeeStructures,
} from "./fee-storage";
import { seedStudents } from "../students/student-storage";
import { studentPackageSummaries } from "../settings/settings-storage";

export default function FeesConsole() {
  const { can } = useSession();
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(seedFeeStructures);
  const [invoices, setInvoices] = useState<ManagedInvoice[]>([]);
  const [students, setStudents] = useState(() => seedStudents.filter((student) => student.status === "Active"));
  const [invoiceForm, setInvoiceForm] = useState<InvoiceFormState>(initialInvoiceFormState);
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(initialPaymentFormState);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setFeeStructures(loadFeeStructures());
      setInvoices(loadInvoices());
      setStudents(loadStudents().filter((student) => student.status === "Active"));
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, []);

  const selectedStudent = students.find((student) => student.id === invoiceForm.studentId) ?? null;
  const selectedInvoice = invoices.find((invoice) => invoice.id === selectedInvoiceId) ?? null;

  const summary = useMemo(() => {
    const totalBilled = invoices.reduce((sum, invoice) => sum + invoice.amount, 0);
    const totalCollected = invoices.reduce((sum, invoice) => sum + invoice.amountPaid, 0);
    const totalOutstanding = invoices.reduce((sum, invoice) => sum + invoice.balance, 0);
    const overdueCount = invoices.filter((invoice) => invoice.status === "overdue").length;
    return { totalBilled, totalCollected, totalOutstanding, overdueCount };
  }, [invoices]);

  function updateInvoiceForm<K extends keyof InvoiceFormState>(key: K, value: InvoiceFormState[K]) {
    setInvoiceForm((current) => ({ ...current, [key]: value }));
  }

  function updatePaymentForm<K extends keyof PaymentFormState>(key: K, value: PaymentFormState[K]) {
    setPaymentForm((current) => ({ ...current, [key]: value }));
  }

  function handleStudentSelection(studentId: string) {
    const student = students.find((entry) => entry.id === studentId);
    const autoAmount = student ? invoiceAmountForStudent(student.id, student.grade, invoiceForm.chargeType, feeStructures) : 0;

    setInvoiceForm((current) => ({
      ...current,
      studentId,
      amount: autoAmount > 0 ? `${autoAmount}` : current.amount,
    }));
  }

  function handleChargeTypeSelection(chargeType: InvoiceFormState["chargeType"]) {
    const autoAmount = selectedStudent ? invoiceAmountForStudent(selectedStudent.id, selectedStudent.grade, chargeType, feeStructures) : 0;

    setInvoiceForm((current) => ({
      ...current,
      chargeType,
      amount: autoAmount > 0 ? `${autoAmount}` : current.amount,
    }));
  }

  function createInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = buildInvoicePayload(invoiceForm, feeStructures);
    if (!payload) {
      return;
    }

    startTransition(() => {
      setInvoices((current) => {
        const next = [payload, ...current];
        persistInvoices(next);
        return next;
      });
      setSelectedInvoiceId(payload.id);
      setPaymentForm({ ...initialPaymentFormState, amount: `${payload.balance}` });
      setInvoiceForm(initialInvoiceFormState);
    });
  }

  function applyPayment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedInvoice) {
      return;
    }

    const amount = Number(paymentForm.amount);
    if (!amount || amount <= 0) {
      return;
    }

    startTransition(() => {
      setInvoices((current) => {
        const next = current.map((invoice) =>
          invoice.id === selectedInvoice.id
            ? recordInvoicePayment(invoice, amount, paymentForm.method, "2026-03-29")
            : invoice,
        );
        persistInvoices(next);
        return next;
      });
      setPaymentForm(initialPaymentFormState);
    });
  }

  function sendReminder(invoiceId: string) {
    startTransition(() => {
      setInvoices((current) => {
        const next = current.map((invoice) => (invoice.id === invoiceId ? incrementReminder(invoice) : invoice));
        persistInvoices(next);
        return next;
      });
    });
  }

  return (
    <section className="sis-workspace sis-employees-page">
      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div className="sis-page-metrics sis-page-metrics-compact">
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Billed</span>
              <span className="sis-page-metric-value">{formatMT(summary.totalBilled)}</span>
              <span className="sis-page-metric-note">Current ledger total</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Collected</span>
              <span className="sis-page-metric-value">{formatMT(summary.totalCollected)}</span>
              <span className="sis-page-metric-note">Cash, POS, and bank</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Outstanding</span>
              <span className="sis-page-metric-value">{formatMT(summary.totalOutstanding)}</span>
              <span className="sis-page-metric-note">Balances still open</span>
            </article>
            <article className="sis-page-metric">
              <span className="sis-page-metric-label">Overdue</span>
              <span className="sis-page-metric-value">{summary.overdueCount}</span>
              <span className="sis-page-metric-note">Reminder queue</span>
            </article>
          </div>
          <Link className="sis-button sis-button-secondary" href="/sis/settings/fees">
            Open fee structure
          </Link>
        </div>
      </section>

      <div className="sis-workspace-grid">
        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Create invoice</h2>
              <p className="sis-panel-subtitle">Select an enrolled student and use the grade structure to prefill fees.</p>
            </div>
          </div>

          <form className="sis-form" onSubmit={createInvoice}>
            <div className="sis-form-grid">
              <label className="sis-field">
                <span className="sis-field-label">Student</span>
                <select
                  className="sis-input sis-select"
                  value={invoiceForm.studentId}
                  onChange={(event) => handleStudentSelection(event.target.value)}
                  disabled={!can("fees.invoices.create")}
                >
                  <option value="">Select student</option>
                  {students.map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.fullName} · {student.grade} {student.className}
                    </option>
                  ))}
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Charge type</span>
                <select
                  className="sis-input sis-select"
                  value={invoiceForm.chargeType}
                  onChange={(event) => handleChargeTypeSelection(event.target.value as InvoiceFormState["chargeType"])}
                  disabled={!can("fees.invoices.create")}
                >
                  <option value="Tuition">Tuition</option>
                  <option value="Registration">Registration</option>
                  <option value="Exam">Exam</option>
                  <option value="Transport">Transport</option>
                </select>
              </label>

              <label className="sis-field">
                <span className="sis-field-label">Amount (MZN)</span>
                <input
                  className="sis-input"
                  type="number"
                  min="0"
                  value={invoiceForm.amount}
                  onChange={(event) => updateInvoiceForm("amount", event.target.value)}
                  disabled={!can("fees.invoices.create")}
                />
              </label>

              {selectedStudent ? (
                <div className="sis-field sis-field-span-2">
                  <span className="sis-field-label">Student package pricing</span>
                  <div className="sis-data-item">
                    <div>
                      <div className="sis-data-heading">
                        {invoiceForm.chargeType === "Tuition"
                          ? `${formatMT(defaultAmountFor(selectedStudent.grade, "Tuition", feeStructures))} base tuition`
                          : `${formatMT(defaultAmountFor(selectedStudent.grade, invoiceForm.chargeType, feeStructures))} base ${invoiceForm.chargeType.toLowerCase()} fee`}
                      </div>
                      <div className="sis-data-meta">
                        {invoiceForm.chargeType === "Tuition"
                          ? studentPackageSummaries(selectedStudent.id).length > 0
                            ? `Includes extracurricular packages: ${studentPackageSummaries(selectedStudent.id).map((entry) => `${entry.name} (${formatMT(entry.monthlyFee)})`).join(", ")}`
                            : "No extracurricular package enrolled for this student."
                          : "Only tuition charges include extracurricular package pricing."}
                      </div>
                    </div>
                    <div className="sis-data-side">{formatMT(Number(invoiceForm.amount) || 0)}</div>
                  </div>
                </div>
              ) : null}

              <label className="sis-field">
                <span className="sis-field-label">Due date</span>
                <input
                  className="sis-input"
                  type="date"
                  value={invoiceForm.dueDate}
                  onChange={(event) => updateInvoiceForm("dueDate", event.target.value)}
                  disabled={!can("fees.invoices.create")}
                />
              </label>

              <label className="sis-field sis-field-span-2">
                <span className="sis-field-label">Notes</span>
                <textarea
                  className="sis-input sis-textarea"
                  value={invoiceForm.notes}
                  onChange={(event) => updateInvoiceForm("notes", event.target.value)}
                  placeholder="Optional context for the invoice"
                  disabled={!can("fees.invoices.create")}
                />
              </label>
            </div>

            <div className="sis-form-actions">
              <button className="sis-button sis-button-primary" type="submit" disabled={!can("fees.invoices.create")}>
                Create invoice
              </button>
            </div>
          </form>
        </section>

        <section className="sis-panel sis-panel-light">
          <div className="sis-panel-header">
            <div>
              <h2 className="sis-panel-title">Payment and reminders</h2>
              <p className="sis-panel-subtitle">Select an invoice from the ledger to record a payment or send a reminder.</p>
            </div>
          </div>

          {selectedInvoice ? (
            <>
              <div className="sis-data-list">
                <article className="sis-data-item">
                  <div>
                    <div className="sis-data-heading">{selectedInvoice.studentName}</div>
                    <div className="sis-data-meta">
                      {selectedInvoice.grade} {selectedInvoice.className} · {selectedInvoice.chargeType}
                    </div>
                  </div>
                  <div className="sis-data-side">{selectedInvoice.studentCode}</div>
                </article>
                <article className="sis-data-item">
                  <div>
                    <div className="sis-data-heading">Outstanding balance</div>
                    <div className="sis-data-meta">Due {selectedInvoice.dueDate}</div>
                  </div>
                  <div className="sis-data-side">{formatMT(selectedInvoice.balance)}</div>
                </article>
              </div>

              <form className="sis-form" onSubmit={applyPayment}>
                <div className="sis-form-grid">
                  <label className="sis-field">
                    <span className="sis-field-label">Payment amount (MZN)</span>
                    <input
                      className="sis-input"
                      type="number"
                      min="0"
                      value={paymentForm.amount}
                      onChange={(event) => updatePaymentForm("amount", event.target.value)}
                      disabled={!can("fees.payments.record")}
                    />
                  </label>
                  <label className="sis-field">
                    <span className="sis-field-label">Method</span>
                    <select
                      className="sis-input sis-select"
                      value={paymentForm.method}
                      onChange={(event) => updatePaymentForm("method", event.target.value as PaymentFormState["method"])}
                      disabled={!can("fees.payments.record")}
                    >
                      <option value="Cash">Cash</option>
                      <option value="POS">POS</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                    </select>
                  </label>
                </div>

                <div className="sis-form-actions">
                  <button className="sis-button sis-button-primary" type="submit" disabled={!can("fees.payments.record")}>
                    Record payment
                  </button>
                  <button
                    type="button"
                    className="sis-button sis-button-secondary"
                    onClick={() => sendReminder(selectedInvoice.id)}
                    disabled={!can("fees.reminders.send")}
                  >
                    Send reminder
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="sis-empty-state">
              Select an invoice below to record payment activity, mark collection progress, or send a reminder.
            </div>
          )}
        </section>
      </div>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Fee defaults from settings</h2>
            <p className="sis-panel-subtitle">
              Base fee pricing is managed in Settings. Tuition invoices also add extracurricular package fees for enrolled students.
            </p>
          </div>
          <Link className="sis-link-button" href="/sis/settings/fees">
            Edit fee structure
          </Link>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Grade</th>
                <th>Tuition</th>
                <th>Registration</th>
                <th>Exam</th>
                <th>Transport</th>
              </tr>
            </thead>
            <tbody>
              {feeStructures.map((structure) => (
                <tr key={structure.grade}>
                  <td>{structure.grade}</td>
                  <td>{formatMT(structure.tuition)}</td>
                  <td>{formatMT(structure.registrationFee)}</td>
                  <td>{formatMT(structure.examFee)}</td>
                  <td>{formatMT(structure.transportFee)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="sis-panel sis-panel-light">
        <div className="sis-panel-header">
          <div>
            <h2 className="sis-panel-title">Invoice ledger</h2>
            <p className="sis-panel-subtitle">Real invoices linked to the current student directory.</p>
          </div>
        </div>

        <div className="sis-table-wrap">
          <table className="sis-table sis-table-light">
            <thead>
              <tr>
                <th>Student</th>
                <th>Charge</th>
                <th>Due</th>
                <th>Status</th>
                <th>Balance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>
                    <div className="sis-table-primary">{invoice.studentName}</div>
                    <div className="sis-table-secondary">
                      {invoice.grade} {invoice.className} · {invoice.studentCode}
                    </div>
                  </td>
                  <td>
                    <div className="sis-table-primary">{invoice.chargeType}</div>
                    <div className="sis-table-secondary">{formatMT(invoice.amount)}</div>
                  </td>
                  <td>{invoice.dueDate}</td>
                  <td>
                    <span className={`sis-chip ${invoiceStatusChip(invoice.status)}`}>{invoice.status}</span>
                  </td>
                  <td>
                    <div className="sis-table-primary">{formatMT(invoice.balance)}</div>
                    <div className="sis-table-secondary">
                      Paid {formatMT(invoice.amountPaid)} · {invoice.reminderCount} reminders
                    </div>
                  </td>
                  <td>
                    <div className="sis-row-actions">
                      <button
                        type="button"
                        className="sis-table-action-button"
                        onClick={() => {
                          setSelectedInvoiceId(invoice.id);
                          setPaymentForm((current) => ({
                            ...current,
                            amount: invoice.balance > 0 ? `${invoice.balance}` : current.amount,
                          }));
                        }}
                      >
                        Open
                      </button>
                      <button
                        type="button"
                        className="sis-table-action-button sis-table-action-button-warning"
                        onClick={() => sendReminder(invoice.id)}
                        disabled={!can("fees.reminders.send")}
                      >
                        Remind
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
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

function invoiceStatusChip(status: ManagedInvoice["status"]) {
  if (status === "paid") {
    return "chip-up";
  }

  if (status === "partial") {
    return "chip-syncing";
  }

  return "chip-pending";
}
