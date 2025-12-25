export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LEAVE' | 'SICK' | '-';

export interface AttendanceHistory {
    employee_attendance_id: string;
    tanggal: string;
    status: AttendanceStatus;
    is_late: boolean;
    late_minutes: number;
    check_in_time: string | null;
    check_out_time: string | null;
}

export interface AttendanceSummary {
    PRESENT: number;
    ABSENT: number;
    LEAVE: number;
    SICK: number;
    '-': number;
}

export interface EmployeeAttendance {
    employee_id: string;
    email: string;
    name: string;
    avatar_uri: string | null;
    attendance_histories: AttendanceHistory[];
    summary: AttendanceSummary;
}

export interface AttendanceSummaryResponse {
    range: {
        start_date: string;
        end_date: string;
    };
    employees: EmployeeAttendance[];
}

export interface UpdateAttendanceRequest {
    employee_attendance_id: string;
    status: Exclude<AttendanceStatus, '-'>;
    check_in_time?: string;
    check_out_time?: string;
    late_minutes?: number;
    is_late?: boolean;
    absent_reason?: string;
}
