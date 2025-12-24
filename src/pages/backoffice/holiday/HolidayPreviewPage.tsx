import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

import { holidayApi, type Holiday } from '@/services/holiday';
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
import { Card } from '@/components/ui/card';


const HolidayPreviewPage = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarEvents, setCalendarEvents] = useState<Map<string, Holiday[]>>(new Map());

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      const response = await holidayApi.getAll();

      if (response.statusCode === 200) {
        setHolidays(response.data);
        processHolidaysToEvents(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processHolidaysToEvents = (holidayList: Holiday[]) => {
    const eventsMap = new Map<string, Holiday[]>();

    holidayList.forEach((holiday) => {
      const start = new Date(holiday.start_date);
      const end = new Date(holiday.end_date);

      // Generate all dates in range
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        const dateKey = formatDateKey(date);
        const existing = eventsMap.get(dateKey) || [];
        eventsMap.set(dateKey, [...existing, holiday]);
      }
    });

    setCalendarEvents(eventsMap);
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  const formatDateKey = (date: Date): string => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getDaysInMonth = (year: number, month: number): Date[] => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add previous month's days to fill the week
    const firstDayOfWeek = firstDay.getDay();
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      days.push(date);
    }

    // Add current month's days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    // Add next month's days to fill the week
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let i = 1; i <= remainingDays; i++) {
        days.push(new Date(year, month + 1, i));
      }
    }

    return days;
  };

  const handlePreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth();
  };

  const getEventsForDate = (date: Date): Holiday[] => {
    const dateKey = formatDateKey(date);
    return calendarEvents.get(dateKey) || [];
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

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
                  <BreadcrumbPage>Holiday Calendar</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Holiday Calendar</h1>
            <p className="text-muted-foreground">
              View all company holidays in calendar format
            </p>
          </div>

          {/* Calendar Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-xl font-semibold">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>

          {isLoading ? (
            <Card className="p-12">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span>Loading holidays...</span>
              </div>
            </Card>
          ) : (
            <Card className="p-4">
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                {/* Day Headers */}
                {dayNames.map((day) => (
                  <div
                    key={day}
                    className="bg-muted p-3 text-center text-sm font-semibold"
                  >
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                  const events = getEventsForDate(day);
                  const isCurrentDay = isToday(day);
                  const isSameMonth = isCurrentMonth(day);

                  return (
                    <div
                      key={index}
                      className={`bg-background min-h-[120px] p-2 ${
                        !isSameMonth ? 'opacity-40' : ''
                      } ${isCurrentDay ? 'bg-primary/5 border-2 border-primary' : ''}`}
                    >
                      <div className="flex flex-col h-full">
                        <div
                          className={`text-sm font-medium mb-2 ${
                            isCurrentDay
                              ? 'bg-primary text-primary-foreground w-7 h-7 rounded-full flex items-center justify-center'
                              : ''
                          }`}
                        >
                          {day.getDate()}
                        </div>
                        <div className="space-y-1 overflow-y-auto flex-1">
                          {events.slice(0, 3).map((holiday, idx) => (
                            <div
                              key={`${holiday.company_custom_holiday_id}-${idx}`}
                              className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate"
                              title={holiday.description}
                            >
                              {holiday.description}
                            </div>
                          ))}
                          {events.length > 3 && (
                            <div className="text-xs text-muted-foreground font-medium">
                              +{events.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary rounded"></div>
              <span>Today</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-100 rounded"></div>
              <span>Holiday</span>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Total holidays: {holidays.length}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HolidayPreviewPage;  