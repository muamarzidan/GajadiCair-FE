import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, Eye } from 'lucide-react';
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
  CardDescription,
  CardHeader,
  CardTitle,
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
import { employeePayrollApi } from '@/services/employeePayroll';
import type { EmployeePayrollSummary, PayrollLog } from '@/types/employeePayroll';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { getErrorMessage } from '@/utils';

export default function EmployeePayrollPage() {
  const navigate = useNavigate();
  const [summary, setSummary] = useState<EmployeePayrollSummary | null>(null);
  const [history, setHistory] = useState<PayrollLog[]>([]);
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorSummary, setErrorSummary] = useState<string>('');
  const [errorHistory, setErrorHistory] = useState<string>('');

  const fetchSummary = async () => {
    try {
      setIsLoadingSummary(true);
      setErrorSummary('');
      const response = await employeePayrollApi.getSummary();
      setSummary(response.data);
    } catch (err) {
      setErrorSummary(getErrorMessage(err));
    } finally {
      setIsLoadingSummary(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setIsLoadingHistory(true);
      setErrorHistory('');
      const response = await employeePayrollApi.getHistory();
      setHistory(response.data || []);
    } catch (err) {
      setErrorHistory(getErrorMessage(err));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    fetchHistory();
  }, []);

  const formatPeriod = (period: { start: string; end: string }) => {
    const start = formatDate(period.start);
    const end = formatDate(period.end);
    return `${start} - ${end}`;
  };

  const handleViewDetail = (payrollLogId: string) => {
    navigate(`/my-payroll/detail/${payrollLogId}`);
  };

  const getTotalBaseSalaryFromHistory = () => {
    return history.reduce((sum, log) => sum + log.amount, 0);
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
                  <BreadcrumbPage>My Payroll</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">My Payroll</h1>
              <p className="text-muted-foreground mt-1">
                Lihat ringkasan dan riwayat gaji Anda
              </p>
            </div>
          </div>

          {/* Summary Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Ringkasan Periode Saat Ini</h2>

            {errorSummary && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errorSummary}
              </div>
            )}

            {isLoadingSummary ? (
              <div className="space-y-3">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </div>
            ) : summary ? (
              <>
                {/* Period Info */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Periode</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {formatPeriod(summary.period)}
                    </p>
                  </CardContent>
                </Card>

                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Gaji Pokok</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {formatCurrency(summary.base_salary)}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardDescription>Total Tunjangan</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">
                        +{formatCurrency(summary.allowance.total)}
                      </div>
                      {summary.allowance.details.length > 0 && (
                        <div className="mt-2 space-y-1">
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
                      <CardDescription>Total Deduction</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">
                        -{formatCurrency(summary.deduction.total)}
                      </div>
                      {summary.deduction.details.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {summary.deduction.details.map((detail, idx) => (
                            <div key={idx} className="text-xs text-muted-foreground">
                              • {detail.name}: {formatCurrency(detail.amount)}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-2 border-primary">
                    <CardHeader className="pb-2">
                      <CardDescription>Take Home Pay</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className={`text-2xl font-bold ${summary.take_home_pay < 0 ? 'text-red-600' : 'text-blue-600'}`}>
                        {formatCurrency(summary.take_home_pay)}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Attendance Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Informasi Kehadiran</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Hari Tidak Hadir</p>
                        <p className="text-2xl font-bold text-red-600">
                          {summary.attendance.absent_days} hari
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Total Keterlambatan</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {summary.attendance.late_minutes} menit
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : null}
          </div>

          {/* History Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Riwayat Gaji</h2>

            {errorHistory && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {errorHistory}
              </div>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Daftar Riwayat Pembayaran</CardTitle>
                <CardDescription>
                  Riwayat pembayaran gaji yang telah diterima
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingHistory ? (
                  <div className="space-y-3">
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                    <Skeleton className="h-12 w-full" />
                  </div>
                ) : history.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">
                      Belum ada riwayat pembayaran gaji
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Tanggal Pembayaran</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {history.map((log) => (
                            <TableRow key={log.payroll_log_id}>
                              <TableCell>
                                {formatDate(log.payroll_date)}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(log.amount)}
                              </TableCell>
                              <TableCell>
                                <Badge variant="default">Dibayar</Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      handleViewDetail(log.payroll_log_id)
                                    }
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Detail
                                  </Button>
                                  {log.pdf_uri && (
                                    <Button variant="ghost" size="sm">
                                      <Download className="h-4 w-4 mr-1" />
                                      PDF
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>

                    <div className="mt-4 text-sm text-muted-foreground">
                      Total {history.length} pembayaran •{' '}
                      {formatCurrency(getTotalBaseSalaryFromHistory())}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
