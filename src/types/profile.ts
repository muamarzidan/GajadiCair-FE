export interface UpdateProfileRequest {
  name: string;
  profile_picture?: File;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileResponse {
  name: string;
  avatar_uri: string | null;
}

export interface CompanyInfo {
  company_id: string;
  email: string;
  company_identifier: string;
  name: string;
  avatar_uri: string | null;
  level_plan: number;
  plan_expiration: string;
  minimum_hours_per_day: number;
  attendance_open_time: string;
  attendance_close_time: string;
  work_start_time: string;
  attendance_tolerance_minutes: number;
  payroll_day_of_month: number;
  attendance_location_enabled: boolean;
  attendance_radius_meters: number;
  recognize_with_gesture: boolean;
  last_login: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface EmployeeProfileResponse {
  employee_id: string;
  name: string;
  username: string;
  email: string;
  company_id: string;
  is_active: boolean;
  base_salary: number;
  is_face_enrolled: boolean;
  bank_id: string | null;
  bank_account_number: string | null;
  tax_identification_number: string | null;
  avatar_uri: string | null;
  last_login: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  company: CompanyInfo;
  subscription_status: {
    level_plan: number;
    plan_expiration: string;
  };
}
