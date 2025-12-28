import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Download } from 'lucide-react';
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
import type { PayrollLogDetail, PayrollDetailType } from '@/types/employeePayroll';
import formatCurrency from '@/utils/formatCurrency';
import formatDate from '@/utils/formatDate';
import { getErrorMessage } from '@/utils';

const payrollTypeLabels: Record<PayrollDetailType, string> = {
  BASE_SALARY: 'Gaji Pokok',
  ALLOWANCE: 'Tunjangan',
  DEDUCTION: 'Potongan',
};

const payrollTypeColors: Record<PayrollDetailType, string> = {
  BASE_SALARY: 'text-blue-600',
  ALLOWANCE: 'text-green-600',
  DEDUCTION: 'text-red-600',
};

export default function EmployeePayrollDetailPage() {
  const { payrollLogId } = useParams<{ payrollLogId: string }>();
  const navigate = useNavigate();
  const [payrollDetail, setPayrollDetail] = useState<PayrollLogDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchPayrollDetail = async () => {
    if (!payrollLogId) {
      setError('Payroll ID tidak ditemukan');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      const response = await employeePayrollApi.getHistoryById(payrollLogId);
      setPayrollDetail(response.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayrollDetail();
  }, [payrollLogId]);

  const getTotalByType = (type: PayrollDetailType) => {
    if (!payrollDetail) return 0;
    return payrollDetail.payroll_details
      .filter((detail) => detail.type === type)
      .reduce((sum, detail) => sum + detail.amount, 0);
  };

  const getDetailsByType = (type: PayrollDetailType) => {
    if (!payrollDetail) return [];
    return payrollDetail.payroll_details.filter((detail) => detail.type === type);
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
                  <BreadcrumbLink href="/my-payroll">My Payroll</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Detail Pembayaran</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/my-payroll/history')}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Detail Pembayaran</h1>
                <p className="text-muted-foreground mt-1">
                  Rincian pembayaran gaji
                </p>
              </div>
            </div>
            {payrollDetail?.pdf_uri && (
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
            )}
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
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : payrollDetail ? (
            <>
              {/* Summary Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Informasi Pembayaran</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Nama Karyawan</p>
                      <p className="text-lg font-semibold">
                        {payrollDetail.employee.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="text-lg">{payrollDetail.employee.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Tanggal Pembayaran
                      </p>
                      <p className="text-lg font-semibold">
                        {formatDate(payrollDetail.payroll_date)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Total Pembayaran
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(payrollDetail.amount)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Gaji Pokok</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">
                      {formatCurrency(getTotalByType('BASE_SALARY'))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Tunjangan</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      +{formatCurrency(getTotalByType('ALLOWANCE'))}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Total Deductions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">
                      -{formatCurrency(getTotalByType('DEDUCTION'))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              {/* Details Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Details</CardTitle>
                  <CardDescription>
                    Details of the salary components received
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Description</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {payrollDetail.payroll_details.map((detail) => (
                          <TableRow key={detail.payroll_detail_id}>
                            <TableCell className="font-medium">
                              {detail.description}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {payrollTypeLabels[detail.type]}
                              </Badge>
                            </TableCell>
                            <TableCell
                              className={`text-right font-semibold ${payrollTypeColors[detail.type]}`}
                            >
                              {detail.type === 'DEDUCTION' ? '-' : ''}
                              {formatCurrency(detail.amount)}
                            </TableCell>
                          </TableRow>
                        ))}
                        <TableRow className="border-t-2">
                          <TableCell colSpan={2} className="font-bold text-lg">
                            Total
                          </TableCell>
                          <TableCell className="text-right font-bold text-xl text-blue-600">
                            {formatCurrency(payrollDetail.amount)}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Breakdown by Type */}
              <div className="grid gap-4 md:grid-cols-2">
                {/* Allowances */}
                {getDetailsByType('ALLOWANCE').length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detail Tunjangan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getDetailsByType('ALLOWANCE').map((detail) => (
                          <div
                            key={detail.payroll_detail_id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">{detail.description}</span>
                            <span className="font-semibold text-green-600">
                              +{formatCurrency(detail.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Deductions */}
                {getDetailsByType('DEDUCTION').length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Detail Potongan</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {getDetailsByType('DEDUCTION').map((detail) => (
                          <div
                            key={detail.payroll_detail_id}
                            className="flex justify-between items-center"
                          >
                            <span className="text-sm">{detail.description}</span>
                            <span className="font-semibold text-red-600">
                              -{formatCurrency(detail.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Data pembayaran tidak ditemukan
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
