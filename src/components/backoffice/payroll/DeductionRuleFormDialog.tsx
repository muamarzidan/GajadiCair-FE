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
import { Checkbox } from '@/components/ui/checkbox';
import { deductionRulesApi } from '@/services/payroll';
import type {
  PayrollDeductionRule,
  CreateDeductionRuleRequest,
  PayrollDeductionType,
} from '@/types/payroll';
import { getErrorMessage } from '@/utils';

interface DeductionRuleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  rule?: PayrollDeductionRule;
}

type DeductionAmountType = 'percentage' | 'fixed_amount';

const deductionTypeLabels: Record<PayrollDeductionType, string> = {
  LATE: 'Terlambat',
  ABSENT: 'Tidak Hadir',
  LEAVE: 'Cuti',
  SICK: 'Sakit',
};

export function DeductionRuleFormDialog({
  open,
  onOpenChange,
  onSuccess,
  rule,
}: DeductionRuleFormDialogProps) {
  const [name, setName] = useState(rule?.name || '');
  const [type, setType] = useState<PayrollDeductionType>(rule?.type || 'LATE');
  const [amountType, setAmountType] = useState<DeductionAmountType>(
    rule?.percentage ? 'percentage' : 'fixed_amount'
  );
  const [percentage, setPercentage] = useState(
    rule?.percentage?.toString() || ''
  );
  const [fixedAmount, setFixedAmount] = useState(
    rule?.fixed_amount?.toString() || ''
  );
  const [perMinute, setPerMinute] = useState(rule?.per_minute || false);
  const [maxMinutes, setMaxMinutes] = useState(
    rule?.max_minutes?.toString() || ''
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
      const payload: CreateDeductionRuleRequest = {
        name: name.trim(),
        type,
      };

      if (amountType === 'percentage') {
        payload.percentage = parseFloat(percentage);
      } else {
        payload.fixed_amount = parseFloat(fixedAmount);
      }

      if (type === 'LATE' && perMinute) {
        payload.per_minute = true;
        if (maxMinutes) {
          payload.max_minutes = parseInt(maxMinutes);
        }
      }

      if (rule) {
        await deductionRulesApi.update(rule.payroll_deduction_rule_id, {
          ...payload,
          is_active: isActive,
        });
      } else {
        await deductionRulesApi.create(payload);
      }

      onSuccess();
      onOpenChange(false);
      resetForm();
    } catch (err: any) {
      console.error('Failed to save deduction rule:', err);
      
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
    setType('LATE');
    setAmountType('fixed_amount');
    setPercentage('');
    setFixedAmount('');
    setPerMinute(false);
    setMaxMinutes('');
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
            {rule ? 'Edit Deduction Rule' : 'Add New Deduction Rule'}
          </DialogTitle>
          <DialogDescription>
            {rule
              ? 'Update deduction rule information.'
              : 'Fill in the new deduction rule details below.'}
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
                Deduction Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Example: Late Arrival"
                required
                disabled={isLoading}
              />
              {fieldErrors.name && (
                <p className="text-sm text-red-500">{fieldErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="deduction-type">
                Deduction Type <span className="text-red-500">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(value: PayrollDeductionType) => setType(value)}
                disabled={isLoading}
              >
                <SelectTrigger id="deduction-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(deductionTypeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldErrors.type && (
                <p className="text-sm text-red-500">{fieldErrors.type}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-type">Calculation Type</Label>
              <Select
                value={amountType}
                onValueChange={(value: DeductionAmountType) =>
                  setAmountType(value)
                }
                disabled={isLoading}
              >
                <SelectTrigger id="amount-type">
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
            {amountType === 'percentage' ? (
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
                  placeholder="Contoh: 5000"
                  required
                  disabled={isLoading}
                />
                {fieldErrors.fixed_amount && (
                  <p className="text-sm text-red-500">{fieldErrors.fixed_amount}</p>
                )}
              </div>
            )}
            {type === 'LATE' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="perMinute"
                    checked={perMinute}
                    onCheckedChange={(checked) =>
                      setPerMinute(checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <Label
                    htmlFor="perMinute"
                    className="text-sm font-normal cursor-pointer"
                  >
                    Deduction per minute of lateness
                  </Label>
                </div>
                {perMinute && (
                  <div className="space-y-2">
                    <Label htmlFor="maxMinutes">
                      Maximum Minutes
                    </Label>
                    <Input
                      id="maxMinutes"
                      type="number"
                      min="0"
                      step="1"
                      value={maxMinutes}
                      onChange={(e) => setMaxMinutes(e.target.value)}
                      placeholder="Contoh: 120"
                      disabled={isLoading}
                    />
                    {fieldErrors.max_minutes && (
                      <p className="text-sm text-red-500">{fieldErrors.max_minutes}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Leave empty if there is no maximum limit
                    </p>
                  </div>
                )}
              </>
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
}
