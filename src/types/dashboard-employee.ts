export interface EmployeeDashboardData {
  today: TodayAttendance;
  company: CompanyInfo;
  summary_month: MonthlySummary;
  recent_attendances: RecentAttendance[];
  leave_applications: LeaveApplicationsSummary;
  payroll: PayrollSummary;
}

export interface TodayAttendance {
  date: string;
  status: AttendanceStatus | null;
  check_in_time: string | null;
  check_out_time: string | null;
  is_late: boolean;
  late_minutes: number | null;
  total_work_hours: number | null;
  has_checked_in: boolean;
  has_checked_out: boolean;
}

export interface CompanyInfo {
  company_id: string;
  name: string;
  company_identifier: string;
  attendance_open_time: string;
  attendance_close_time: string;
  work_start_time: string;
  attendance_tolerance_minutes: number;
  minimum_hours_per_day: number;
  payroll_day_of_month: number;
  recognize_with_gesture: boolean;
}

export interface MonthlySummary {
  month: string;
  PRESENT: number;
  LATE: number;
  ABSENT: number;
  LEAVE: number;
  SICK: number;
  total_days: number;
}

export interface RecentAttendance {
  attendance_date: string;
  status: AttendanceStatus;
  check_in_time: string | null;
  check_out_time: string | null;
  is_late: boolean;
  late_minutes: number | null;
  total_work_hours: number | null;
}

export interface LeaveApplicationsSummary {
  pending: number;
}

export interface PayrollSummary {
  latest: LatestPayroll | null;
}

export interface LatestPayroll {
  payroll_date: string;
  amount: number;
  pdf_uri: string | null;
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'SICK';

export interface EmployeeDashboardChartData {
  granularity: string;
  range: ChartRange;
  labels: string[];
  series: ChartSeries;
  points: ChartPoint[];
}

export interface ChartRange {
  start: string;
  end: string;
  days: number;
}

export interface ChartSeries {
  PRESENT: number[];
  LATE: number[];
  ABSENT: number[];
  LEAVE: number[];
  SICK: number[];
  total: number[];
}

export interface ChartPoint {
  period: string;
  PRESENT: number;
  LATE: number;
  ABSENT: number;
  LEAVE: number;
  SICK: number;
  total: number;
}
