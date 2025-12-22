export interface Employee {
  employee_id: string;
  name: string;
  username: string;
  email: string;
  company_id: string;
  password?: string;
  is_active: boolean;
  base_salary: number;
  is_face_enrolled: boolean;
  bank_id: string | null;
  bank_account_number: string | null;
  tax_identification_number: string | null;
  avatar_uri: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}
export interface CreateEmployeeRequest {
  name: string;
  username: string;
  email: string;
  password: string;
  base_salary: number;
  bank_id: string;
  bank_account_number: string;
  tax_identification_number?: string;
  send_to_email?: boolean;
}
export interface UpdateEmployeeRequest {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  base_salary?: number;
  bank_id?: string;
  bank_account_number?: string;
  tax_identification_number?: string;
  is_active?: boolean;
}