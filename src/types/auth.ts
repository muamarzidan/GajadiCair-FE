// Base user interface
export interface BaseUser {
  email: string;
  name: string;
  avatar_uri: string | null;
  plan_expiration?: string | null;
  last_login: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
// Company user
export interface CompanyUser extends BaseUser {
  company_id: string;
  level_plan: number;
  plan_expiration: string | null;
  minimum_hours_per_day: number | null;
  attendance_open_time: string | null;
  attendance_close_time: string | null;
  work_start_time: string | null;
  work_end_time: string | null;
  attendance_tolerance_minutes: number | null;
  payroll_day_of_month: number | null;
  role: 'company';
}
// Login response with access_token
export interface CompanyLoginResponse {
  company: Omit<CompanyUser, 'role'>;
  access_token: string;
}
export interface EmployeeLoginResponse {
  employee: Omit<EmployeeUser, 'role'>;
  access_token: string;
}
// Employee user
export interface EmployeeUser extends BaseUser {
  employee_id: string;
  company_id: string;
  is_active: boolean;
  base_salary: number;
  face_id: string | null;
  bank_id: string | null;
  bank_account_number: string | null;
  tax_identification_number: string | null;
  role: 'employee';
}
// Union type for all users
export type User = CompanyUser | EmployeeUser;
// Login requests
export interface CompanyLoginRequest {
  email: string;
  password: string;
}
export interface EmployeeLoginRequest {
  company_id: string;
  employee_id: string;
  password: string;
}
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}
export interface GoogleLoginRequest {
  id_token: string;
}