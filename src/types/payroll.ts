// Payroll Types

export type PayrollDeductionType = 'LATE' | 'ABSENT' | 'LEAVE' | 'SICK';

// Allowance Rule
export interface PayrollAllowanceRule {
  payroll_allowance_rule_id: string;
  name: string;
  percentage?: number;
  fixed_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateAllowanceRuleRequest {
  name: string;
  percentage?: number;
  fixed_amount?: number;
}

export interface UpdateAllowanceRuleRequest {
  name?: string;
  percentage?: number;
  fixed_amount?: number;
  is_active?: boolean;
}

// Deduction Rule
export interface PayrollDeductionRule {
  payroll_deduction_rule_id: string;
  name: string;
  type: PayrollDeductionType;
  percentage?: number;
  fixed_amount?: number;
  per_minute?: boolean;
  max_minutes?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateDeductionRuleRequest {
  name: string;
  type: PayrollDeductionType;
  percentage?: number;
  fixed_amount?: number;
  per_minute?: boolean;
  max_minutes?: number;
}

export interface UpdateDeductionRuleRequest {
  name?: string;
  type?: PayrollDeductionType;
  percentage?: number;
  fixed_amount?: number;
  per_minute?: boolean;
  max_minutes?: number;
  is_active?: boolean;
}

// Payroll Summary
export interface PayrollSummaryPeriod {
  start: string;
  end: string;
}

export interface PayrollSummaryAttendance {
  absent_days: number;
  late_minutes: number;
}

export interface PayrollSummaryDetail {
  name: string;
  amount: number;
}

export interface PayrollSummaryAllowance {
  total: number;
  details: PayrollSummaryDetail[];
}

export interface PayrollSummaryDeduction {
  total: number;
  details: PayrollSummaryDetail[];
}

export interface PayrollSummaryEmployee {
  employee_id: string;
  name: string;
  period: PayrollSummaryPeriod;
  base_salary: number;
  attendance: PayrollSummaryAttendance;
  allowance: PayrollSummaryAllowance;
  deduction: PayrollSummaryDeduction;
  take_home_pay: number;
}
