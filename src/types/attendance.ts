export interface AttendanceRecord {
  attendance_id: string;
  employee_id: string;
  check_in_time: string;
  check_out_time: string | null;
  check_in_latitude: number;
  check_in_longitude: number;
  check_out_latitude: number | null;
  check_out_longitude: number | null;
  work_duration_minutes: number | null;
  status: 'present' | 'late' | 'absent' | 'half-day';
  notes: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface TodayAttendanceStatus {
  has_checked_in: boolean;
  has_checked_out: boolean;
  check_in_time: string | null;
  check_out_time: string | null;
  attendance_id: string | null;
  work_duration_minutes: number | null;
}

export interface CheckInRequest {
  file: File;
  latitude: number;
  longitude: number;
}

export interface CheckInResponse {
  attendance_id: string;
  check_in_time: string;
  message: string;
}

export interface CheckOutRequest {
  file: File;
  latitude: number;
  longitude: number;
}

// Company Attendance Overview Types
export interface EmployeeAttendanceDetail {
  employee_attendance_id: string;
  attendance_date: string;
  status: 'PRESENT' | 'ABSENT' | 'LEAVE' | 'SICK';
  is_late: boolean;
  late_minutes: number | null;
  check_in_time: string | null;
  check_out_time: string | null;
  total_work_hours: number | null;
  absent_reason: string | null;
}

export interface EmployeeWithAttendance {
  employee_id: string;
  name: string;
  email: string;
  avatar_uri: string | null;
  attendance: EmployeeAttendanceDetail;
}

export interface CompanyAttendanceOverviewResponse {
  date: string;
  employees: EmployeeWithAttendance[];
}

export interface CheckOutResponse {
  attendance_id: string;
  check_in_time: string;
  check_out_time: string;
  work_duration_minutes: number;
  message: string;
}

export interface CheckInEligibility {
  can_check_in: boolean;
  remaining_time_until_closed: number | null;
  opened_time: string | null;
  closed_time: string | null;
  reason: string | null;
}

export interface CheckOutEligibility {
  can_check_out: boolean;
  min_hours: number | null;
  worked_hours: number | null;
  reason: string | null;
}

export interface GeolocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
}
