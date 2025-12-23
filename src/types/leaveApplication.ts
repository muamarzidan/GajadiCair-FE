export interface LeaveApplication {
  employee_leave_application_id: string;
  employee_id: string;
  start_date: string;
  end_date: string;
  reason: string;
  status: 0 | 1 | 2; // 0: pending, 1: approved, 2: rejected
  attachment_uri: string | null;
  type: 'SICK' | 'LEAVE';
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  employee?: {
    employee_id: string;
    name: string;
    email: string;
    avatar_uri: string | null;
  };
}

export interface CreateLeaveApplicationRequest {
  attachment: File;
  start_date: string;
  end_date: string;
  reason: string;
  type: 'SICK' | 'LEAVE';
}

export interface UpdateLeaveApplicationStatusRequest {
  employee_leave_application_id: string;
  is_approve: boolean;
}
