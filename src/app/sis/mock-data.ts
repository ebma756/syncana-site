export type Status = "pending" | "paid" | "partial" | "overdue";

export const mockDashboard = {
  totalStudents: 342,
  feeCollectionPct: 78,
  revenueMTD: 245000,
  cashFlowMTD: 186000,
  attendanceToday: 94,
  revenueChange: "+8% vs last month",
  cashFlowChange: "+6% vs last month",
  feeOutstanding: 68,
  absencesToday: 21,
  estimatedFeesThisMonth: 280000,
  feesCollectedThisMonth: 218400,
  feesRemainingThisMonth: 61600,
  cashFlowSeries: [
    { label: "Oct", income: 225000, expense: 154000 },
    { label: "Nov", income: 238000, expense: 162000 },
    { label: "Dec", income: 241000, expense: 169000 },
    { label: "Jan", income: 256000, expense: 171000 },
    { label: "Feb", income: 262000, expense: 176000 },
    { label: "Mar", income: 278000, expense: 184000 },
  ],
  feeCollection: [
    { class: "Grade 1", collected: 92 },
    { class: "Grade 2", collected: 85 },
    { class: "Grade 3", collected: 78 },
    { class: "Grade 4", collected: 71 },
    { class: "Grade 5", collected: 65 },
    { class: "Grade 6", collected: 58 },
  ],
  alerts: [
    { id: "al1", text: "12 students have overdue fees (30+ days)", time: "Today, 08:00", color: "#f87171" },
    { id: "al2", text: "Teacher Ana Silva marked absent", time: "Today, 07:45", color: "#fbbf24" },
    { id: "al3", text: "Term 1 exam schedule published", time: "Yesterday", color: "#60a5fa" },
    { id: "al4", text: "Store stock low: Exercise books (8 left)", time: "Yesterday", color: "#fbbf24" },
  ],
  recentPayments: [
    { student: "Maria Cossa", class: "Grade 3A", amount: "2,500 MT", date: "Today", status: "Paid" },
    { student: "João Machava", class: "Grade 5B", amount: "1,800 MT", date: "Today", status: "Paid" },
    { student: "Inês Mota", class: "Grade 2A", amount: "900 MT", date: "Yesterday", status: "Partial" },
  ],
};

export type MockDashboard = typeof mockDashboard;

export const mockAttendance = {
  date: "2026-03-29",
  class: "6A",
  records: [
    { student: "Ana Lucas", status: "present" },
    { student: "Carlos Maba", status: "absent", note: "Fever" },
    { student: "Daniela Sitoe", status: "present" },
    { student: "Eduardo M.", status: "late" },
  ],
};

export type MockAttendance = typeof mockAttendance;

export const mockInvoices = [
  { id: "inv-1", student: "Ana Lucas", class: "6A", due: "2026-04-05", status: "due", balance: 80 },
  { id: "inv-2", student: "Carlos Maba", class: "6A", due: "2026-04-05", status: "overdue", balance: 120 },
  { id: "inv-3", student: "Daniela Sitoe", class: "6A", due: "2026-04-05", status: "partial", balance: 40 },
  { id: "inv-4", student: "Eduardo M.", class: "6A", due: "2026-04-05", status: "paid", balance: 0 },
];

export type MockInvoice = (typeof mockInvoices)[number];

export const mockGrades = {
  class: "7B",
  subject: "Matemática",
  term: "T1",
  passMark: 10,
  bands: [
    { label: "A", min: 19, max: 20 },
    { label: "B (VG)", min: 17, max: 18 },
    { label: "B", min: 14, max: 16 },
    { label: "C", min: 10, max: 13 },
    { label: "F", min: 0, max: 9 },
  ],
  entries: [
    { student: "Ana Lucas", exam: 17, test: 16, average: 17, status: "Pass" },
    { student: "Carlos Maba", exam: 10, test: 12, average: 11, status: "Pass" },
    { student: "Daniela Sitoe", exam: 8, test: 10, average: 9, status: "Fail" },
  ],
  passRate: 67,
};

export type MockGrades = typeof mockGrades;

export const mockStore = {
  todaySales: 540,
  paymentMix: { cash: 320, pos: 180, bank: 40 },
  products: [
    { name: "Uniform (shirt)", stock: 12, price: 10, low: false },
    { name: "Notebook pack", stock: 4, price: 5, low: true },
    { name: "Backpack", stock: 7, price: 18, low: false },
  ],
};

export type MockStore = typeof mockStore;

export const mockComms = {
  announcements: [
    { id: "ann-1", title: "Exam schedule T1", date: "2026-03-25", audience: "Teachers" },
    { id: "ann-2", title: "Parents meeting Friday", date: "2026-03-27", audience: "Parents" },
  ],
  threads: [
    { id: "msg-1", with: "Parent: Ana Lucas", last: "Thank you, noted.", date: "2026-03-28" },
    { id: "msg-2", with: "Parent: Carlos Maba", last: "Can we discuss grades?", date: "2026-03-27" },
  ],
};

export type MockAnnouncement = (typeof mockComms.announcements)[number];
export type MockThread = (typeof mockComms.threads)[number];

export const mockStaffManagement = {
  summary: {
    activeStaff: 48,
    pendingPayroll: 6,
    attendanceRate: 93,
    performanceReviews: 4,
  },
  staff: [
    { name: "Ana Silva", role: "Teacher", status: "Active", attendance: "96%", performance: "Excellent" },
    { name: "Mateus Cossa", role: "Secretary", status: "Active", attendance: "91%", performance: "Strong" },
    { name: "Helena Mucavele", role: "Pedagogy Coordinator", status: "Active", attendance: "94%", performance: "Excellent" },
    { name: "Paulo Macamo", role: "Store Assistant", status: "On Leave", attendance: "88%", performance: "Needs review" },
  ],
  payrollRuns: [
    { month: "March 2026", amount: "486,000 MT", status: "Ready for approval" },
    { month: "February 2026", amount: "472,000 MT", status: "Processed" },
  ],
  roleActions: [
    "Add, edit, and deactivate staff accounts",
    "Assign secretary, pedagogy, and teacher roles",
    "Approve salaries and review payroll history",
    "View staff attendance and performance",
  ],
};

export type MockStaffManagement = typeof mockStaffManagement;

export const mockAcademicHub = {
  summary: {
    timetableCoverage: 92,
    publishedReports: 14,
    underperformingStudents: 18,
    pendingGradeApprovals: 9,
  },
  classes: [
    { name: "Grade 3A", teacher: "Ana Silva", progress: 86, issues: "2 students below pass mark" },
    { name: "Grade 4B", teacher: "Lucinda Bila", progress: 78, issues: "Supplementary planning needed" },
    { name: "Grade 5A", teacher: "José M.", progress: 91, issues: "On track" },
  ],
  tasks: [
    "Assign teachers to subjects and classes",
    "Build and publish timetable and academic calendar",
    "Review exam results and publish report cards",
    "Manage promotions and curriculum progress",
  ],
  schedule: [
    { item: "Term 1 exams", date: "Apr 12", status: "Published" },
    { item: "Supplementary session", date: "Apr 26", status: "Draft" },
    { item: "Promotion board", date: "Jul 02", status: "Planned" },
  ],
};

export type MockAcademicHub = typeof mockAcademicHub;

export const mockOperationsHub = {
  summary: {
    newEnrollments: 17,
    invoicesDue: 68,
    dailyCash: "54,800 MT",
    parentMessages: 11,
  },
  enrollments: [
    { student: "Elisa Nhantumbo", grade: "Grade 2", status: "Documents pending" },
    { student: "Carlos Nhaca", grade: "Grade 4", status: "Ready for ID card" },
    { student: "Marta Tomo", grade: "Grade 1", status: "Approved" },
  ],
  financeOps: [
    { item: "Fee invoices to issue", value: 24, detail: "Grade 1 and Grade 3" },
    { item: "Outstanding balances", value: 68, detail: "Reminder batch ready" },
    { item: "Expense requests", value: 5, detail: "Waiting owner approval" },
  ],
  actions: [
    "Enroll, transfer, withdraw, and archive students",
    "Record payments, issue receipts, and send reminders",
    "Track store sales, inventory, and daily reconciliation",
    "Send announcements and reply to parent messages",
  ],
};

export type MockOperationsHub = typeof mockOperationsHub;
