import { useState, useEffect } from "react";
import { Loader2, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

import {
  employeeAttendanceSummaryApi,
  type EmployeeAttendanceData,
  type EmployeeAttendanceHistoryItem,
  type EmployeeAttendanceStatus,
} from "@/services/employeeAttendanceSummary";
import { getErrorMessage, getValidationErrors } from "@/utils";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["M", "S", "S", "R", "K", "J", "S"];

const EmployeeAttendanceSummaryPage = () => {
  const [employeeData, setEmployeeData] =
    useState<EmployeeAttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  // Generate year options (current year ± 5 years)
  const yearOptions = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  const fetchSummary = async (month: number, year: number) => {
    try {
      setIsLoading(true);
      setError("");
      const response = await employeeAttendanceSummaryApi.getSummary(
        month,
        year
      );

      if (response.statusCode === 200) {
        setEmployeeData(response.data.employee);
      }
    } catch (err) {
      const validationErrors = getValidationErrors(err);
      if (validationErrors) {
        const errorMessages = Object.values(validationErrors).flat().join(", ");
        setError(errorMessages);
      } else {
        setError(getErrorMessage(err, "Failed to fetch attendance summary"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary(currentMonth, currentYear);
  }, [currentMonth, currentYear]);

  const handlePreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getStatusBadgeClass = (
    status: EmployeeAttendanceStatus,
    isLate: boolean
  ): string => {
    if (status === "PRESENT") {
      return isLate
        ? "bg-yellow-200 text-yellow-800"
        : "bg-green-200 text-green-800";
    }
    if (status === "ABSENT") return "bg-red-200 text-red-800";
    if (status === "SICK" || status === "LEAVE")
      return "bg-blue-200 text-blue-800";
    return "bg-gray-100 text-gray-500";
  };

  const getStatusLabel = (
    status: EmployeeAttendanceStatus,
    isLate: boolean
  ): string => {
    if (status === "PRESENT") return isLate ? "T" : "H";
    if (status === "ABSENT") return "A";
    if (status === "SICK") return "S";
    if (status === "LEAVE") return "I";
    return "-";
  };

  const generateCalendarGrid =
    (): (EmployeeAttendanceHistoryItem | null)[][] => {
      if (!employeeData) return [];

      const firstDay = new Date(currentYear, currentMonth - 1, 1);
      const lastDay = new Date(currentYear, currentMonth, 0);
      const firstDayOfWeek = firstDay.getDay();
      const daysInMonth = lastDay.getDate();

      // Adjust for Monday start (0 = Monday, 6 = Sunday)
      const startOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      const calendar: (EmployeeAttendanceHistoryItem | null)[][] = [];
      let week: (EmployeeAttendanceHistoryItem | null)[] = [];

      // Fill initial empty cells
      for (let i = 0; i < startOffset; i++) {
        week.push(null);
      }

      // Fill days
      for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth).padStart(
          2,
          "0"
        )}-${String(day).padStart(2, "0")}`;
        const attendance = employeeData.attendance_histories.find(
          (item) => item.tanggal === dateStr
        );

        week.push(attendance || null);

        if (week.length === 7) {
          calendar.push(week);
          week = [];
        }
      }

      // Fill remaining empty cells
      if (week.length > 0) {
        while (week.length < 7) {
          week.push(null);
        }
        calendar.push(week);
      }

      return calendar;
    };

  const calendarGrid = generateCalendarGrid();

  // Calculate summary with late separated from present
  const presentOnTime = employeeData
    ? employeeData.attendance_histories.filter(
        (item) => item.status === "PRESENT" && !item.is_late
      ).length
    : 0;

  const presentLate = employeeData
    ? employeeData.attendance_histories.filter(
        (item) => item.status === "PRESENT" && item.is_late
      ).length
    : 0;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/attendance">Attendance</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>My Attendance Summary</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Attendance Summary
            </h1>
          </div>
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {/* Calendar Card */}
          <Card className="!shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Month</CardTitle>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handlePreviousMonth}
                    disabled={isLoading}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-semibold min-w-[200px] text-center">
                    {MONTHS[currentMonth - 1]} {currentYear}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleNextMonth}
                    disabled={isLoading}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Month and Year Selectors */}
                <div className="flex items-center gap-2">
                  <Select
                    value={String(currentMonth)}
                    onValueChange={(value) => setCurrentMonth(Number(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((month, index) => (
                        <SelectItem key={month} value={String(index + 1)}>
                          {month}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={String(currentYear)}
                    onValueChange={(value) => setCurrentYear(Number(value))}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={String(year)}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                <>
                  {/* Calendar Grid */}
                  <div className="border rounded-lg overflow-hidden">
                    {/* Header Days */}
                    <div className="grid grid-cols-7 bg-muted">
                      {DAYS.map((day) => (
                        <div
                          key={day}
                          className="text-center py-2 text-sm font-semibold"
                        >
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Body */}
                    {calendarGrid.map((week, weekIndex) => (
                      <div
                        key={weekIndex}
                        className="grid grid-cols-7 border-t"
                      >
                        {week.map((day, dayIndex) => {
                          if (!day) {
                            return (
                              <div
                                key={`empty-${weekIndex}-${dayIndex}`}
                                className="aspect-square p-2 border-r last:border-r-0"
                              />
                            );
                          }

                          const dayNumber = new Date(day.tanggal).getDate();
                          const statusLabel = getStatusLabel(
                            day.status,
                            day.is_late
                          );
                          const statusClass = getStatusBadgeClass(
                            day.status,
                            day.is_late
                          );

                          return (
                            <div
                              key={day.tanggal}
                              className="aspect-square p-2 border-r last:border-r-0 flex flex-col items-center justify-center gap-1"
                            >
                              <span className="text-sm font-medium">
                                {String(dayNumber).padStart(2, "0")}
                              </span>
                              <div
                                className={`w-8 h-8 rounded flex items-center justify-center font-bold text-sm ${statusClass}`}
                              >
                                {statusLabel}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <Card className="!shadow-none bg-green-50">
                      <CardContent className="pt-6">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-green-900">
                            Hadir: {presentOnTime}
                          </p>
                          <p className="text-sm font-medium text-green-900">
                            Terlambat: {presentLate}
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="!shadow-none bg-blue-50">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-blue-900">
                          Izin: {employeeData?.summary.LEAVE || 0}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="!shadow-none bg-purple-50">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-purple-900">
                          Sakit: {employeeData?.summary.SICK || 0}
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="!shadow-none bg-red-50">
                      <CardContent className="pt-6">
                        <p className="text-sm font-medium text-red-900">
                          Absent: {employeeData?.summary.ABSENT || 0}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default EmployeeAttendanceSummaryPage;