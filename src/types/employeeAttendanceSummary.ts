export type EmployeeAttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'SICK' | '-';

export interface EmployeeAttendanceHistoryItem {
  tanggal: string;
  status: EmployeeAttendanceStatus;
  is_late: boolean;
  late_minutes: number;
  check_in_time: string | null;
  check_out_time: string | null;
}

export interface EmployeeAttendanceSummary {
  PRESENT: number;
  ABSENT: number;
  LEAVE: number;
  SICK: number;
  '-': number;
}

export interface EmployeeAttendanceData {
  employee_id: string;
  name: string;
  email: string;
  avatar_uri: string | null;
  attendance_histories: EmployeeAttendanceHistoryItem[];
  summary: EmployeeAttendanceSummary;
}

export interface EmployeeAttendanceSummaryRange {
  month: number;
  year: number;
  start_date: string;
  end_date: string;
}

export interface EmployeeAttendanceSummaryResponse {
  range: EmployeeAttendanceSummaryRange;
  employee: EmployeeAttendanceData;
}
