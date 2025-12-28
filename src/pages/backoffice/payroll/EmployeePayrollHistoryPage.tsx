import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { employeePayrollApi } from "@/services/employeePayroll";
import type { PayrollLog } from "@/types/employeePayroll";
import formatCurrency from "@/utils/formatCurrency";
import formatDate from "@/utils/formatDate";
import { getErrorMessage } from "@/utils";
import { Eye, Download } from "lucide-react";

export default function EmployeePayrollHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PayrollLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await employeePayrollApi.getHistory();
      setHistory(response.data || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleViewDetail = (payrollLogId: string) => {
    navigate(`/my-payroll/detail/${payrollLogId}`);
  };

  const handleDownloadPDF = (pdfUri: string | null) => {
    if (pdfUri) {
      window.open(pdfUri, "_blank");
    }
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
                  <BreadcrumbPage>Payroll History</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Payroll History</h1>
            <p className="text-muted-foreground mt-1">
              List of your payroll payment history
            </p>
          </div>
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
              {error}
            </div>
          )}
          {/* History Table */}
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : history.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date payment</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((log) => (
                    <TableRow
                      key={log.payroll_log_id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewDetail(log.payroll_log_id)}
                    >
                      <TableCell className="font-medium">
                        {formatDate(log.payroll_date)}
                      </TableCell>
                      <TableCell>{log.employee.name}</TableCell>
                      <TableCell>{log.employee.email}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatCurrency(log.amount)}
                      </TableCell>
                      <TableCell
                        className="text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-2 justify-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetail(log.payroll_log_id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            Detail
                          </Button>
                          {log.pdf_uri && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDownloadPDF(log.pdf_uri)}
                            >
                              <Download className="mr-2 h-4 w-4" />
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
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Belum ada riwayat pembayaran
              </p>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};