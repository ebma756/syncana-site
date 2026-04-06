"use client";

export type InstituteProfileSettings = {
  instituteName: string;
  tagline: string;
  phone: string;
  website: string;
  address: string;
  country: string;
  logoDataUrl: string;
};

export type FeeInvoiceBankAccount = {
  id: string;
  bankName: string;
  branchAddress: string;
  accountNumber: string;
  instructions: string;
  logoDataUrl: string;
  isDefault: boolean;
};

export type FeeChargeType = "Tuition" | "Registration" | "Exam" | "Transport";

export type GradeFeeStructure = {
  id: string;
  grade: string;
  tuition: number;
  registrationFee: number;
  examFee: number;
  transportFee: number;
  isActive: boolean;
};

export type DiscountRule = {
  id: string;
  name: string;
  type: "fixed" | "percentage";
  value: number;
  description: string;
  isActive: boolean;
};

export type ExtracurricularActivity = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  teacherName?: string;
  dayLabel?: string;
  timeLabel?: string;
};

export type ExtracurricularPackage = {
  id: string;
  name: string;
  description: string;
  monthlyFee: number;
  includedActivityIds: string[];
  isActive: boolean;
};

export type StudentExtracurricularPackageEnrollment = {
  id: string;
  studentId: string;
  packageId: string;
  status: "active" | "inactive";
  startDate: string;
};

export type GradingBand = {
  id: string;
  label: string;
  min: number;
  max: number;
};

export type FailCriteriaSettings = {
  overallThreshold: number;
  subjectThreshold: number;
  minimumSubjects: number;
};

export type GradingSettings = {
  scaleMin: number;
  scaleMax: number;
  passMark: number;
  bands: GradingBand[];
  failCriteria: FailCriteriaSettings;
};

export const INSTITUTE_PROFILE_SETTINGS_KEY = "sis-settings-institute-profile";
export const FEE_INVOICE_BANKS_KEY = "sis-settings-fee-invoice-banks";
export const GRADING_SETTINGS_KEY = "sis-settings-grading";
export const GRADE_FEE_STRUCTURES_KEY = "sis-settings-grade-fee-structures";
export const DISCOUNT_RULES_KEY = "sis-settings-discount-rules";
export const EXTRACURRICULAR_ACTIVITIES_KEY = "sis-settings-extracurricular-activities";
export const EXTRACURRICULAR_PACKAGES_KEY = "sis-settings-extracurricular-packages";
export const STUDENT_PACKAGE_ENROLLMENTS_KEY = "sis-settings-student-package-enrollments";

export const defaultInstituteProfileSettings: InstituteProfileSettings = {
  instituteName: "Escola Primaria ABC",
  tagline: "Learning with clarity and care",
  phone: "+258 84 001 1000",
  website: "https://schoolsis.local",
  address: "Maputo City",
  country: "Mozambique",
  logoDataUrl: "",
};

export const defaultGradingSettings: GradingSettings = {
  scaleMin: 0,
  scaleMax: 20,
  passMark: 10,
  bands: [
    { id: "band-a", label: "A", min: 19, max: 20 },
    { id: "band-b-vg", label: "B (Very Good)", min: 17, max: 18 },
    { id: "band-b-good", label: "B (Good)", min: 14, max: 16 },
    { id: "band-c", label: "C", min: 10, max: 13 },
    { id: "band-f", label: "F", min: 0, max: 9 },
  ],
  failCriteria: {
    overallThreshold: 40,
    subjectThreshold: 33,
    minimumSubjects: 1,
  },
};

export const defaultGradeFeeStructures: GradeFeeStructure[] = [
  { id: "fee-grade-1", grade: "Grade 1", tuition: 1800, registrationFee: 1400, examFee: 400, transportFee: 540, isActive: true },
  { id: "fee-grade-2", grade: "Grade 2", tuition: 1950, registrationFee: 1450, examFee: 450, transportFee: 585, isActive: true },
  { id: "fee-grade-3", grade: "Grade 3", tuition: 2100, registrationFee: 1500, examFee: 500, transportFee: 630, isActive: true },
  { id: "fee-grade-4", grade: "Grade 4", tuition: 2250, registrationFee: 1600, examFee: 550, transportFee: 675, isActive: true },
  { id: "fee-grade-5", grade: "Grade 5", tuition: 2400, registrationFee: 1650, examFee: 600, transportFee: 720, isActive: true },
  { id: "fee-grade-6", grade: "Grade 6", tuition: 2550, registrationFee: 1700, examFee: 650, transportFee: 765, isActive: true },
];

export const defaultDiscountRules: DiscountRule[] = [
  { id: "discount-scholarship", name: "Scholarship", type: "percentage", value: 25, description: "Default scholarship rule for approved learners.", isActive: true },
  { id: "discount-sibling", name: "Sibling Discount", type: "percentage", value: 10, description: "Sibling fee reduction when approved by management.", isActive: true },
];

export const defaultExtracurricularActivities: ExtracurricularActivity[] = [
  { id: "activity-dance", name: "Dance", description: "Afternoon movement and rhythm program.", isActive: true, dayLabel: "Mon", timeLabel: "14:30" },
  { id: "activity-taekwondo", name: "Taekwondo", description: "Martial arts and discipline training.", isActive: true, dayLabel: "Wed", timeLabel: "15:00" },
  { id: "activity-music", name: "Music", description: "Group music and instrument fundamentals.", isActive: true, dayLabel: "Fri", timeLabel: "14:00" },
];

export const defaultExtracurricularPackages: ExtracurricularPackage[] = [
  {
    id: "package-afternoon-club",
    name: "Afternoon Activities Add-on",
    description: "Paid extracurricular package for the afternoon program.",
    monthlyFee: 1000,
    includedActivityIds: ["activity-dance", "activity-taekwondo", "activity-music"],
    isActive: true,
  },
];

export const defaultStudentPackageEnrollments: StudentExtracurricularPackageEnrollment[] = [
  { id: "enrollment-student-maria-cossa-afternoon", studentId: "student-maria-cossa", packageId: "package-afternoon-club", status: "active", startDate: "2026-03-01" },
];

export function loadInstituteProfileSettings() {
  if (typeof window === "undefined") {
    return defaultInstituteProfileSettings;
  }

  const stored = window.localStorage.getItem(INSTITUTE_PROFILE_SETTINGS_KEY);
  if (!stored) {
    return defaultInstituteProfileSettings;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<InstituteProfileSettings>;
    return {
      ...defaultInstituteProfileSettings,
      ...parsed,
    } satisfies InstituteProfileSettings;
  } catch {
    return defaultInstituteProfileSettings;
  }
}

export function persistInstituteProfileSettings(nextSettings: InstituteProfileSettings) {
  window.localStorage.setItem(INSTITUTE_PROFILE_SETTINGS_KEY, JSON.stringify(nextSettings));
}

export function loadGradeFeeStructures() {
  if (typeof window === "undefined") {
    return defaultGradeFeeStructures;
  }

  const settingsStored = window.localStorage.getItem(GRADE_FEE_STRUCTURES_KEY);
  if (settingsStored) {
    try {
      const parsed = JSON.parse(settingsStored) as GradeFeeStructure[];
      return Array.isArray(parsed) ? parsed : defaultGradeFeeStructures;
    } catch {
      return defaultGradeFeeStructures;
    }
  }

  const legacyStored = window.localStorage.getItem("sis-fee-structures");
  if (legacyStored) {
    try {
      const parsed = JSON.parse(legacyStored) as Array<{
        grade: string;
        monthlyTuition: number;
        registrationFee: number;
        examFee: number;
      }>;
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((entry) => ({
          id: `fee-${entry.grade.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
          grade: entry.grade,
          tuition: entry.monthlyTuition,
          registrationFee: entry.registrationFee,
          examFee: entry.examFee,
          transportFee: Math.round(entry.monthlyTuition * 0.3),
          isActive: true,
        }));
      }
    } catch {
      return defaultGradeFeeStructures;
    }
  }

  return defaultGradeFeeStructures;
}

export function persistGradeFeeStructures(nextStructures: GradeFeeStructure[]) {
  window.localStorage.setItem(GRADE_FEE_STRUCTURES_KEY, JSON.stringify(nextStructures));
}

export function loadDiscountRules() {
  return loadCollection<DiscountRule>(DISCOUNT_RULES_KEY, defaultDiscountRules);
}

export function persistDiscountRules(nextRules: DiscountRule[]) {
  window.localStorage.setItem(DISCOUNT_RULES_KEY, JSON.stringify(nextRules));
}

export function loadExtracurricularActivities() {
  return loadCollection<ExtracurricularActivity>(EXTRACURRICULAR_ACTIVITIES_KEY, defaultExtracurricularActivities);
}

export function persistExtracurricularActivities(nextActivities: ExtracurricularActivity[]) {
  window.localStorage.setItem(EXTRACURRICULAR_ACTIVITIES_KEY, JSON.stringify(nextActivities));
}

export function loadExtracurricularPackages() {
  return loadCollection<ExtracurricularPackage>(EXTRACURRICULAR_PACKAGES_KEY, defaultExtracurricularPackages);
}

export function persistExtracurricularPackages(nextPackages: ExtracurricularPackage[]) {
  window.localStorage.setItem(EXTRACURRICULAR_PACKAGES_KEY, JSON.stringify(nextPackages));
}

export function loadStudentPackageEnrollments() {
  return loadCollection<StudentExtracurricularPackageEnrollment>(STUDENT_PACKAGE_ENROLLMENTS_KEY, defaultStudentPackageEnrollments);
}

export function persistStudentPackageEnrollments(nextEnrollments: StudentExtracurricularPackageEnrollment[]) {
  window.localStorage.setItem(STUDENT_PACKAGE_ENROLLMENTS_KEY, JSON.stringify(nextEnrollments));
}

export function loadFeeInvoiceBankAccounts() {
  if (typeof window === "undefined") {
    return [] as FeeInvoiceBankAccount[];
  }

  const stored = window.localStorage.getItem(FEE_INVOICE_BANKS_KEY);
  if (!stored) {
    return [] as FeeInvoiceBankAccount[];
  }

  try {
    const parsed = JSON.parse(stored) as FeeInvoiceBankAccount[];
    return Array.isArray(parsed) ? normalizeDefaultBank(parsed) : [];
  } catch {
    return [] as FeeInvoiceBankAccount[];
  }
}

export function persistFeeInvoiceBankAccounts(nextAccounts: FeeInvoiceBankAccount[]) {
  window.localStorage.setItem(FEE_INVOICE_BANKS_KEY, JSON.stringify(normalizeDefaultBank(nextAccounts)));
}

export function loadGradingSettings() {
  if (typeof window === "undefined") {
    return defaultGradingSettings;
  }

  const stored = window.localStorage.getItem(GRADING_SETTINGS_KEY);
  if (!stored) {
    return defaultGradingSettings;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<GradingSettings>;
    return {
      ...defaultGradingSettings,
      ...parsed,
      bands: Array.isArray(parsed.bands) && parsed.bands.length > 0 ? parsed.bands : defaultGradingSettings.bands,
      failCriteria: {
        ...defaultGradingSettings.failCriteria,
        ...parsed.failCriteria,
      },
    } satisfies GradingSettings;
  } catch {
    return defaultGradingSettings;
  }
}

export function persistGradingSettings(nextSettings: GradingSettings) {
  window.localStorage.setItem(GRADING_SETTINGS_KEY, JSON.stringify(nextSettings));
}

export function gradingBandLabel(score: number, settings: GradingSettings = defaultGradingSettings) {
  const match = settings.bands.find((band) => score >= band.min && score <= band.max);
  return match?.label ?? settings.bands[settings.bands.length - 1]?.label ?? "F";
}

export function defaultFeeAmountForGrade(grade: string, chargeType: FeeChargeType, structures = loadGradeFeeStructures()) {
  const structure = structures.find((item) => item.grade === grade && item.isActive);
  if (!structure) {
    return 0;
  }

  if (chargeType === "Registration") {
    return structure.registrationFee;
  }

  if (chargeType === "Exam") {
    return structure.examFee;
  }

  if (chargeType === "Transport") {
    return structure.transportFee;
  }

  return structure.tuition;
}

export function activeStudentPackageEnrollments(studentId: string, enrollments = loadStudentPackageEnrollments()) {
  return enrollments.filter((entry) => entry.studentId === studentId && entry.status === "active");
}

export function studentPackageAmount(studentId: string, packages = loadExtracurricularPackages(), enrollments = loadStudentPackageEnrollments()) {
  return activeStudentPackageEnrollments(studentId, enrollments).reduce((sum, enrollment) => {
    const match = packages.find((entry) => entry.id === enrollment.packageId && entry.isActive);
    return sum + (match?.monthlyFee ?? 0);
  }, 0);
}

export function studentPackageSummaries(studentId: string, packages = loadExtracurricularPackages(), enrollments = loadStudentPackageEnrollments()) {
  return activeStudentPackageEnrollments(studentId, enrollments)
    .map((enrollment) => packages.find((entry) => entry.id === enrollment.packageId && entry.isActive))
    .filter(Boolean) as ExtracurricularPackage[];
}

export function packageActivities(packageId: string, packages = loadExtracurricularPackages(), activities = loadExtracurricularActivities()) {
  const pkg = packages.find((entry) => entry.id === packageId);
  if (!pkg) {
    return [] as ExtracurricularActivity[];
  }

  return activities.filter((activity) => pkg.includedActivityIds.includes(activity.id));
}

function normalizeDefaultBank(accounts: FeeInvoiceBankAccount[]) {
  const hasDefault = accounts.some((account) => account.isDefault);
  if (hasDefault) {
    return accounts;
  }

  return accounts.map((account, index) => ({
    ...account,
    isDefault: index === 0,
  }));
}

function loadCollection<T>(key: string, fallback: T[]) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const stored = window.localStorage.getItem(key);
  if (!stored) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(stored) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}
