import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { AppSidebar } from '@/components/app-sidebar';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { DeductionRuleFormDialog } from '@/components/backoffice/payroll/DeductionRuleFormDialog';
import { DeleteDeductionRuleDialog } from '@/components/backoffice/payroll/DeleteDeductionRuleDialog';
import { deductionRulesApi } from '@/services/payroll';
import type { PayrollDeductionRule, PayrollDeductionType } from '@/types/payroll';
import formatCurrency from '@/utils/formatCurrency';
import { getErrorMessage } from '@/utils';

const deductionTypeLabels: Record<PayrollDeductionType, string> = {
  LATE: 'Terlambat',
  ABSENT: 'Tidak Hadir',
  LEAVE: 'Cuti',
  SICK: 'Sakit',
};

export default function DeductionRulesPage() {
  const [rules, setRules] = useState<PayrollDeductionRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<
    PayrollDeductionRule | undefined
  >(undefined);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [ruleToDelete, setRuleToDelete] = useState<
    PayrollDeductionRule | undefined
  >(undefined);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRules = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await deductionRulesApi.getAll();
      setRules(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleAdd = () => {
    setSelectedRule(undefined);
    setIsFormOpen(true);
  };

  const handleEdit = (rule: PayrollDeductionRule) => {
    setSelectedRule(rule);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (rule: PayrollDeductionRule) => {
    setRuleToDelete(rule);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!ruleToDelete) return;

    try {
      setIsDeleting(true);
      await deductionRulesApi.delete(ruleToDelete.payroll_deduction_rule_id);
      await fetchRules();
      setIsDeleteOpen(false);
      setRuleToDelete(undefined);
    } catch (err) {
      alert(getErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const formatAmount = (rule: PayrollDeductionRule) => {
    if (rule.percentage) {
      return `${rule.percentage}%`;
    }
    if (rule.fixed_amount) {
      if (rule.per_minute) {
        return `${formatCurrency(rule.fixed_amount)}/menit`;
      }
      return formatCurrency(rule.fixed_amount);
    }
    return '-';
  };

  const formatDetails = (rule: PayrollDeductionRule) => {
    const details: string[] = [];
    if (rule.per_minute) {
      details.push('Per menit');
    }
    if (rule.max_minutes) {
      details.push(`Max: ${rule.max_minutes} menit`);
    }
    return details.length > 0 ? details.join(', ') : '-';
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Aturan Potongan</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Deduction Rules</h1>
          <p className="text-muted-foreground mt-1">
            Manage deduction rules for employee salary calculations
          </p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add Deduction Rule
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {/* Table Card */}
      <Card className="!shadow-none">
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                No deduction rules available
              </p>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Calculation</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rules.map((rule) => (
                    <TableRow key={rule.payroll_deduction_rule_id}>
                      <TableCell className="font-medium">
                        {rule.name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {deductionTypeLabels[rule.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {rule.percentage ? 'Persentase' : 'Nominal Tetap'}
                      </TableCell>
                      <TableCell>{formatAmount(rule)}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDetails(rule)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={rule.is_active ? 'default' : 'secondary'}
                        >
                          {rule.is_active ? 'Aktif' : 'Tidak Aktif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(rule)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(rule)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {/* Dialogs */}
      <DeductionRuleFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSuccess={fetchRules}
        rule={selectedRule}
      />
      <DeleteDeductionRuleDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        onConfirm={handleDeleteConfirm}
        ruleName={ruleToDelete?.name || ''}
        isLoading={isDeleting}
      />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};