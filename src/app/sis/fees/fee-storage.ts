import { loadStudents, seedStudents } from "../students/student-storage";
import {
  defaultFeeAmountForGrade,
  defaultGradeFeeStructures,
  GradeFeeStructure,
  loadGradeFeeStructures,
  persistGradeFeeStructures,
  studentPackageAmount,
  studentPackageSummaries,
} from "../settings/settings-storage";

export type InvoiceStatus = "due" | "partial" | "paid" | "overdue";
export type PaymentMethod = "Cash" | "POS" | "Bank Transfer";
export type ChargeType = "Tuition" | "Registration" | "Exam" | "Transport";
export type FeeStructure = GradeFeeStructure;

export type ManagedInvoice = {
  id: string;
  studentId: string;
  studentName: string;
  studentCode: string;
  grade: string;
  className: string;
  chargeType: ChargeType;
  amount: number;
  amountPaid: number;
  balance: number;
  dueDate: string;
  status: InvoiceStatus;
  reminderCount: number;
  lastPaymentMethod?: PaymentMethod;
  lastPaymentDate?: string;
  notes: string;
};

export type InvoiceFormState = {
  studentId: string;
  chargeType: ChargeType;
  amount: string;
  dueDate: string;
  notes: string;
};

export type PaymentFormState = {
  amount: string;
  method: PaymentMethod;
};

export const FEE_STRUCTURES_KEY = "sis-fee-structures";
export const FEES_LEDGER_KEY = "sis-fees-ledger";

export const seedFeeStructures: FeeStructure[] = defaultGradeFeeStructures;

export const initialInvoiceFormState: InvoiceFormState = {
  studentId: "",
  chargeType: "Tuition",
  amount: "",
  dueDate: "2026-04-10",
  notes: "",
};

export const initialPaymentFormState: PaymentFormState = {
  amount: "",
  method: "Cash",
};

function seedInvoices(): ManagedInvoice[] {
  const students = seedStudents;

  return [
    createSeedInvoice(students[0]!, "Tuition", 2100, 2100, "2026-03-10", 0, "Paid March tuition"),
    createSeedInvoice(students[1]!, "Tuition", 2400, 1200, "2026-03-12", 1, "Partial payment received"),
    createSeedInvoice(students[2]!, "Registration", 1450, 0, "2026-03-01", 2, "Transferred student intake"),
  ];
}

function createSeedInvoice(
  student: (typeof seedStudents)[number],
  chargeType: ChargeType,
  amount: number,
  amountPaid: number,
  dueDate: string,
  reminderCount: number,
  notes: string,
): ManagedInvoice {
  const balance = Math.max(amount - amountPaid, 0);
  return {
    id: `inv-${student.id}-${chargeType.toLowerCase()}`,
    studentId: student.id,
    studentName: student.fullName,
    studentCode: student.studentCode,
    grade: student.grade,
    className: student.className,
    chargeType,
    amount,
    amountPaid,
    balance,
    dueDate,
    status: deriveInvoiceStatus({ dueDate, amount, amountPaid }),
    reminderCount,
    lastPaymentMethod: amountPaid > 0 ? "Cash" : undefined,
    lastPaymentDate: amountPaid > 0 ? "2026-03-08" : undefined,
    notes,
  };
}

export function loadFeeStructures() {
  return loadGradeFeeStructures();
}

export function persistFeeStructures(nextStructures: FeeStructure[]) {
  persistGradeFeeStructures(nextStructures);
}

export function loadInvoices() {
  if (typeof window === "undefined") {
    return seedInvoices();
  }

  const stored = window.localStorage.getItem(FEES_LEDGER_KEY);
  if (!stored) {
    return seedInvoices();
  }

  try {
    const parsed = JSON.parse(stored) as ManagedInvoice[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed.map(refreshInvoiceStatus) : seedInvoices();
  } catch {
    return seedInvoices();
  }
}

export function persistInvoices(nextInvoices: ManagedInvoice[]) {
  window.localStorage.setItem(FEES_LEDGER_KEY, JSON.stringify(nextInvoices));
}

export function buildInvoicePayload(
  form: InvoiceFormState,
  feeStructures: FeeStructure[],
): ManagedInvoice | null {
  const students = loadStudents();
  const student = students.find((entry) => entry.id === form.studentId);
  const amount = Number(form.amount);

  if (!student || !amount || amount <= 0) {
    return null;
  }

  return {
    id: `inv-${student.id}-${Date.now()}`,
    studentId: student.id,
    studentName: student.fullName,
    studentCode: student.studentCode,
    grade: student.grade,
    className: student.className,
    chargeType: form.chargeType,
    amount,
    amountPaid: 0,
    balance: amount,
    dueDate: form.dueDate,
    status: deriveInvoiceStatus({ dueDate: form.dueDate, amount, amountPaid: 0 }),
    reminderCount: 0,
    notes:
      form.notes.trim() ||
      buildInvoiceNote(student.id, student.grade, form.chargeType, feeStructures),
  };
}

export function recordInvoicePayment(
  invoice: ManagedInvoice,
  amount: number,
  method: PaymentMethod,
  paymentDate: string,
): ManagedInvoice {
  const amountPaid = Math.min(invoice.amountPaid + amount, invoice.amount);
  const balance = Math.max(invoice.amount - amountPaid, 0);

  return refreshInvoiceStatus({
    ...invoice,
    amountPaid,
    balance,
    lastPaymentMethod: method,
    lastPaymentDate: paymentDate,
  });
}

export function incrementReminder(invoice: ManagedInvoice) {
  return {
    ...refreshInvoiceStatus(invoice),
    reminderCount: invoice.reminderCount + 1,
  };
}

export function defaultAmountFor(grade: string, chargeType: ChargeType, structures: FeeStructure[]) {
  return defaultFeeAmountForGrade(grade, chargeType, structures);
}

export function invoiceAmountForStudent(studentId: string, grade: string, chargeType: ChargeType, structures: FeeStructure[]) {
  const baseAmount = defaultAmountFor(grade, chargeType, structures);
  if (chargeType !== "Tuition") {
    return baseAmount;
  }

  return baseAmount + studentPackageAmount(studentId);
}

export function deriveInvoiceStatus({
  dueDate,
  amount,
  amountPaid,
}: {
  dueDate: string;
  amount: number;
  amountPaid: number;
}): InvoiceStatus {
  if (amountPaid >= amount) {
    return "paid";
  }

  const today = "2026-03-29";
  if (amountPaid > 0) {
    return "partial";
  }

  return dueDate < today ? "overdue" : "due";
}

export function refreshInvoiceStatus(invoice: ManagedInvoice) {
  const balance = Math.max(invoice.amount - invoice.amountPaid, 0);
  return {
    ...invoice,
    balance,
    status: deriveInvoiceStatus({
      dueDate: invoice.dueDate,
      amount: invoice.amount,
      amountPaid: invoice.amountPaid,
    }),
  };
}

function buildInvoiceNote(studentId: string, grade: string, chargeType: ChargeType, structures: FeeStructure[]) {
  const baseAmount = defaultAmountFor(grade, chargeType, structures);
  if (chargeType !== "Tuition") {
    return `${chargeType} invoice based on ${grade} fee structure (${baseAmount} MT).`;
  }

  const packages = studentPackageSummaries(studentId);
  if (packages.length === 0) {
    return `Tuition invoice based on ${grade} fee structure (${baseAmount} MT).`;
  }

  const packageAmount = packages.reduce((sum, entry) => sum + entry.monthlyFee, 0);
  return `Tuition invoice based on ${grade} base fee (${baseAmount} MT) plus extracurricular package${packages.length > 1 ? "s" : ""} ${packages.map((entry) => entry.name).join(", ")} (${packageAmount} MT).`;
}
