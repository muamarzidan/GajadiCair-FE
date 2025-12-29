export interface AttendanceLogEmployee {
  employee_id: string;
  name: string;
  username: string;
  email: string;
  avatar_uri: string | null;
}

export interface AttendanceLog {
  attendance_log_id: string;
  employee_id: string;
  log_type: number;
  timestamp: string;
  created_at: string;
  employee: AttendanceLogEmployee;
}

export interface CompanyDashboardData {
  total_employee: number;
  employeePresentToday: number;
  employeeHasNotCheckInToday: number;
  employeeHasNotCheckedOut: number;
  attendanceLog: AttendanceLog[];
}

export type AttendanceStatus = 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE' | 'SICK';

export interface ChartSeries {
  PRESENT: (number | null)[];
  LATE: (number | null)[];
  ABSENT: (number | null)[];
  LEAVE: (number | null)[];
  SICK: (number | null)[];
  total: number[];
}

export interface ChartPoint {
  period: string;
  total: number;
}

export interface ChartRange {
  start: string;
  end: string;
  days: number;
}

export interface CompanyDashboardChartData {
  granularity: string;
  range: ChartRange;
  labels: string[];
  series: ChartSeries;
  points: ChartPoint[];
}
