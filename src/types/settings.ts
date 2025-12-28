export interface AttendanceLocation {
  latitude: number | null;
  longitude: number | null;
}

export interface AttendanceSettings {
  minimum_hours_per_day: number | null;
  attendance_open_time: string | null;
  attendance_close_time: string | null;
  work_start_time: string | null;
  payroll_day_of_month: number | null;
  recognize_with_gesture: boolean;
  attendance_tolerance_minutes: number | null;
  attendance_location_enabled: boolean;
  attendance_radius_meters: number | null;
  attendance_location: AttendanceLocation;
}

export interface UpdateAttendanceSettingsRequest {
  minimum_hours_per_day?: number;
  attendance_open_time?: string;
  attendance_close_time?: string;
  work_start_time?: string;
  attendance_tolerance_minutes?: number;
  payroll_day_of_month?: number;
  recognize_with_gesture?: boolean;
  attendance_location_enabled?: boolean;
  attendance_radius_meters?: number;
  latitude?: number;
  longitude?: number;
}
