import { loadStaffMembers, seedStaff } from "../employees/employee-storage";

export type PayrollStatus = "draft" | "approved" | "paid";
export type PayrollMethod = "Bank Transfer" | "Cash" | "POS";
export type SalaryAdvanceStatus = "requested" | "approved" | "rejected" | "settled";
export type SalaryAdvanceDeductionMode = "full" | "partial";
export type PayrollDueState = "upcoming" | "due_today" | "overdue" | "closed";

export type PayrollSettings = {
  salaryDueDay: number;
};

export type PayrollEntry = {
  id: string;
  period: string;
  staffId: string;
  employeeCode: string;
  employeeName: string;
  roleLabel: string;
  department: string;
  grossSalary: number;
  adjustment: number;
  manualDeduction: number;
  advanceDeduction: number;
  deduction: number;
  netSalary: number;
  status: PayrollStatus;
  paymentMethod?: PayrollMethod;
  paidDate?: string;
};

export type SalaryAdvance = {
  id: string;
  staffId: string;
  employeeCode: string;
  employeeName: string;
  grossSalaryAtRequest: number;
  requestDate: string;
  amount: number;
  remainingAmount: number;
  deductionMode: SalaryAdvanceDeductionMode;
  installmentAmount: number | null;
  deductedAmount: number;
  status: SalaryAdvanceStatus;
  notes: string;
};

export const PAYROLL_STORAGE_KEY = "sis-payroll-ledger";
export const PAYROLL_ADVANCES_STORAGE_KEY = "sis-payroll-advances";
export const PAYROLL_SETTINGS_STORAGE_KEY = "sis-payroll-settings";
export const defaultPayrollPeriod = "2026-03";
export const defaultPayrollSettings: PayrollSettings = {
  salaryDueDay: 25,
};

function seedPayrollEntries(): PayrollEntry[] {
  const activeStaff = seedStaff.filter((member) => member.status === "Active");

  return [
    refreshPayrollEntry(
      createSeedPayrollEntry(activeStaff[0]!, "2026-03", 1200, 300, 0, "approved"),
    ),
    refreshPayrollEntry(
      createSeedPayrollEntry(activeStaff[1]!, "2026-03", 0, 250, 0, "draft"),
    ),
    refreshPayrollEntry(
      createSeedPayrollEntry(activeStaff[2]!, "2026-02", 0, 0, 0, "paid", "Bank Transfer", "2026-02-28"),
    ),
  ];
}

function seedSalaryAdvances(): SalaryAdvance[] {
  const activeStaff = seedStaff.filter((member) => member.status === "Active");
  if (!activeStaff[0]) {
    return [];
  }

  return [
    {
      id: `adv-${activeStaff[0].id}-2026-03-15`,
      staffId: activeStaff[0].id,
      employeeCode: activeStaff[0].employeeCode,
      employeeName: activeStaff[0].name,
      grossSalaryAtRequest: activeStaff[0].monthlySalary,
      requestDate: "2026-03-15",
      amount: 20000,
      remainingAmount: 10000,
      deductionMode: "partial",
      installmentAmount: 10000,
      deductedAmount: 10000,
      status: "approved",
      notes: "Advance approved and recovered over two payroll cycles.",
    },
  ];
}

function createSeedPayrollEntry(
  staff: (typeof seedStaff)[number],
  period: string,
  adjustment: number,
  manualDeduction: number,
  advanceDeduction: number,
  status: PayrollStatus,
  paymentMethod?: PayrollMethod,
  paidDate?: string,
): PayrollEntry {
  return {
    id: `pay-${period}-${staff.id}`,
    period,
    staffId: staff.id,
    employeeCode: staff.employeeCode,
    employeeName: staff.name,
    roleLabel: staff.role,
    department: staff.department,
    grossSalary: staff.monthlySalary,
    adjustment,
    manualDeduction,
    advanceDeduction,
    deduction: manualDeduction + advanceDeduction,
    netSalary: Math.max(staff.monthlySalary + adjustment - manualDeduction - advanceDeduction, 0),
    status,
    paymentMethod,
    paidDate,
  };
}

export function loadPayrollEntries() {
  if (typeof window === "undefined") {
    return seedPayrollEntries();
  }

  const stored = window.localStorage.getItem(PAYROLL_STORAGE_KEY);
  if (!stored) {
    return seedPayrollEntries();
  }

  try {
    const parsed = JSON.parse(stored) as PayrollEntry[];
    return Array.isArray(parsed) ? parsed.map(refreshPayrollEntry) : seedPayrollEntries();
  } catch {
    return seedPayrollEntries();
  }
}

export function persistPayrollEntries(nextEntries: PayrollEntry[]) {
  window.localStorage.setItem(PAYROLL_STORAGE_KEY, JSON.stringify(nextEntries));
}

export function loadSalaryAdvances() {
  if (typeof window === "undefined") {
    return seedSalaryAdvances();
  }

  const stored = window.localStorage.getItem(PAYROLL_ADVANCES_STORAGE_KEY);
  if (!stored) {
    return seedSalaryAdvances();
  }

  try {
    const parsed = JSON.parse(stored) as SalaryAdvance[];
    return Array.isArray(parsed) ? parsed.map(refreshSalaryAdvance) : seedSalaryAdvances();
  } catch {
    return seedSalaryAdvances();
  }
}

export function persistSalaryAdvances(nextAdvances: SalaryAdvance[]) {
  window.localStorage.setItem(PAYROLL_ADVANCES_STORAGE_KEY, JSON.stringify(nextAdvances));
}

export function loadPayrollSettings() {
  if (typeof window === "undefined") {
    return defaultPayrollSettings;
  }

  const stored = window.localStorage.getItem(PAYROLL_SETTINGS_STORAGE_KEY);
  if (!stored) {
    return defaultPayrollSettings;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<PayrollSettings>;
    return {
      salaryDueDay: clampDueDay(parsed.salaryDueDay ?? defaultPayrollSettings.salaryDueDay),
    } satisfies PayrollSettings;
  } catch {
    return defaultPayrollSettings;
  }
}

export function persistPayrollSettings(nextSettings: PayrollSettings) {
  window.localStorage.setItem(
    PAYROLL_SETTINGS_STORAGE_KEY,
    JSON.stringify({
      salaryDueDay: clampDueDay(nextSettings.salaryDueDay),
    } satisfies PayrollSettings),
  );
}

export function payrollEntriesForPeriod(entries: PayrollEntry[], period: string) {
  return entries.filter((entry) => entry.period === period);
}

export function payrollRunEntriesForPeriod(entries: PayrollEntry[], period: string) {
  return payrollEntriesForPeriod(entries, period).filter((entry) => entry.status !== "paid");
}

export function findPayrollEntryById(entries: PayrollEntry[], id: string) {
  return entries.find((entry) => entry.id === id) ?? null;
}

export function payrollDueDate(period: string, salaryDueDay: number) {
  const [year, month] = period.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  const safeDay = Math.min(clampDueDay(salaryDueDay), lastDay);
  return `${year}-${String(month).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

export function payrollDueState(
  period: string,
  salaryDueDay: number,
  today: string,
  periodEntries: PayrollEntry[] = payrollEntriesForPeriod(loadPayrollEntries(), period),
  activeStaffCount = loadStaffMembers().filter((member) => member.status === "Active").length,
): PayrollDueState {
  const paidCount = periodEntries.filter((entry) => entry.status === "paid").length;
  if (activeStaffCount > 0 && paidCount >= activeStaffCount) {
    return "closed";
  }

  const dueDate = payrollDueDate(period, salaryDueDay);
  if (today === dueDate) {
    return "due_today";
  }

  if (today > dueDate) {
    return "overdue";
  }

  return "upcoming";
}

export function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export function staffAdvances(advances: SalaryAdvance[], staffId: string) {
  return advances
    .filter((advance) => advance.staffId === staffId)
    .sort((a, b) => (a.requestDate > b.requestDate ? -1 : 1));
}

export function activeStaffAdvances(advances: SalaryAdvance[], staffId: string) {
  return staffAdvances(advances, staffId).filter((advance) => advance.status === "approved" && advance.remainingAmount > 0);
}

export function scheduledAdvanceDeduction(advances: SalaryAdvance[], staffId: string) {
  return activeStaffAdvances(advances, staffId).reduce((sum, advance) => sum + plannedDeductionForAdvance(advance), 0);
}

export function buildSalaryAdvance({
  staff,
  requestDate,
  amount,
  deductionMode,
  installmentAmount,
  notes,
}: {
  staff: {
    id: string;
    employeeCode: string;
    name: string;
    monthlySalary: number;
  };
  requestDate: string;
  amount: number;
  deductionMode: SalaryAdvanceDeductionMode;
  installmentAmount: number | null;
  notes: string;
}) {
  if (amount <= 0) {
    return null;
  }

  return refreshSalaryAdvance({
    id: `adv-${staff.id}-${requestDate}-${amount}`,
    staffId: staff.id,
    employeeCode: staff.employeeCode,
    employeeName: staff.name,
    grossSalaryAtRequest: staff.monthlySalary,
    requestDate,
    amount,
    remainingAmount: amount,
    deductionMode,
    installmentAmount: deductionMode === "partial" ? installmentAmount ?? amount : null,
    deductedAmount: 0,
    status: "requested",
    notes: notes.trim(),
  });
}

export function appendSalaryAdvance(currentAdvances: SalaryAdvance[], advance: SalaryAdvance) {
  return [advance, ...currentAdvances].map(refreshSalaryAdvance);
}

export function updateSalaryAdvance(
  currentAdvances: SalaryAdvance[],
  advanceId: string,
  changes: Partial<Pick<SalaryAdvance, "deductionMode" | "installmentAmount" | "status" | "notes">>,
) {
  return currentAdvances.map((advance) => {
    if (advance.id !== advanceId) {
      return refreshSalaryAdvance(advance);
    }

    return refreshSalaryAdvance({
      ...advance,
      ...changes,
      installmentAmount:
        (changes.deductionMode ?? advance.deductionMode) === "partial"
          ? Math.max(changes.installmentAmount ?? advance.installmentAmount ?? advance.remainingAmount, 0)
          : null,
    });
  });
}

export function generatePayrollRun(period: string, existingEntries: PayrollEntry[], advances: SalaryAdvance[]) {
  const activeStaff = loadStaffMembers().filter((member) => member.status === "Active");
  const existingForPeriod = payrollEntriesForPeriod(existingEntries, period);

  return activeStaff.flatMap((member) => {
    const current = existingForPeriod.find((entry) => entry.staffId === member.id);
    if (current?.status === "paid") {
      return [];
    }

    const scheduledAdvance = scheduledAdvanceDeduction(advances, member.id);

    if (current) {
      return [refreshPayrollEntry({
        ...current,
        advanceDeduction: scheduledAdvance,
      })];
    }

    return [refreshPayrollEntry({
      id: `pay-${period}-${member.id}`,
      period,
      staffId: member.id,
      employeeCode: member.employeeCode,
      employeeName: member.name,
      roleLabel: member.role,
      department: member.department,
      grossSalary: member.monthlySalary,
      adjustment: 0,
      manualDeduction: 0,
      advanceDeduction: scheduledAdvance,
      deduction: scheduledAdvance,
      netSalary: member.monthlySalary - scheduledAdvance,
      status: "draft",
    } satisfies PayrollEntry)];
  });
}

export function replacePayrollRun({
  currentEntries,
  period,
  nextRun,
}: {
  currentEntries: PayrollEntry[];
  period: string;
  nextRun: PayrollEntry[];
}) {
  const filtered = currentEntries.filter((entry) => entry.period !== period || entry.status === "paid");
  return [...nextRun, ...filtered];
}

export function updatePayrollEntry(
  entry: PayrollEntry,
  changes: Partial<Pick<PayrollEntry, "adjustment" | "manualDeduction" | "deduction" | "status" | "paymentMethod" | "paidDate" | "advanceDeduction">>,
) {
  const nextManualDeduction =
    changes.manualDeduction ??
    changes.deduction ??
    entry.manualDeduction ??
    Math.max((entry.deduction ?? 0) - (entry.advanceDeduction ?? 0), 0);

  return refreshPayrollEntry({
    ...entry,
    ...changes,
    manualDeduction: nextManualDeduction,
  });
}

export function settlePayrollPayment({
  currentEntries,
  currentAdvances,
  period,
  staff,
  adjustment,
  manualDeduction,
  paymentMethod,
  paidDate,
}: {
  currentEntries: PayrollEntry[];
  currentAdvances: SalaryAdvance[];
  period: string;
  staff: {
    id: string;
    employeeCode: string;
    name: string;
    role: string;
    department: string;
    monthlySalary: number;
  };
  adjustment: number;
  manualDeduction: number;
  paymentMethod: PayrollMethod;
  paidDate: string;
}) {
  const settlement = applyAdvanceDeductions(currentAdvances, staff.id);
  const existing = currentEntries.find((entry) => entry.period === period && entry.staffId === staff.id);

  const nextEntry = refreshPayrollEntry({
    id: existing?.id ?? `pay-${period}-${staff.id}`,
    period,
    staffId: staff.id,
    employeeCode: staff.employeeCode,
    employeeName: staff.name,
    roleLabel: staff.role,
    department: staff.department,
    grossSalary: staff.monthlySalary,
    adjustment,
    manualDeduction,
    advanceDeduction: settlement.appliedAmount,
    deduction: manualDeduction + settlement.appliedAmount,
    netSalary: staff.monthlySalary + adjustment - manualDeduction - settlement.appliedAmount,
    status: "paid",
    paymentMethod,
    paidDate,
  });

  const nextEntries = existing
    ? currentEntries.map((entry) => (entry.id === existing.id ? nextEntry : entry))
    : [nextEntry, ...currentEntries];

  return {
    nextEntries,
    nextAdvances: settlement.nextAdvances,
    appliedAdvanceDeduction: settlement.appliedAmount,
  };
}

export function refreshPayrollEntry(entry: PayrollEntry) {
  const manualDeduction =
    entry.manualDeduction ??
    Math.max((entry.deduction ?? 0) - (entry.advanceDeduction ?? 0), 0);
  const advanceDeduction = entry.advanceDeduction ?? 0;
  const deduction = manualDeduction + advanceDeduction;

  return {
    ...entry,
    manualDeduction,
    advanceDeduction,
    deduction,
    netSalary: Math.max(entry.grossSalary + entry.adjustment - deduction, 0),
  };
}

export function refreshSalaryAdvance(advance: SalaryAdvance) {
  const normalizedStatus =
    advance.status === "active"
      ? "approved"
      : advance.status;
  const remainingAmount = Math.max(advance.remainingAmount, 0);

  let status: SalaryAdvanceStatus = normalizedStatus;
  if (status !== "rejected" && remainingAmount <= 0) {
    status = "settled";
  } else if (status === "settled" && remainingAmount > 0) {
    status = "approved";
  }

  return {
    ...advance,
    remainingAmount,
    deductedAmount: Math.max(advance.amount - remainingAmount, 0),
    installmentAmount:
      advance.deductionMode === "partial"
        ? Math.max(advance.installmentAmount ?? advance.amount, 0)
        : null,
    status,
  };
}

function plannedDeductionForAdvance(advance: SalaryAdvance) {
  if (advance.status !== "approved" || advance.remainingAmount <= 0) {
    return 0;
  }

  if (advance.deductionMode === "full") {
    return advance.remainingAmount;
  }

  return Math.min(advance.installmentAmount ?? advance.remainingAmount, advance.remainingAmount);
}

function applyAdvanceDeductions(currentAdvances: SalaryAdvance[], staffId: string) {
  let appliedAmount = 0;

  const nextAdvances = currentAdvances.map((advance) => {
    if (advance.staffId !== staffId || advance.status !== "approved" || advance.remainingAmount <= 0) {
      return refreshSalaryAdvance(advance);
    }

    const deduction = plannedDeductionForAdvance(advance);
    if (deduction <= 0) {
      return refreshSalaryAdvance(advance);
    }

    appliedAmount += deduction;
    return refreshSalaryAdvance({
      ...advance,
      remainingAmount: advance.remainingAmount - deduction,
    });
  });

  return { nextAdvances, appliedAmount };
}

function clampDueDay(value: number) {
  if (value < 1) {
    return 1;
  }

  if (value > 31) {
    return 31;
  }

  return Math.round(value);
}
