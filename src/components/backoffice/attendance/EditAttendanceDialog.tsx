import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { attendanceSummaryApi, type UpdateAttendanceRequest } from '@/services/attendanceSummary';
import { type EmployeeAttendanceDetail } from '@/types/attendance';
import { getErrorMessage, getValidationErrors } from '@/utils';

interface EditAttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: EmployeeAttendanceDetail | null;
  employeeName: string;
  onSuccess: () => void;
}

export function EditAttendanceDialog({
  open,
  onOpenChange,
  attendance,
  employeeName,
  onSuccess,
}: EditAttendanceDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<UpdateAttendanceRequest>({
    employee_attendance_id: '',
    status: 'PRESENT',
    check_in_time: '',
    check_out_time: '',
    late_minutes: 0,
  });

  useEffect(() => {
    if (attendance && open) {
      const formatForInput = (isoString: string | null): string => {
        if (!isoString) return '';
        const date = new Date(isoString);
        // Get local time components
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        employee_attendance_id: attendance.employee_attendance_id || '',
        status: attendance.status,
        check_in_time: formatForInput(attendance.check_in_time),
        check_out_time: formatForInput(attendance.check_out_time),
        late_minutes: attendance.late_minutes || 0,
      });
      setError('');
      setFieldErrors({});
    }
  }, [attendance, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Convert datetime-local format back to ISO string
      const formatToISO = (localString: string): string | undefined => {
        if (!localString) return undefined;
        return new Date(localString).toISOString();
      };

      const payload: UpdateAttendanceRequest = {
        employee_attendance_id: formData.employee_attendance_id,
        status: formData.status,
      };

      // Add optional fields only if they have values
      if (formData.check_in_time) {
        payload.check_in_time = formatToISO(formData.check_in_time);
      }
      if (formData.check_out_time) {
        payload.check_out_time = formatToISO(formData.check_out_time);
      }
      if (formData.late_minutes && formData.late_minutes > 0) {
        payload.late_minutes = formData.late_minutes;
      }

      const response = await attendanceSummaryApi.updateAttendance(payload);

      if (response.statusCode === 200) {
        onSuccess();
        onOpenChange(false);
      }
    } catch (err: any) {
      setFieldErrors({});
      
      // Handle validation errors with field-specific details (422)
      const validationErrorsArray = err.response?.data?.errors?.validationErrors;
      
      if (validationErrorsArray && Array.isArray(validationErrorsArray)) {
        // Map field-specific errors
        const newFieldErrors: Record<string, string> = {};
        validationErrorsArray.forEach((error: { field: string; messages: string[] }) => {
          newFieldErrors[error.field] = error.messages.join(', ');
        });
        setFieldErrors(newFieldErrors);
        setError('Please fix the validation errors in the form');
      } else if (err.response?.status === 400) {
        // Handle 400 bad request
        const message = err.response?.data?.message || err.response?.data?.errors?.message || 'Bad request';
        setError(message);
      } else {
        // Try standard validation error format
        const validationErrors = getValidationErrors(err);
        if (validationErrors) {
          const errorMessages = Object.values(validationErrors).flat().join(', ');
          setError(errorMessages);
        } else {
          setError(getErrorMessage(err, 'Failed to update attendance'));
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              Update attendance record for <span className="font-semibold">{employeeName}</span>
              {attendance && (
                <span className="block mt-1">
                  Date: {new Date(attendance.attendance_date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 flex items-start gap-2 my-4">
              <span className="text-sm text-red-600 dark:text-red-400">{error}</span>
            </div>
          )}
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">
                Status <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  setFormData({ ...formData, status: value as UpdateAttendanceRequest['status'] })
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PRESENT">Present (Hadir)</SelectItem>
                  <SelectItem value="ABSENT">Absent</SelectItem>
                  <SelectItem value="LEAVE">Leave (Izin)</SelectItem>
                  <SelectItem value="SICK">Sick (Sakit)</SelectItem>
                </SelectContent>
              </Select>
              {fieldErrors.status && (
                <span className="text-sm text-red-600">{fieldErrors.status}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="check_in_time">Check In Time</Label>
              <Input
                id="check_in_time"
                type="datetime-local"
                value={formData.check_in_time}
                onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
              />
              {fieldErrors.check_in_time && (
                <span className="text-sm text-red-600">{fieldErrors.check_in_time}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="check_out_time">Check Out Time</Label>
              <Input
                id="check_out_time"
                type="datetime-local"
                value={formData.check_out_time}
                onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
              />
              {fieldErrors.check_out_time && (
                <span className="text-sm text-red-600">{fieldErrors.check_out_time}</span>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="late_minutes">Late Minutes</Label>
              <Input
                id="late_minutes"
                type="number"
                min="0"
                step="1"
                value={formData.late_minutes}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '' || /^\d+$/.test(value)) {
                    setFormData({ ...formData, late_minutes: parseInt(value) || 0 });
                  }
                }}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              {fieldErrors.late_minutes && (
                <span className="text-sm text-red-600">{fieldErrors.late_minutes}</span>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
