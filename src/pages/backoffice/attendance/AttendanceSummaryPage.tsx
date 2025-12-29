import { useState, useEffect } from 'react';
import { Filter, Loader2, AlertCircle } from 'lucide-react';

import { attendanceSummaryApi, type EmployeeAttendance, type AttendanceStatus } from '@/services/attendanceSummary';
import { getImageUrl, getErrorMessage, getValidationErrors } from '@/utils';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const AttendanceSummaryPage = () => {
  const [employees, setEmployees] = useState<EmployeeAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');
  const [dateFilterError, setDateFilterError] = useState('');

  const fetchSummary = async (start?: string, end?: string) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await attendanceSummaryApi.getSummary(start, end);

      if (response.statusCode === 200) {
        setEmployees(response.data.employees);
      }
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      if (validationErrors) {
        // Extract all validation error messages
        const errorMessages = Object.values(validationErrors)
          .flat()
          .join(', ');
        setError(errorMessages);
      } else {
        setError(getErrorMessage(err, 'Failed to fetch attendance summary'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load with default (last 7 days)
    fetchSummary();
  }, []);

  const handleFilter = () => {
    // Validate date range
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      setDateFilterError('Start date cannot be greater than end date');
      return;
    }
    setDateFilterError('');
    fetchSummary(startDate, endDate);
  };

  const handleReset = () => {
    setStartDate('');
    setEndDate('');
    setDateFilterError('');
    fetchSummary();
  };

  const getStatusBadgeClass = (status: AttendanceStatus, isLate: boolean): string => {
    if (status === 'PRESENT') {
      return isLate ? 'bg-yellow-200 text-yellow-800' : 'bg-green-200 text-green-800';
    }
    if (status === 'ABSENT') return 'bg-red-200 text-red-800';
    if (status === 'SICK' || status === 'LEAVE') return 'bg-blue-200 text-blue-800';
    return 'bg-gray-100 text-gray-500';
  };

  const getStatusLabel = (status: AttendanceStatus, isLate: boolean): string => {
    if (status === 'PRESENT') return isLate ? 'T' : 'H';
    if (status === 'ABSENT') return 'A';
    if (status === 'SICK') return 'S';
    if (status === 'LEAVE') return 'I';
    return '-';
  };

  const formatDateHeader = (dateString: string): string => {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const dateColumns = employees[0]?.attendance_histories || [];

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
                  <BreadcrumbPage>Attendance Summary</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Attendance Summary</h1>
            <p className="text-muted-foreground">
              View employee attendance records and statistics
            </p>
          </div>
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {/* Date Filter Error */}
          {dateFilterError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{dateFilterError}</span>
            </div>
          )}
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-2 w-full">
            <div className="w-full sm:w-fit space-y-7">
              <Label htmlFor="start_date" className="sm:ml-7">Start Date</Label>
              <div className="flex gap-3 items-center">
                <Filter className="h-4 w-4 hidden sm:block" />
                <Input
                  id="start_date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
            </div>
            <div className="w-full sm:w-fit space-y-2">
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-fit sm:ml-4">
              <Button onClick={handleFilter} disabled={isLoading} className="!sm:w-fit flex-1">
                Apply
              </Button>
              <Button variant="outline" onClick={handleReset} disabled={isLoading} className="!sm:w-fit flex-1">
                Reset
              </Button>
            </div>
          </div>
          {/* Table */}
          {isLoading ? (
            <Card className="p-12 !shadow-none flex items-center justify-center">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading attendance data...</span>
              </div>
            </Card>
          ) : (
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[200px] sticky left-0 bg-background z-10">Employee</TableHead>
                    {dateColumns.map((day) => (
                      <TableHead key={day.tanggal} className="text-center min-w-[60px]">
                        {formatDateHeader(day.tanggal)}
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[50px]">H</TableHead>
                    <TableHead className="text-center min-w-[50px]">T</TableHead>
                    <TableHead className="text-center min-w-[50px]">I</TableHead>
                    <TableHead className="text-center min-w-[50px]">S</TableHead>
                    <TableHead className="text-center min-w-[50px]">A</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {employees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={dateColumns.length + 6} className="h-32 text-center">
                        <div className="text-muted-foreground">
                          No attendance data found for the selected period
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    employees.map((employee) => (
                      <TableRow key={employee.employee_id}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 hidden sm:block">
                              <AvatarImage 
                                src={employee.avatar_uri ? getImageUrl(employee.avatar_uri) : undefined} 
                                alt={employee.name} 
                              />
                              <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-medium">{employee.name}</span>
                              <span className="text-xs text-muted-foreground">{employee.email}</span>
                            </div>
                          </div>
                        </TableCell>
                        {employee.attendance_histories.map((attendance) => (
                          <TableCell key={attendance.tanggal} className="text-center p-1">
                            <div
                              className={`inline-flex items-center justify-center w-10 h-10 rounded font-semibold ${getStatusBadgeClass(
                                attendance.status,
                                attendance.is_late
                              )}`}
                            >
                              {getStatusLabel(attendance.status, attendance.is_late)}
                            </div>
                          </TableCell>
                        ))}
                        <TableCell className="text-center font-medium">
                          {employee.summary.PRESENT - (employee.attendance_histories.filter(h => h.is_late && h.status === 'PRESENT').length)}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {employee.attendance_histories.filter(h => h.is_late && h.status === 'PRESENT').length}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {employee.summary.LEAVE}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {employee.summary.SICK}
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          {employee.summary.ABSENT}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
          {/* Legend */}
          <Card className="p-4 !shadow-none">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-green-200 flex items-center justify-center text-green-800 font-semibold">
                  H
                </div>
                <span className="text-sm">Hadir</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-yellow-200 flex items-center justify-center text-yellow-800 font-semibold">
                  T
                </div>
                <span className="text-sm">Telat</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center text-blue-800 font-semibold">
                  I
                </div>
                <span className="text-sm">Izin</span>
              </div>
              <div className="flex items-center gap-2">
                {/* <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center text-gray-800 font-semibold"> */}
                <div className="w-8 h-8 rounded bg-blue-200 flex items-center justify-center text-blue-800 font-semibold">
                  S
                </div>
                <span className="text-sm">Sakit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-red-200 flex items-center justify-center text-red-800 font-semibold">
                  A
                </div>
                <span className="text-sm">Absent</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-gray-500 font-semibold">
                  -
                </div>
                <span className="text-sm">Unknow</span>
              </div>
            </div>
          </Card>
          <div className="text-sm text-muted-foreground">
            Total employees: {employees.length}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AttendanceSummaryPage;
