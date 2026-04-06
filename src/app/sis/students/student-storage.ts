import { loadManagedClasses, managedClassOptions, managedClassPairs, managedGradeOptions } from "../classes/class-storage";

export type StudentStatus = "Active" | "Transferred" | "Withdrawn" | "Archived";
export type StudentGender = "Male" | "Female";

export type ManagedStudent = {
  id: string;
  studentCode: string;
  fullName: string;
  gender: StudentGender;
  birthDate: string;
  grade: string;
  className: string;
  academicYear: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  homeAddress: string;
  notes: string;
};

export type StudentFormState = {
  studentCode: string;
  fullName: string;
  gender: StudentGender;
  birthDate: string;
  grade: string;
  className: string;
  academicYear: string;
  status: StudentStatus;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  guardianRelationship: string;
  homeAddress: string;
  notes: string;
};

export const STUDENT_STORAGE_KEY = "sis-students";

export const initialStudentFormState: StudentFormState = {
  studentCode: "",
  fullName: "",
  gender: "Female",
  birthDate: "2018-01-15",
  grade: loadManagedClasses()[0]?.grade ?? "Grade 1",
  className: loadManagedClasses()[0]?.className ?? "A",
  academicYear: "2026",
  status: "Active",
  guardianName: "",
  guardianPhone: "",
  guardianEmail: "",
  guardianRelationship: "Mother",
  homeAddress: "",
  notes: "",
};

export const seedStudents: ManagedStudent[] = [
  {
    id: "student-maria-cossa",
    studentCode: "STD-001",
    fullName: "Maria Cossa",
    gender: "Female",
    birthDate: "2017-02-12",
    grade: "Grade 3",
    className: "A",
    academicYear: "2026",
    status: "Active",
    guardianName: "Paula Cossa",
    guardianPhone: "+258 84 100 1001",
    guardianEmail: "paula.cossa@family.local",
    guardianRelationship: "Mother",
    homeAddress: "Bairro Central, Maputo",
    notes: "Needs printed ID card",
  },
  {
    id: "student-joao-machava",
    studentCode: "STD-002",
    fullName: "Joao Machava",
    gender: "Male",
    birthDate: "2016-07-03",
    grade: "Grade 5",
    className: "B",
    academicYear: "2026",
    status: "Active",
    guardianName: "Celina Machava",
    guardianPhone: "+258 84 100 1002",
    guardianEmail: "celina.machava@family.local",
    guardianRelationship: "Mother",
    homeAddress: "Laulane, Maputo",
    notes: "Transport fee included",
  },
  {
    id: "student-elisa-nhantumbo",
    studentCode: "STD-003",
    fullName: "Elisa Nhantumbo",
    gender: "Female",
    birthDate: "2019-05-22",
    grade: "Grade 2",
    className: "B",
    academicYear: "2026",
    status: "Transferred",
    guardianName: "Gerson Nhantumbo",
    guardianPhone: "+258 84 100 1003",
    guardianEmail: "gerson.nhantumbo@family.local",
    guardianRelationship: "Father",
    homeAddress: "Matola Gare",
    notes: "Transferred from Escola Sol Nascente",
  },
  {
    id: "student-marta-tomo",
    studentCode: "STD-004",
    fullName: "Marta Tomo",
    gender: "Female",
    birthDate: "2020-03-11",
    grade: "Grade 1",
    className: "A",
    academicYear: "2026",
    status: "Withdrawn",
    guardianName: "Delfina Tomo",
    guardianPhone: "+258 84 100 1004",
    guardianEmail: "delfina.tomo@family.local",
    guardianRelationship: "Mother",
    homeAddress: "Zimpeto",
    notes: "Family relocation pending archive",
  },
];

export function loadStudents() {
  if (typeof window === "undefined") {
    return seedStudents;
  }

  const stored = window.localStorage.getItem(STUDENT_STORAGE_KEY);
  if (!stored) {
    return seedStudents;
  }

  try {
    const parsed = JSON.parse(stored) as ManagedStudent[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : seedStudents;
  } catch {
    return seedStudents;
  }
}

export function persistStudents(nextStudents: ManagedStudent[]) {
  window.localStorage.setItem(STUDENT_STORAGE_KEY, JSON.stringify(nextStudents));
}

export function findStudentById(students: ManagedStudent[], id: string | null) {
  return id ? students.find((student) => student.id === id) ?? null : null;
}

export function buildStudentPayload(form: StudentFormState, editingId: string | null): ManagedStudent | null {
  const fullName = form.fullName.trim();
  const guardianName = form.guardianName.trim();
  const guardianPhone = form.guardianPhone.trim();

  if (!fullName || !guardianName || !guardianPhone) {
    return null;
  }

  return {
    id: editingId ?? `student-${fullName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
    studentCode: form.studentCode.trim().toUpperCase() || `STD-${Math.floor(100 + Math.random() * 900)}`,
    fullName,
    gender: form.gender,
    birthDate: form.birthDate,
    grade: form.grade,
    className: form.className,
    academicYear: form.academicYear.trim() || "2026",
    status: form.status,
    guardianName,
    guardianPhone,
    guardianEmail: form.guardianEmail.trim().toLowerCase(),
    guardianRelationship: form.guardianRelationship.trim() || "Guardian",
    homeAddress: form.homeAddress.trim(),
    notes: form.notes.trim(),
  };
}

export function toStudentFormState(student: ManagedStudent | null): StudentFormState {
  if (!student) {
    return initialStudentFormState;
  }

  return {
    studentCode: student.studentCode,
    fullName: student.fullName,
    gender: student.gender,
    birthDate: student.birthDate,
    grade: student.grade,
    className: student.className,
    academicYear: student.academicYear,
    status: student.status,
    guardianName: student.guardianName,
    guardianPhone: student.guardianPhone,
    guardianEmail: student.guardianEmail,
    guardianRelationship: student.guardianRelationship,
    homeAddress: student.homeAddress,
    notes: student.notes,
  };
}

export function gradeOptions() {
  return managedGradeOptions(loadManagedClasses());
}

export function classOptions(grade?: string) {
  return managedClassOptions(loadManagedClasses(), grade);
}

export function studentClassPairs() {
  return managedClassPairs(loadManagedClasses());
}
