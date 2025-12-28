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
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { employeePayrollApi } from '@/services/employeePayroll';
import type { EmployeePayrollSummary } from '@/types/employeePayroll';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { getErrorMessage } from '@/utils';

export default function EmployeePayrollSummaryPage() {
  const [summary, setSummary] = useState<EmployeePayrollSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchSummary = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await employeePayrollApi.getSummary();
      setSummary(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const formatPeriod = (period: { start: string; end: string }) => {
    const start = formatDate(period.start);
    const end = formatDate(period.end);
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
                  <BreadcrumbPage>Payroll Summary</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Payroll Summary</h1>
            <p className="text-muted-foreground mt-1">
              Current period salary summary
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
              <Skeleton className="h-48 w-full" />
            </div>
          ) : summary ? (
            <div className="space-y-6">
              {/* Period Card */}
              <Card className="!shadow-none">
                <CardHeader>
                  <CardTitle>Payment Period</CardTitle>
                  <CardDescription>
                    Current salary calculation period
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-semibold">
                    {formatPeriod(summary.period)}
                  </p>
                </CardContent>
              </Card>

              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Base Salary</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(summary.base_salary)}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Allowance Total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      +{formatCurrency(summary.allowance.total)}
                    </div>
                    {summary.allowance.details.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {summary.allowance.details.map((detail, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            • {detail.name}: {formatCurrency(detail.amount)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Deduction Total</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      -{formatCurrency(summary.deduction.total)}
                    </div>
                    {summary.deduction.details.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {summary.deduction.details.map((detail, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground">
                            • {detail.name}: {formatCurrency(detail.amount)}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Take Home Pay</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div
                      className={`text-2xl font-bold ${
                        summary.take_home_pay < 0
                          ? 'text-red-600'
                          : 'text-blue-600'
                      }`}
                    >
                      {formatCurrency(summary.take_home_pay)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Attendance Card */}
              <Card className="!shadow-none">
                <CardHeader>
                  <CardTitle>Attendance Information</CardTitle>
                  <CardDescription>
                    Attendance data affecting salary calculation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Day of Absence
                      </p>
                      <p className="text-3xl font-bold text-red-600">
                        {summary.attendance.absent_days} days
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Delay Total 
                      </p>
                      <p className="text-3xl font-bold text-orange-600">
                        {summary.attendance.late_minutes} menit
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Breakdown Detail */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Allowance Details */}
                {summary.allowance.details.length > 0 && (
                  <Card className="!shadow-none">
                    <CardHeader>
                      <CardTitle>Allowance Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {summary.allowance.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <span className="font-medium">{detail.name}</span>
                            <span className="font-bold text-green-600">
                              +{formatCurrency(detail.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t-2">
                          <span className="font-bold">Allowance Total</span>
                          <span className="font-bold text-green-600 text-lg">
                            +{formatCurrency(summary.allowance.total)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                {/* Deduction Details */}
                {summary.deduction.details.length > 0 && (
                  <Card className="!shadow-none"> 
                    <CardHeader>
                      <CardTitle>Deduction Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {summary.deduction.details.map((detail, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center py-2 border-b last:border-0"
                          >
                            <span className="font-medium">{detail.name}</span>
                            <span className="font-bold text-red-600">
                              -{formatCurrency(detail.amount)}
                            </span>
                          </div>
                        ))}
                        <div className="flex justify-between items-center pt-2 border-t-2">
                          <span className="font-bold">Deduction Total</span>
                          <span className="font-bold text-red-600 text-lg">
                            -{formatCurrency(summary.deduction.total)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              {/* Calculation Summary */}
              <Card className="bg-muted/50 !shadow-none">
                <CardHeader>
                  <CardTitle>Salary Calculation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-lg">Base Salary</span>
                      <span className="text-lg font-semibold">
                        {formatCurrency(summary.base_salary)}
                      </span>
                    </div>
                    {summary.allowance.total > 0 && (
                      <div className="flex justify-between items-center text-green-600">
                        <span className="text-lg">+ Allowance Total</span>
                        <span className="text-lg font-semibold">
                          {formatCurrency(summary.allowance.total)}
                        </span>
                      </div>
                    )}
                    {summary.deduction.total > 0 && (
                      <div className="flex justify-between items-center text-red-600">
                        <span className="text-lg">- Total Deduction</span>
                        <span className="text-lg font-semibold">
                          {formatCurrency(summary.deduction.total)}
                        </span>
                      </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                      <span className="text-xl font-bold">Take Home Pay</span>
                      <span
                        className={`text-2xl font-bold ${
                          summary.take_home_pay < 0
                            ? 'text-red-600'
                            : 'text-blue-600'
                        }`}
                      >
                        {formatCurrency(summary.take_home_pay)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Data payroll belum tersedia
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
