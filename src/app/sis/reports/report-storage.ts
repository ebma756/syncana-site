"use client";

import { mockStore } from "../mock-data";
import { loadPayrollEntries, PayrollEntry } from "../payroll/payroll-storage";
import { loadInvoices, ManagedInvoice } from "../fees/fee-storage";
import { loadStudentPackageEnrollments, loadExtracurricularPackages, loadFeeInvoiceBankAccounts, studentPackageSummaries, ExtracurricularPackage, FeeInvoiceBankAccount } from "../settings/settings-storage";
import { loadStudents, ManagedStudent } from "../students/student-storage";
import { loadManagedClasses, ManagedClass } from "../classes/class-storage";
import { loadGradeEntries, ManagedGradeEntry } from "../grades/grades-storage";

export type ReportDatasetKey = "students" | "fee_collection" | "cash_flow";

export type SavedCustomReport = {
  id: string;
  name: string;
  dataset: ReportDatasetKey;
  selectedFilters: Record<string, string>;
  selectedColumns: string[];
  sort?: string;
  updatedAt: string;
};

export type ReportsSnapshot = {
  students: ManagedStudent[];
  classes: ManagedClass[];
  invoices: ManagedInvoice[];
  payrollEntries: PayrollEntry[];
  packages: ExtracurricularPackage[];
  banks: FeeInvoiceBankAccount[];
  grades: ManagedGradeEntry[];
  store: typeof mockStore;
};

export type StudentReportRow = {
  id: string;
  studentId: string;
  studentCode: string;
  fullName: string;
  grade: string;
  className: string;
  displayClass: string;
  age: number;
  ageBand: string;
  gender: string;
  status: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  homeAddress: string;
  packageName: string;
  packageCount: number;
  academicYear: string;
};

export type FeeCollectionRow = {
  id: string;
  studentId: string;
  studentCode: string;
  studentName: string;
  grade: string;
  className: string;
  chargeType: string;
  amount: number;
  amountPaid: number;
  balance: number;
  status: ManagedInvoice["status"];
  dueDate: string;
  periodMonth: string;
  periodYear: string;
  reminderCount: number;
  paymentMethod: string;
};

export type CashFlowRow = {
  id: string;
  date: string;
  periodMonth: string;
  periodYear: string;
  direction: "Inflow" | "Outflow";
  category: "Fees" | "Payroll" | "Store";
  reference: string;
  detail: string;
  method: string;
  amount: number;
};

export const CUSTOM_REPORTS_STORAGE_KEY = "sis-custom-reports";
export const REPORTS_TODAY = "2026-03-31";

export const customReportDatasetOptions: Array<{ key: ReportDatasetKey; label: string }> = [
  { key: "students", label: "Student Reports" },
  { key: "fee_collection", label: "Fee Collection" },
  { key: "cash_flow", label: "Cash Flow / Operational Finance" },
];

export const datasetColumnOptions: Record<ReportDatasetKey, Array<{ key: string; label: string }>> = {
  students: [
    { key: "studentCode", label: "Student code" },
    { key: "fullName", label: "Student name" },
    { key: "displayClass", label: "Class" },
    { key: "age", label: "Age" },
    { key: "gender", label: "Gender" },
    { key: "status", label: "Status" },
    { key: "guardianName", label: "Guardian name" },
    { key: "guardianRelationship", label: "Guardian relationship" },
    { key: "guardianPhone", label: "Mobile number" },
    { key: "guardianEmail", label: "Email" },
    { key: "packageName", label: "Package" },
    { key: "homeAddress", label: "Address" },
  ],
  fee_collection: [
    { key: "studentCode", label: "Student code" },
    { key: "studentName", label: "Student name" },
    { key: "grade", label: "Grade" },
    { key: "className", label: "Class" },
    { key: "chargeType", label: "Charge type" },
    { key: "amount", label: "Invoice total" },
    { key: "amountPaid", label: "Collected" },
    { key: "balance", label: "Outstanding" },
    { key: "status", label: "Payment state" },
    { key: "paymentMethod", label: "Payment method" },
    { key: "dueDate", label: "Due date" },
    { key: "reminderCount", label: "Reminders" },
  ],
  cash_flow: [
    { key: "date", label: "Date" },
    { key: "direction", label: "Direction" },
    { key: "category", label: "Category" },
    { key: "reference", label: "Reference" },
    { key: "detail", label: "Detail" },
    { key: "method", label: "Method" },
    { key: "amount", label: "Amount" },
  ],
};

export const defaultCustomColumns: Record<ReportDatasetKey, string[]> = {
  students: ["studentCode", "fullName", "displayClass", "age", "status", "packageName", "guardianName", "guardianPhone"],
  fee_collection: ["studentCode", "studentName", "grade", "chargeType", "amount", "amountPaid", "balance", "status"],
  cash_flow: ["date", "direction", "category", "reference", "method", "amount"],
};

export function loadReportsSnapshot(): ReportsSnapshot {
  return {
    students: loadStudents(),
    classes: loadManagedClasses(),
    invoices: loadInvoices(),
    payrollEntries: loadPayrollEntries(),
    packages: loadExtracurricularPackages(),
    banks: loadFeeInvoiceBankAccounts(),
    grades: loadGradeEntries(),
    store: mockStore,
  };
}

export function loadSavedCustomReports() {
  if (typeof window === "undefined") {
    return [] as SavedCustomReport[];
  }

  const stored = window.localStorage.getItem(CUSTOM_REPORTS_STORAGE_KEY);
  if (!stored) {
    return [] as SavedCustomReport[];
  }

  try {
    const parsed = JSON.parse(stored) as SavedCustomReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [] as SavedCustomReport[];
  }
}

export function persistSavedCustomReports(nextReports: SavedCustomReport[]) {
  window.localStorage.setItem(CUSTOM_REPORTS_STORAGE_KEY, JSON.stringify(nextReports));
}

export function upsertSavedCustomReport(currentReports: SavedCustomReport[], report: SavedCustomReport) {
  const filtered = currentReports.filter((entry) => entry.id !== report.id);
  return [report, ...filtered].sort((a, b) => (a.updatedAt > b.updatedAt ? -1 : 1));
}

export function deleteSavedCustomReport(currentReports: SavedCustomReport[], reportId: string) {
  return currentReports.filter((entry) => entry.id !== reportId);
}

export function findSavedCustomReport(currentReports: SavedCustomReport[], reportId: string | null) {
  return reportId ? currentReports.find((entry) => entry.id === reportId) ?? null : null;
}

export function buildStudentReportRows(snapshot: ReportsSnapshot) {
  return snapshot.students.map((student) => {
    const packages = studentPackageSummaries(
      student.id,
      snapshot.packages,
      loadStudentPackageEnrollments(),
    );

    const age = ageFromBirthDate(student.birthDate);
    return {
      id: `student-report-${student.id}`,
      studentId: student.id,
      studentCode: student.studentCode,
      fullName: student.fullName,
      grade: student.grade,
      className: student.className,
      displayClass: `${student.grade} ${student.className}`,
      age,
      ageBand: ageBand(age),
      gender: student.gender,
      status: student.status,
      guardianName: student.guardianName,
      guardianPhone: student.guardianPhone,
      guardianEmail: student.guardianEmail,
      guardianRelationship: student.guardianRelationship,
      homeAddress: student.homeAddress,
      packageName: packages.length > 0 ? packages.map((entry) => entry.name).join(", ") : "No package",
      packageCount: packages.length,
      academicYear: student.academicYear,
    } satisfies StudentReportRow;
  });
}

export function buildFeeCollectionRows(snapshot: ReportsSnapshot) {
  return snapshot.invoices.map((invoice) => ({
    id: `fee-report-${invoice.id}`,
    studentId: invoice.studentId,
    studentCode: invoice.studentCode,
    studentName: invoice.studentName,
    grade: invoice.grade,
    className: invoice.className,
    chargeType: invoice.chargeType,
    amount: invoice.amount,
    amountPaid: invoice.amountPaid,
    balance: invoice.balance,
    status: invoice.status,
    dueDate: invoice.dueDate,
    periodMonth: invoice.dueDate.slice(5, 7),
    periodYear: invoice.dueDate.slice(0, 4),
    reminderCount: invoice.reminderCount,
    paymentMethod: invoice.lastPaymentMethod ?? "Not recorded",
  }) satisfies FeeCollectionRow);
}

export function buildCashFlowRows(snapshot: ReportsSnapshot) {
  const feeRows = snapshot.invoices
    .filter((invoice) => invoice.amountPaid > 0)
    .map((invoice) => ({
      id: `cash-fee-${invoice.id}`,
      date: invoice.lastPaymentDate ?? invoice.dueDate,
      periodMonth: (invoice.lastPaymentDate ?? invoice.dueDate).slice(5, 7),
      periodYear: (invoice.lastPaymentDate ?? invoice.dueDate).slice(0, 4),
      direction: "Inflow" as const,
      category: "Fees" as const,
      reference: invoice.studentName,
      detail: `${invoice.chargeType} collection`,
      method: invoice.lastPaymentMethod ?? "Not recorded",
      amount: invoice.amountPaid,
    }));

  const payrollRows = snapshot.payrollEntries
    .filter((entry) => entry.status === "paid" && entry.paidDate)
    .map((entry) => ({
      id: `cash-payroll-${entry.id}`,
      date: entry.paidDate!,
      periodMonth: entry.paidDate!.slice(5, 7),
      periodYear: entry.paidDate!.slice(0, 4),
      direction: "Outflow" as const,
      category: "Payroll" as const,
      reference: entry.employeeName,
      detail: `${formatPeriod(entry.period)} salary payment`,
      method: entry.paymentMethod ?? "Not recorded",
      amount: entry.netSalary,
    }));

  const storeRows =
    snapshot.store.todaySales > 0
      ? [
          {
            id: "cash-store-2026-03",
            date: REPORTS_TODAY,
            periodMonth: REPORTS_TODAY.slice(5, 7),
            periodYear: REPORTS_TODAY.slice(0, 4),
            direction: "Inflow" as const,
            category: "Store" as const,
            reference: "Store counter",
            detail: "POS and uniform sales summary",
            method: "Cash / POS / Bank",
            amount: snapshot.store.todaySales,
          },
        ]
      : [];

  return [...feeRows, ...storeRows, ...payrollRows].sort((a, b) => (a.date > b.date ? -1 : 1));
}

export function buildStudentReportCard(studentId: string, snapshot: ReportsSnapshot) {
  const student = snapshot.students.find((entry) => entry.id === studentId) ?? null;
  if (!student) {
    return null;
  }

  const entries = snapshot.grades
    .filter((entry) => entry.studentId === studentId)
    .sort((a, b) => a.subject.localeCompare(b.subject));
  const average = entries.length > 0 ? Math.round(entries.reduce((sum, entry) => sum + entry.finalScore, 0) / entries.length) : 0;
  const passCount = entries.filter((entry) => entry.passStatus === "Pass").length;
  const secondTryCount = entries.filter((entry) => entry.usedSecondTry).length;

  return {
    student,
    entries,
    average,
    passCount,
    secondTryCount,
    packageName: studentPackageSummaries(student.id).map((entry) => entry.name).join(", ") || "No package",
  };
}

export function monthlyOptionsFromRows(rows: Array<{ periodMonth: string; periodYear: string }>) {
  return Array.from(new Set(rows.map((row) => `${row.periodYear}-${row.periodMonth}`))).sort().reverse();
}

export function yearOptionsFromRows(rows: Array<{ periodYear: string }>) {
  return Array.from(new Set(rows.map((row) => row.periodYear))).sort().reverse();
}

export function formatPeriod(period: string) {
  const [year, month] = period.split("-");
  return new Date(Number(year), Number(month) - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
}

export function formatMt(amount: number) {
  return `${amount.toLocaleString()} MT`;
}

export function ageFromBirthDate(birthDate: string, today = REPORTS_TODAY) {
  const birth = new Date(birthDate);
  const current = new Date(today);
  let age = current.getFullYear() - birth.getFullYear();
  const hasHadBirthday =
    current.getMonth() > birth.getMonth() ||
    (current.getMonth() === birth.getMonth() && current.getDate() >= birth.getDate());
  if (!hasHadBirthday) {
    age -= 1;
  }
  return Math.max(age, 0);
}

export function ageBand(age: number) {
  if (age <= 5) return "5 and under";
  if (age <= 7) return "6-7";
  if (age <= 10) return "8-10";
  return "11+";
}

export function toCsvString<T extends Record<string, string | number>>(rows: T[], columns: string[]) {
  const lines = [
    columns.join(","),
    ...rows.map((row) =>
      columns
        .map((column) => {
          const value = row[column];
          const normalized = `${value ?? ""}`.replace(/"/g, '""');
          return `"${normalized}"`;
        })
        .join(","),
    ),
  ];

  return lines.join("\n");
}
