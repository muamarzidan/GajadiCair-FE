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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    } catch (err) {
      setError(getErrorMessage(err));
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
            {rule ? 'Edit Potongan' : 'Tambah Potongan'}
          </DialogTitle>
          <DialogDescription>
            {rule
              ? 'Ubah detail potongan di bawah ini'
              : 'Isi detail potongan baru di bawah ini'}
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
              <Label htmlFor="name">Nama Potongan</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Telat per menit"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="deduction-type">Tipe Potongan</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount-type">Tipe Perhitungan</Label>
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
                  <SelectItem value="percentage">Persentase (%)</SelectItem>
                  <SelectItem value="fixed_amount">
                    Nominal Tetap (Rp)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {amountType === 'percentage' ? (
              <div className="space-y-2">
                <Label htmlFor="percentage">Persentase (%)</Label>
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
              </div>
            ) : (
              <div className="space-y-2">
                <Label htmlFor="fixedAmount">Nominal (Rp)</Label>
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
                    Potongan per menit keterlambatan
                  </Label>
                </div>

                {perMinute && (
                  <div className="space-y-2">
                    <Label htmlFor="maxMinutes">
                      Maksimal Menit (Opsional)
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
                    <p className="text-xs text-muted-foreground">
                      Kosongkan jika tidak ada batas maksimal
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
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Tidak Aktif</SelectItem>
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
              {isLoading ? 'Menyimpan...' : rule ? 'Simpan' : 'Tambah'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
