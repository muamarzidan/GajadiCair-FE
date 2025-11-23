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
import { Checkbox } from '@/components/ui/checkbox';
import { employeeApi, type Employee, type CreateEmployeeRequest, type UpdateEmployeeRequest } from '@/services/employee';

interface EmployeeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee: Employee | null;
  onSuccess: () => void;
}

export const EmployeeFormDialog = ({
  open,
  onOpenChange,
  employee,
  onSuccess,
}: EmployeeFormDialogProps) => {
  const isEdit = !!employee;

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    base_salary: '',
    bank_id: '',
    bank_account_number: '',
    tax_identification_number: '',
    is_active: true,
    dont_send_email: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when dialog opens/closes or employee changes
  useEffect(() => {
    if (open) {
      if (employee) {
        // Edit mode - populate form
        setFormData({
          name: employee.name || '',
          email: employee.email || '',
          password: '',
          base_salary: employee.base_salary.toString() || '',
          bank_id: employee.bank_id || '',
          bank_account_number: employee.bank_account_number || '',
          tax_identification_number: employee.tax_identification_number || '',
          is_active: employee.is_active,
          dont_send_email: false,
        });
      } else {
        // Add mode - reset form
        setFormData({
          name: '',
          email: '',
          password: '',
          base_salary: '',
          bank_id: '',
          bank_account_number: '',
          tax_identification_number: '',
          is_active: true,
          dont_send_email: false,
        });
      }
      setErrors({});
    }
  }, [open, employee]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!isEdit && !formData.password.trim()) {
      newErrors.password = 'Password is required for new employees';
    }

    if (!formData.base_salary) {
      newErrors.base_salary = 'Base salary is required';
    } else if (isNaN(Number(formData.base_salary)) || Number(formData.base_salary) <= 0) {
      newErrors.base_salary = 'Base salary must be a positive number';
    }

    if (!formData.bank_id.trim()) {
      newErrors.bank_id = 'Bank ID is required';
    }

    if (!formData.bank_account_number.trim()) {
      newErrors.bank_account_number = 'Bank account number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      if (isEdit && employee) {
        // Update employee
        const updateData: UpdateEmployeeRequest = {
          name: formData.name,
          email: formData.email,
          base_salary: Number(formData.base_salary),
          bank_id: formData.bank_id,
          bank_account_number: formData.bank_account_number,
          tax_identification_number: formData.tax_identification_number || undefined,
          is_active: formData.is_active,
        };

        // Only include password if provided
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        const response = await employeeApi.update(employee.employee_id, updateData);

        if (response.statusCode === 200) {
          onSuccess();
          onOpenChange(false);
        }
      } else {
        // Create employee
        const createData: CreateEmployeeRequest = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          base_salary: Number(formData.base_salary),
          bank_id: formData.bank_id,
          bank_account_number: formData.bank_account_number,
          tax_identification_number: formData.tax_identification_number || undefined,
          send_to_email: !formData.dont_send_email, // Invert checkbox value
        };

        const response = await employeeApi.create(createData);

        if (response.statusCode === 201) {
          onSuccess();
          onOpenChange(false);
        }
      }
    } catch (error: any) {
      console.error('❌ Failed to save employee:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save employee';
      setErrors({ submit: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Employee' : 'Add New Employee'}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? 'Update employee information. Leave password empty to keep current password.'
              : 'Fill in the details to create a new employee account.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
            />
            {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">
              Password {!isEdit && <span className="text-red-500">*</span>}
              {isEdit && <span className="text-sm text-muted-foreground">(Leave empty to keep current)</span>}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={isEdit ? 'Enter new password to change' : 'Create a secure password'}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              disabled={isLoading}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Base Salary */}
          <div className="space-y-2">
            <Label htmlFor="base_salary">
              Base Salary (IDR) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="base_salary"
              type="number"
              placeholder="5000000"
              value={formData.base_salary}
              onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
              disabled={isLoading}
            />
            {errors.base_salary && <p className="text-sm text-red-500">{errors.base_salary}</p>}
          </div>

          {/* Bank ID */}
          <div className="space-y-2">
            <Label htmlFor="bank_id">
              Bank ID <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bank_id"
              placeholder="bank-code"
              value={formData.bank_id}
              onChange={(e) => setFormData({ ...formData, bank_id: e.target.value })}
              disabled={isLoading}
            />
            {errors.bank_id && <p className="text-sm text-red-500">{errors.bank_id}</p>}
          </div>

          {/* Bank Account Number */}
          <div className="space-y-2">
            <Label htmlFor="bank_account_number">
              Bank Account Number <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bank_account_number"
              placeholder="1234567890"
              value={formData.bank_account_number}
              onChange={(e) => setFormData({ ...formData, bank_account_number: e.target.value })}
              disabled={isLoading}
            />
            {errors.bank_account_number && (
              <p className="text-sm text-red-500">{errors.bank_account_number}</p>
            )}
          </div>

          {/* Tax ID (NPWP) - Optional */}
          <div className="space-y-2">
            <Label htmlFor="tax_id">
              Tax Identification Number (NPWP) <span className="text-sm text-muted-foreground">(Optional)</span>
            </Label>
            <Input
              id="tax_id"
              placeholder="123456789012345"
              value={formData.tax_identification_number}
              onChange={(e) =>
                setFormData({ ...formData, tax_identification_number: e.target.value })
              }
              disabled={isLoading}
            />
          </div>

          {/* Is Active - Only for Edit */}
          {isEdit && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, is_active: checked })
                }
                disabled={isLoading}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active Employee
              </Label>
            </div>
          )}

          {/* Don't Send Email - Only for Create */}
          {!isEdit && (
            <div className="flex items-center space-x-2">
              <Checkbox
                id="dont_send_email"
                checked={formData.dont_send_email}
                onCheckedChange={(checked: boolean) =>
                  setFormData({ ...formData, dont_send_email: checked })
                }
                disabled={isLoading}
              />
              <Label htmlFor="dont_send_email" className="cursor-pointer">
                Don't send welcome email
              </Label>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
              {errors.submit}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? 'Update Employee' : 'Create Employee'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};