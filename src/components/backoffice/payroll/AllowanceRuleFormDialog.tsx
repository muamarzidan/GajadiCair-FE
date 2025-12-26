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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
    } catch (err) {
      setError(getErrorMessage(err));
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
            {rule ? 'Edit Tunjangan' : 'Tambah Tunjangan'}
          </DialogTitle>
          <DialogDescription>
            {rule
              ? 'Ubah detail tunjangan di bawah ini'
              : 'Isi detail tunjangan baru di bawah ini'}
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
              <Label htmlFor="name">Nama Tunjangan</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Contoh: Tunjangan Transport"
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipe</Label>
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
                  <SelectItem value="percentage">Persentase (%)</SelectItem>
                  <SelectItem value="fixed_amount">
                    Nominal Tetap (Rp)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {allowanceType === 'percentage' ? (
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
                  placeholder="Contoh: 500000"
                  required
                  disabled={isLoading}
                />
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
