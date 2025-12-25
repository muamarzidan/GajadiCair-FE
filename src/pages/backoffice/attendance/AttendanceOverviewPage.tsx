import { useState, useEffect } from "react";
import { Loader2, AlertCircle, Clock, Filter } from "lucide-react";

import {
  attendanceApi,
  type EmployeeWithAttendance,
  type EmployeeAttendanceDetail,
} from "@/services/attendance";
import { getImageUrl, getErrorMessage, getValidationErrors } from "@/utils";
import { AppSidebar } from "@/components/app-sidebar";
import { EditAttendanceDialog } from "@/components/backoffice/attendance/EditAttendanceDialog";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const AttendanceOverviewPage = () => {
  const [employees, setEmployees] = useState<EmployeeWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState<{
    attendance: EmployeeAttendanceDetail;
    employeeName: string;
  } | null>(null);

  const fetchAttendance = async (date?: string) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await attendanceApi.getCompanyAttendanceOverview(date);

      if (response.statusCode === 200) {
        setEmployees(response.data.employees);
        setCurrentDate(response.data.date);
      }
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        setError(errorMessages);
      } else {
        setError(getErrorMessage(err, "Failed to fetch attendance data"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Load today's data by default
    fetchAttendance();
  }, []);

  const handleFilter = () => {
    if (selectedDate) {
      fetchAttendance(selectedDate);
    }
  };

  const handleToday = () => {
    setSelectedDate("");
    fetchAttendance();
  };

  const handleCardClick = (attendance: EmployeeAttendanceDetail, employeeName: string) => {
    setSelectedAttendance({ attendance, employeeName });
    setEditDialogOpen(true);
  };

  const handleUpdateSuccess = () => {
    // Refresh data after successful update
    fetchAttendance(selectedDate || undefined);
  };

  const getStatusBadge = (status: string, isLate: boolean) => {
    if (status === "PRESENT") {
      return (
        <Badge
          className={
            isLate
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-green-500 hover:bg-green-600"
          }
        >
          {isLate ? "Present (Late)" : "Present"}
        </Badge>
      );
    }
    if (status === "ABSENT") {
      return <Badge variant="destructive">Absent</Badge>;
    }
    if (status === "SICK") {
      return <Badge className="!bg-blue-500 hover:bg-blue-600">Sick</Badge>;
    }
    if (status === "LEAVE") {
      return <Badge className="!bg-blue-500 hover:bg-blue-600">Leave</Badge>;
    }
    return <Badge variant="secondary">Unknown</Badge>;
  };

  const formatTime = (isoString: string | null): string => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      // Add 7 hours for UTC+7
      date.setHours(date.getHours() + 7);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "-";
    }
  };

  const formatDisplayDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const getInitials = (name: string): string => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const stats = {
    present: employees.filter((e) => e.attendance.status === "PRESENT").length,
    absent: employees.filter((e) => e.attendance.status === "ABSENT").length,
    sick: employees.filter((e) => e.attendance.status === "SICK").length,
    leave: employees.filter((e) => e.attendance.status === "LEAVE").length,
    late: employees.filter((e) => e.attendance.is_late).length,
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
                  <BreadcrumbPage>Attendance Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Attendance Overview
            </h1>
            <p className="text-muted-foreground">
              View employee attendance for a specific date
            </p>
          </div>
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {/* Date Filter */}
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mt-4">
            <div className="flex items-end gap-2 w-full">
              <div className="flex flex-col w-full sm:w-fit gap-1">
                <Label htmlFor="date" className="sm:ml-8">Select Date</Label>
                <div className="flex items-center gap-4">
                  <Filter className="h-4 w-4 hidden sm:block" />
                  <Input
                    className="w-full sm:w-fit"
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>
              <Button
                onClick={handleFilter}
                disabled={isLoading || !selectedDate}
              >
                Apply
              </Button>
            </div>
            <Button
              className="w-full sm:w-fit !border border-black"
              variant="outline"
              onClick={handleToday}
              disabled={isLoading}
            >
              Today
            </Button>
          </div>
          {currentDate && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing data for:{" "}
              <span className="font-semibold">
                {formatDisplayDate(currentDate)}
              </span>
              {" "}
              & Total Employees:{" "}
              <span className="font-semibold">
                {employees.length} employee{employees.length !== 1 ? "s" : ""}
              </span>
            </p>
          )}
          {/* Statistics Cards */}
          {!isLoading && employees.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <Card className="!shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Present
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {stats.present}
                  </div>
                </CardContent>
              </Card>
              <Card className="!shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Late
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {stats.late}
                  </div>
                </CardContent>
              </Card>
              <Card className="!shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Absent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.absent}
                  </div>
                </CardContent>
              </Card>
              <Card className="!shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Sick
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.sick}
                  </div>
                </CardContent>
              </Card>
              <Card className="!shadow-none">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Leave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.leave}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {/* Employee List */}
          {isLoading ? (
            <Card className="p-12">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading attendance data...</span>
              </div>
            </Card>
          ) : employees.length === 0 ? (
            <Card className="p-12 !shadow-none">
              <div className="text-center text-muted-foreground">
                No attendance data found for the selected date
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {employees.map((employee) => (
                <Card 
                  key={employee.employee_id} 
                  className="!shadow-none cursor-pointer hover:border-primary transition-colors"
                  onClick={() => handleCardClick(employee.attendance, employee.name)}
                >
                  <CardContent className="p-4">                    
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={
                            employee.avatar_uri
                              ? getImageUrl(employee.avatar_uri)
                              : undefined
                          }
                          alt={employee.name}
                        />
                        <AvatarFallback className="text-lg">
                          {getInitials(employee.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold">
                              {employee.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {employee.email}
                            </p>
                          </div>
                          {getStatusBadge(
                            employee.attendance.status,
                            employee.attendance.is_late
                          )}
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Check In
                              </p>
                              <p className="font-medium">
                                {formatTime(employee.attendance.check_in_time)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Check Out
                              </p>
                              <p className="font-medium">
                                {formatTime(employee.attendance.check_out_time)}
                              </p>
                            </div>
                          </div>
                          {employee.attendance.is_late &&
                            employee.attendance.late_minutes && (
                              <div className="flex items-center gap-2 text-sm">
                                <div>
                                  <p className="text-xs text-muted-foreground">
                                    Late By
                                  </p>
                                  <p className="font-medium text-yellow-600">
                                    {employee.attendance.late_minutes} min
                                  </p>
                                </div>
                              </div>
                            )}
                          {employee.attendance.total_work_hours !== null && (
                            <div className="flex items-center gap-2 text-sm">
                              <div>
                                <p className="text-xs text-muted-foreground">
                                  Work Hours
                                </p>
                                <p className="font-medium">
                                  {employee.attendance.total_work_hours.toFixed(
                                    1
                                  )}{" "}
                                  hrs
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {employee.attendance.absent_reason && (
                          <div className="text-sm">
                            <p className="text-xs text-muted-foreground">
                              Reason:
                            </p>
                            <p className="text-red-600 font-medium">
                              {employee.attendance.absent_reason.replace(
                                /_/g,
                                " "
                              )}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </SidebarInset>

      {/* Edit Attendance Dialog */}
      <EditAttendanceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        attendance={selectedAttendance?.attendance || null}
        employeeName={selectedAttendance?.employeeName || ''}
        onSuccess={handleUpdateSuccess}
      />
    </SidebarProvider>
  );
};

export default AttendanceOverviewPage;