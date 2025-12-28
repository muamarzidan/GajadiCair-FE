// Employee Payroll Types

export type PayrollDetailType = 'BASE_SALARY' | 'ALLOWANCE' | 'DEDUCTION';
export type DeductionType = 'LATE' | 'ABSENT' | 'LEAVE' | 'SICK';

// Summary Types
export interface EmployeePayrollPeriod {
  start: string;
  end: string;
}

export interface EmployeePayrollAttendance {
  absent_days: number;
  late_minutes: number;
}

export interface EmployeePayrollAllowanceDetail {
  name: string;
  amount: number;
}

export interface EmployeePayrollAllowance {
  total: number;
  details: EmployeePayrollAllowanceDetail[];
}

export interface EmployeePayrollDeductionDetail {
  name: string;
  type: DeductionType;
  amount: number;
}

export interface EmployeePayrollDeduction {
  total: number;
  details: EmployeePayrollDeductionDetail[];
}

export interface EmployeePayrollSummary {
  employee_id: string;
  name: string;
  email: string;
  period: EmployeePayrollPeriod;
  base_salary: number;
  attendance: EmployeePayrollAttendance;
  allowance: EmployeePayrollAllowance;
  deduction: EmployeePayrollDeduction;
  take_home_pay: number;
}

// History Types
export interface PayrollEmployee {
  employee_id: string;
  company_id?: string;
  name: string;
  email: string;
  avatar_uri: string | null;
}

export interface PayrollDetail {
  payroll_detail_id: string;
  payroll_log_id: string;
  description: string;
  type: PayrollDetailType;
  amount: number;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface PayrollLog {
  payroll_log_id: string;
  employee_id: string;
  amount: number;
  payroll_date: string;
  pdf_uri: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employee: PayrollEmployee;
  payroll_details: PayrollDetail[];
}

export interface PayrollLogDetail extends PayrollLog {
  // Same as PayrollLog but used for detail view
}
