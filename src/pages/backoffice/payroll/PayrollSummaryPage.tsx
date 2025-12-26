import { useState, useEffect } from 'react';
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { payrollSummaryApi } from '@/services/payroll';
import type { PayrollSummaryEmployee } from '@/types/payroll';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { getErrorMessage } from '@/utils';

export default function PayrollSummaryPage() {
  const [employees, setEmployees] = useState<PayrollSummaryEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await payrollSummaryApi.getSummary();
      setEmployees(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const getTotalAllowances = () => {
    return employees.reduce((sum, emp) => sum + emp.allowance.total, 0);
  };

  const getTotalDeductions = () => {
    return employees.reduce((sum, emp) => sum + emp.deduction.total, 0);
  };

  const getTotalTakeHomePay = () => {
    return employees.reduce((sum, emp) => sum + emp.take_home_pay, 0);
  };

  const getTotalBaseSalary = () => {
    return employees.reduce((sum, emp) => sum + emp.base_salary, 0);
  };

  const formatPeriod = (employee: PayrollSummaryEmployee) => {
    const start = formatDate(employee.period.start);
    const end = formatDate(employee.period.end);
    return `${start} - ${end}`;
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
                  <BreadcrumbPage>Overview Payroll</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Overview Payroll</h1>
          <p className="text-muted-foreground mt-1">
            Summary of employee salary calculations for the current period
          </p>
        </div>
      </div>
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}
      {/* Summary Cards */}
      {!isLoading && employees.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Base Salary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(getTotalBaseSalary())}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Allowances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{formatCurrency(getTotalAllowances())}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Deductions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{formatCurrency(getTotalDeductions())}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Take Home Pay</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(getTotalTakeHomePay())}
              </div>
            </CardContent>
          </Card>
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
          ) : employees.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                No employee payroll data available
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead className="text-right">Base Salary</TableHead>
                    <TableHead className="text-center">Attendance</TableHead>
                    <TableHead className="text-right">Allowances</TableHead>
                    <TableHead className="text-right">Deductions</TableHead>
                    <TableHead className="text-right">Take Home Pay</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.map((employee) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell className="font-medium">
                        {employee.name}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatPeriod(employee)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(employee.base_salary)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col text-xs">
                          {employee.attendance.absent_days > 0 && (
                            <span className="text-red-600">
                              {employee.attendance.absent_days} days absent
                            </span>
                          )}
                          {employee.attendance.late_minutes > 0 && (
                            <span className="text-orange-600">
                              {employee.attendance.late_minutes} minutes late
                            </span>
                          )}
                          {employee.attendance.absent_days === 0 &&
                            employee.attendance.late_minutes === 0 && (
                              <span className="text-green-600">Perfect</span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {employee.allowance.total > 0 ? (
                          <div>
                            <div className="font-medium text-green-600">
                              +{formatCurrency(employee.allowance.total)}
                            </div>
                            {employee.allowance.details.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {employee.allowance.details.map((detail, idx) => (
                                  <div key={idx}>
                                    {detail.name}: {formatCurrency(detail.amount)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {employee.deduction.total > 0 ? (
                          <div>
                            <div className="font-medium text-red-600">
                              -{formatCurrency(employee.deduction.total)}
                            </div>
                            {employee.deduction.details.length > 0 && (
                              <div className="text-xs text-muted-foreground mt-1">
                                {employee.deduction.details.map((detail, idx) => (
                                  <div key={idx}>
                                    {detail.name}: {formatCurrency(detail.amount)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="font-bold text-blue-600">
                          {formatCurrency(employee.take_home_pay)}
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
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};