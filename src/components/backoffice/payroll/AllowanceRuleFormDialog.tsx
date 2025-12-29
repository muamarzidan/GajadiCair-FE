import { useState } from 'react';
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
import { allowanceRulesApi } from '@/services/payroll';
import type {
  PayrollAllowanceRule,
  CreateAllowanceRuleRequest,
} from '@/types/payroll';
import { getErrorMessage } from '@/utils';

interface AllowanceRuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  rule?: PayrollAllowanceRule;
}

type AllowanceType = 'percentage' | 'fixed_amount';

export function AllowanceRuleFormDialog({
  open,
  onOpenChange,
  onSuccess,
  rule,
}: AllowanceRuleFormDialogProps) {
  const [name, setName] = useState(rule?.name || '');
  const [allowanceType, setAllowanceType] = useState<AllowanceType>(
    rule?.percentage ? 'percentage' : 'fixed_amount'
  );
  const [percentage, setPercentage] = useState(
    rule?.percentage?.toString() || ''
  );
  const [fixedAmount, setFixedAmount] = useState(
    rule?.fixed_amount?.toString() || ''
  );
  const [isActive, setIsActive] = useState(rule?.is_active ?? true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      const payload: CreateAllowanceRuleRequest = {
        name: name.trim(),
      };

      if (allowanceType === 'percentage') {
        payload.percentage = parseFloat(percentage);
      } else {
        payload.fixed_amount = parseFloat(fixedAmount);
      }

      if (rule) {
        await allowanceRulesApi.update(rule.payroll_allowance_rule_id, {
          ...payload,
          is_active: isActive,
        });
      } else {
        await allowanceRulesApi.create(payload);
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to save allowance rule:', err);
      
      const newFieldErrors: Record<string, string> = {};
      
      // Check if it's a validation error with detailed field errors
      if (err.response?.data?.errors?.validationErrors) {
        const validationErrors = err.response.data.errors.validationErrors;
        
        validationErrors.forEach((error: { field: string; messages: string[] }) => {
          newFieldErrors[error.field] = error.messages.join(', ');
        });
        
        setFieldErrors(newFieldErrors);
        setError('Please fix the validation errors in the form');
      } 
      // Check if it's a regular error with a message
      else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } 
      // Fallback to generic error
      else {
        setError(getErrorMessage(err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setAllowanceType('fixed_amount');
    setPercentage('');
    setFixedAmount('');
    setIsActive(true);
    setError('');
    setFieldErrors({});
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetForm();
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {rule ? 'Edit Allowance' : 'Add New Allowance'}
          </DialogTitle>
          <DialogDescription>
            {rule
              ? 'Update allowance details below'
              : 'Fill in new allowance details below'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="name">
                Allowance Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Transport Allowance"
                required
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-500">{fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={allowanceType}
                onValueChange={(value: AllowanceType) =>
                  setAllowanceType(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Percentage (%)</SelectItem>
                  <SelectItem value="fixed_amount">
                    Fixed Amount (Rp)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {allowanceType === 'percentage' ? (
              <div className="space-y-2">
                <Label htmlFor="percentage">
                  Percentage (%) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="percentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={percentage}
                  onChange={(e) => setPercentage(e.target.value)}
                  placeholder="Contoh: 10"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.percentage && (
                  <p className="text-sm text-red-500">{fieldErrors.percentage}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fixedAmount">
                  Fixed Amount (Rp) <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="fixedAmount"
                  type="number"
                  min="0"
                  step="1000"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(e.target.value)}
                  placeholder="e.g., 500000"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.fixed_amount && (
                  <p className="text-sm text-red-500">{fieldErrors.fixed_amount}</p>
                )}
              </div>
            )}
            {rule && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={isActive ? 'active' : 'inactive'}
                  onValueChange={(value) => setIsActive(value === 'active')}
                  disabled={isLoading}
                >
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : rule ? 'Save' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};