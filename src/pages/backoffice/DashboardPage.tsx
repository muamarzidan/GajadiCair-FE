import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, Clock, Calendar, DollarSign, FileText, LogIn, LogOut, AlertCircle } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { companyDashboardApi, type CompanyDashboardData, type CompanyDashboardChartData } from '@/services/companyDashboard'
import { employeeDashboardApi } from '@/services/employeeDashboard'
import type { EmployeeDashboardData, EmployeeDashboardChartData, AttendanceStatus } from '@/types/dashboard-employee'
import { getErrorMessage } from '@/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import formatDate from '@/utils/formatDate'
import formatCurrency from '@/utils/formatCurrency'


export default function DashboardPage() {
  const { user } = useAuth();
  
  // Show company dashboard if user is company role
  if (user?.role === 'company') {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <CompanyDashboardContent user={user} />
        </SidebarInset>
      </SidebarProvider>
    );
  }
  // Show employee dashboard if user is employee role
  if (user?.role === 'employee') {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <EmployeeDashboardContent user={user} />
        </SidebarInset>
      </SidebarProvider>
    );
  }
  
  // Default dashboard for other roles
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardContent user={user || {}} />
      </SidebarInset>
    </SidebarProvider>
  );
};

function CompanyDashboardContent({ user }: { user: { name?: string } }) {
  const [dashboardData, setDashboardData] = useState<CompanyDashboardData | null>(null);
  const [chartData, setChartData] = useState<CompanyDashboardChartData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [error, setError] = useState('');
  
  // Date filter states
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    loadDashboardData();
    loadChartData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoadingDashboard(true);
      const response = await companyDashboardApi.getDashboardData();
      if (response.statusCode === 200) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadChartData = async () => {
    try {
      setIsLoadingChart(true);
      setError('');
      
      const response = await companyDashboardApi.getChartData(startDate, endDate);
      if (response.statusCode === 200) {
        setChartData(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load chart data'));
    } finally {
      setIsLoadingChart(false);
    }
  };

  const getLogTypeBadge = (logType: number) => {
    // 0 = CHECK_IN, 1 = CHECK_OUT
    return logType === 0 ? (
      <Badge variant="default" className="bg-green-500">Check In</Badge>
    ) : (
      <Badge variant="secondary">Check Out</Badge>
    );
  };

  // Transform chart data for recharts
  const chartDataFormatted = chartData?.labels.map((label, index) => ({
    period: label,
    PRESENT: chartData.series.PRESENT[index] || 0,
    LATE: chartData.series.LATE[index] || 0,
    ABSENT: chartData.series.ABSENT[index] || 0,
    LEAVE: chartData.series.LEAVE[index] || 0,
    SICK: chartData.series.SICK[index] || 0,
    total: chartData.series.total[index] || 0,
  })) || [];

  return (
    <>
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
                <BreadcrumbPage>Company Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Admin'}!</h1>
          <p className="text-muted-foreground mt-1">Here is a summary of today's company activities</p>
        </div>
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}
        {/* 4 Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {isLoadingDashboard ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : dashboardData ? (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dashboardData.total_employee}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Total karyawan terdaftar
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardData.employeePresentToday}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Karyawan hadir hari ini
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Not Checked In</CardTitle>
                  <UserX className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{dashboardData.employeeHasNotCheckInToday}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Belum check-in hari ini
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Not Checked Out</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.employeeHasNotCheckedOut}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Belum check-out hari ini
                  </p>
                </CardContent>
              </Card>
            </>
          ) : (
            <div className="col-span-4 text-center py-8 text-muted-foreground">
              No data available
            </div>
          )}
        </div>
        {/* Date Range Filter */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="start-date" className="mb-2 block">
              Start Date
            </Label>
            <Input
              id="start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="end-date" className="mb-2 block">
              End Date
            </Label>
            <Input
              id="end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <Button
            onClick={loadChartData}
            disabled={isLoadingChart || !startDate || !endDate}
          >
            {isLoadingChart ? 'Loading...' : 'Apply Filter'}
          </Button>
        </div>

        {/* Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trends</CardTitle>
            <CardDescription>
              Employee attendance statistics over the last {chartData?.range.days || 0} days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChart ? (
              <Skeleton className="h-80 w-full" />
            ) : chartDataFormatted.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="PRESENT" stackId="a" fill="#22c55e" name="Present" />
                  <Bar dataKey="LATE" stackId="a" fill="#eab308" name="Late" />
                  <Bar dataKey="ABSENT" stackId="a" fill="#ef4444" name="Absent" />
                  <Bar dataKey="LEAVE" stackId="a" fill="#3b82f6" name="Leave" />
                  <Bar dataKey="SICK" stackId="a" fill="#a855f7" name="Sick" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-80 flex items-center justify-center text-muted-foreground">
                No chart data available
              </div>
            )}
          </CardContent>
        </Card>
        {/* Attendance Log Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance Logs</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="space-y-3">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : dashboardData && dashboardData.attendanceLog.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Timestamp</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dashboardData.attendanceLog.map((log) => (
                      <TableRow key={log.attendance_log_id}>
                        <TableCell className="font-medium">{log.employee.name}</TableCell>
                        <TableCell>{log.employee.email}</TableCell>
                        <TableCell>{getLogTypeBadge(log.log_type)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDate(log.timestamp)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No attendance logs available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

function DashboardContent({ user }: { user: { name?: string } }) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Selamat datang, {user?.name || 'Admin'}!</h1>
          <p className="text-muted-foreground">Berikut adalah ringkasan aktivitas hari ini</p>
        </div>

        {/* Stats Cards */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Karyawan</h3>
            <p className="text-3xl font-bold text-primary">150</p>
            <p className="text-sm text-muted-foreground mt-2">+5 dari bulan lalu</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Hadir Hari Ini</h3>
            <p className="text-3xl font-bold text-green-600">142</p>
            <p className="text-sm text-muted-foreground mt-2">94.7% attendance rate</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Tidak Hadir</h3>
            <p className="text-3xl font-bold text-red-600">8</p>
            <p className="text-sm text-muted-foreground mt-2">5.3% absence rate</p>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">John Doe melakukan check-in</span>
                <span className="text-xs text-muted-foreground ml-auto">08:30</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Jane Smith mengajukan cuti</span>
                <span className="text-xs text-muted-foreground ml-auto">10:15</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Payroll bulan ini telah diproses</span>
                <span className="text-xs text-muted-foreground ml-auto">14:20</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid gap-2">
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                + Tambah Karyawan Baru
              </button>
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                📊 Lihat Laporan Bulanan
              </button>
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                💰 Proses Payroll
              </button>
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                ⚙️ Pengaturan Sistem
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}

function EmployeeDashboardContent({ user }: { user: { name?: string } }) {
  const [dashboardData, setDashboardData] = useState<EmployeeDashboardData | null>(null);
  const [chartData, setChartData] = useState<EmployeeDashboardChartData | null>(null);
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);
  const [isLoadingChart, setIsLoadingChart] = useState(true);
  const [error, setError] = useState('');
  
  // Date filter states
  const [startDate, setStartDate] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 11);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    loadDashboardData();
    loadChartData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoadingDashboard(true);
      const response = await employeeDashboardApi.getDashboardData();
      if (response.statusCode === 200) {
        setDashboardData(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard data'));
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadChartData = async () => {
    try {
      setIsLoadingChart(true);
      setError('');
      
      const response = await employeeDashboardApi.getChartData(startDate, endDate);
      if (response.statusCode === 200) {
        setChartData(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load chart data'));
    } finally {
      setIsLoadingChart(false);
    }
  };

  const getStatusBadge = (status: AttendanceStatus | null) => {
    if (!status) return <Badge variant="secondary">No Data</Badge>;
    
    const variants: Record<AttendanceStatus, { variant: "default" | "secondary" | "destructive" | "outline", label: string }> = {
      PRESENT: { variant: "default", label: "Present" },
      LATE: { variant: "secondary", label: "Late" },
      ABSENT: { variant: "destructive", label: "Absent" },
      LEAVE: { variant: "outline", label: "Leave" },
      SICK: { variant: "outline", label: "Sick" }
    };
    
    const config = variants[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const chartDataFormatted = chartData?.labels.map((label, index) => ({
    period: label,
    PRESENT: chartData.series.PRESENT[index] || 0,
    LATE: chartData.series.LATE[index] || 0,
    ABSENT: chartData.series.ABSENT[index] || 0,
    LEAVE: chartData.series.LEAVE[index] || 0,
    SICK: chartData.series.SICK[index] || 0,
    total: chartData.series.total[index] || 0,
  })) || [];

  return (
    <>
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
                <BreadcrumbPage>Employee Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold">Welcome, {user?.name || 'Employee'}!</h1>
          <p className="text-muted-foreground mt-1">Here is a summary of your activities</p>
        </div>
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}
        {/* Today's Status Card */}
        {isLoadingDashboard ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ) : dashboardData?.today && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today's Attendance - {formatDate(dashboardData.today.date)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(dashboardData.today.status)}
                    {dashboardData.today.is_late && dashboardData.today.late_minutes && (
                      <Badge variant="secondary" className="text-xs">
                        Late {dashboardData.today.late_minutes} min
                      </Badge>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Check In</p>
                  <div className="flex items-center gap-2">
                    <LogIn className="h-4 w-4 text-green-600" />
                    <p className="font-medium">
                      {dashboardData.today.check_in_time 
                        ? new Date(dashboardData.today.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Check Out</p>
                  <div className="flex items-center gap-2">
                    <LogOut className="h-4 w-4 text-red-600" />
                    <p className="font-medium">
                      {dashboardData.today.check_out_time 
                        ? new Date(dashboardData.today.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                        : '-'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Work Hours</p>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <p className="font-medium">
                      {dashboardData.today.total_work_hours 
                        ? `${dashboardData.today.total_work_hours.toFixed(1)} hrs`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Summary Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {isLoadingDashboard ? (
            Array.from({ length: 5 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-24" />
                </CardContent>
              </Card>
            ))
          ) : dashboardData?.summary_month && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Present</CardTitle>
                  <UserCheck className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{dashboardData.summary_month.PRESENT}</div>
                  <p className="text-xs text-muted-foreground">days this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Late</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{dashboardData.summary_month.LATE}</div>
                  <p className="text-xs text-muted-foreground">days this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Absent</CardTitle>
                  <UserX className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{dashboardData.summary_month.ABSENT}</div>
                  <p className="text-xs text-muted-foreground">days this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leave</CardTitle>
                  <Calendar className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{dashboardData.summary_month.LEAVE}</div>
                  <p className="text-xs text-muted-foreground">days this month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Sick</CardTitle>
                  <AlertCircle className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{dashboardData.summary_month.SICK}</div>
                  <p className="text-xs text-muted-foreground">days this month</p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Additional Info Cards */}
        {!isLoadingDashboard && dashboardData && (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Leave Applications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.leave_applications.pending}</div>
                <p className="text-sm text-muted-foreground mt-1">Pending applications</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <DollarSign className="h-5 w-5" />
                  Latest Payroll
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardData.payroll.latest ? (
                  <>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(dashboardData.payroll.latest.amount)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formatDate(dashboardData.payroll.latest.payroll_date)}
                    </p>
                  </>
                ) : (
                  <p className="text-muted-foreground">No payroll data yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
        {/* Date Range Filter */}
        <div className="flex items-end gap-4">
          <div className="flex-1">
            <Label htmlFor="employee-start-date" className="mb-2 block">
              Start Date
            </Label>
            <Input
              id="employee-start-date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={endDate}
            />
          </div>
          <div className="flex-1">
            <Label htmlFor="employee-end-date" className="mb-2 block">
              End Date
            </Label>
            <Input
              id="employee-end-date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <Button
            onClick={loadChartData}
            disabled={isLoadingChart || !startDate || !endDate}
          >
            {isLoadingChart ? 'Loading...' : 'Apply Filter'}
          </Button>
        </div>
        {/* Attendance Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Attendance Trend</CardTitle>
            <CardDescription>
              Your attendance history over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingChart ? (
              <Skeleton className="h-[350px] w-full" />
            ) : chartData ? (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={chartDataFormatted}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="PRESENT" stackId="a" fill="#22c55e" name="Present" />
                  <Bar dataKey="LATE" stackId="a" fill="#eab308" name="Late" />
                  <Bar dataKey="ABSENT" stackId="a" fill="#ef4444" name="Absent" />
                  <Bar dataKey="LEAVE" stackId="a" fill="#3b82f6" name="Leave" />
                  <Bar dataKey="SICK" stackId="a" fill="#a855f7" name="Sick" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[350px] flex items-center justify-center text-muted-foreground">
                No chart data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Attendances Table */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
            <CardDescription>
              Your attendance records for the last 10 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingDashboard ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : dashboardData?.recent_attendances && dashboardData.recent_attendances.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Check In</TableHead>
                    <TableHead>Check Out</TableHead>
                    <TableHead>Work Hours</TableHead>
                    <TableHead>Late</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dashboardData.recent_attendances.map((attendance, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {formatDate(attendance.attendance_date)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(attendance.status)}
                      </TableCell>
                      <TableCell>
                        {attendance.check_in_time 
                          ? new Date(attendance.check_in_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {attendance.check_out_time 
                          ? new Date(attendance.check_out_time).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {attendance.total_work_hours 
                          ? `${attendance.total_work_hours.toFixed(1)} hrs`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {attendance.is_late && attendance.late_minutes ? (
                          <Badge variant="secondary" className="text-xs">
                            {attendance.late_minutes} min
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No attendance records found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}