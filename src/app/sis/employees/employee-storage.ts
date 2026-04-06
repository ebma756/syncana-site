import { AppRole, roleDefinitions } from "@/lib/rbac";

export type AssignableStaffRole = Exclude<AppRole, "super_admin" | "parent">;
export type StaffStatus = "Active" | "On Leave" | "Inactive";
export type StaffPerformance = "Excellent" | "Strong" | "Good" | "Needs review";

export type ManagedStaffMember = {
  id: string;
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: AssignableStaffRole;
  status: StaffStatus;
  dateJoined: string;
  monthlySalary: number;
  department: string;
  attendance: number;
  performance: StaffPerformance;
};

export type StaffFormState = {
  employeeCode: string;
  name: string;
  email: string;
  phone: string;
  role: AssignableStaffRole;
  status: StaffStatus;
  dateJoined: string;
  monthlySalary: string;
  department: string;
};

export const STAFF_STORAGE_KEY = "sis-staff-members";

export const assignableRoles: Array<{
  key: AssignableStaffRole;
  summary: string;
}> = [
  {
    key: "pedagogy_coordinator",
    summary: "Academic planning, grade review, timetable, teacher coordination",
  },
  {
    key: "secretary_admin",
    summary: "Enrollment, payments, receipts, store, expenses, parent support",
  },
  {
    key: "teacher",
    summary: "Assigned classes, attendance, grade entry, parent communication",
  },
  {
    key: "staff_support",
    summary: "General collaborator with limited, non-sensitive access",
  },
];

export const initialFormState: StaffFormState = {
  employeeCode: "",
  name: "",
  email: "",
  phone: "",
  role: "teacher",
  status: "Active",
  dateJoined: "2026-03-29",
  monthlySalary: "",
  department: "",
};

export const seedStaff: ManagedStaffMember[] = [
  {
    id: "staff-ana-silva",
    employeeCode: "EMP-001",
    name: "Ana Silva",
    email: "ana.silva@schoolsis.local",
    phone: "+258 84 001 1001",
    role: "teacher",
    status: "Active",
    dateJoined: "2025-01-08",
    monthlySalary: 24500,
    department: "Primary Mathematics",
    attendance: 96,
    performance: "Excellent",
  },
  {
    id: "staff-mateus-cossa",
    employeeCode: "EMP-002",
    name: "Mateus Cossa",
    email: "mateus.cossa@schoolsis.local",
    phone: "+258 84 001 1002",
    role: "secretary_admin",
    status: "Active",
    dateJoined: "2024-09-18",
    monthlySalary: 28000,
    department: "Admissions & Fees Desk",
    attendance: 91,
    performance: "Strong",
  },
  {
    id: "staff-helena-mucavele",
    employeeCode: "EMP-003",
    name: "Helena Mucavele",
    email: "helena.mucavele@schoolsis.local",
    phone: "+258 84 001 1003",
    role: "pedagogy_coordinator",
    status: "Active",
    dateJoined: "2024-06-12",
    monthlySalary: 36500,
    department: "Academic Coordination",
    attendance: 94,
    performance: "Excellent",
  },
  {
    id: "staff-paulo-macamo",
    employeeCode: "EMP-004",
    name: "Paulo Macamo",
    email: "paulo.macamo@schoolsis.local",
    phone: "+258 84 001 1004",
    role: "staff_support",
    status: "On Leave",
    dateJoined: "2025-03-03",
    monthlySalary: 19000,
    department: "Operations Support",
    attendance: 88,
    performance: "Needs review",
  },
];

export function loadStaffMembers() {
  if (typeof window === "undefined") {
    return seedStaff;
  }

  const stored = window.localStorage.getItem(STAFF_STORAGE_KEY);
  if (!stored) {
    return seedStaff;
  }

  try {
    const parsed = JSON.parse(stored) as ManagedStaffMember[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedStaff;
  } catch {
    return seedStaff;
  }
}

export function persistStaffMembers(nextStaff: ManagedStaffMember[]) {
  window.localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(nextStaff));
}

export function findStaffMemberById(staff: ManagedStaffMember[], id: string | null) {
  return id ? staff.find((member) => member.id === id) ?? null : null;
}

export function buildStaffPayload(
  form: StaffFormState,
  editingId: string | null,
  existingMember?: ManagedStaffMember | null,
): ManagedStaffMember | null {
  const normalizedName = form.name.trim();
  const normalizedEmail = form.email.trim().toLowerCase();
  const normalizedPhone = form.phone.trim();
  const normalizedCode = form.employeeCode.trim().toUpperCase();
  const normalizedDepartment = form.department.trim();

  if (!normalizedName || !normalizedEmail || !normalizedPhone) {
    return null;
  }

  return {
    id: editingId ?? `staff-${normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    employeeCode: normalizedCode || `EMP-${Math.floor(100 + Math.random() * 900)}`,
    name: normalizedName,
    email: normalizedEmail,
    phone: normalizedPhone,
    role: form.role,
    status: form.status,
    dateJoined: form.dateJoined,
    monthlySalary: Number(form.monthlySalary) || 0,
    department: normalizedDepartment || roleDefinitions[form.role].label,
    attendance: existingMember?.attendance ?? 0,
    performance: existingMember?.performance ?? "Good",
  };
}

export function permissionsSummary(role: AssignableStaffRole) {
  const permissions = roleDefinitions[role].permissions;
  return permissions[0] === "*" ? "Full access" : `${permissions.length} permission rules`;
}

export function toStaffFormState(member: ManagedStaffMember | null): StaffFormState {
  if (!member) {
    return initialFormState;
  }

  return {
    employeeCode: member.employeeCode,
    name: member.name,
    email: member.email,
    phone: member.phone,
    role: member.role,
    status: member.status,
    dateJoined: member.dateJoined,
    monthlySalary: `${member.monthlySalary}`,
    department: member.department,
  };
}
