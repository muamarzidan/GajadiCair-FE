import { useState, useEffect } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, Filter} from "lucide-react";

import { holidayApi, type Holiday } from "@/services/holiday";
import { HolidayFormDialog } from "@/components/backoffice/holiday/HolidayFormDialog";
import { DeleteHolidayDialog } from "@/components/backoffice/holiday/DeleteHolidayDialog";
import { formatDateRangeUTC7 } from "@/utils";
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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";


const HolidayPage = () => {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [filteredHolidays, setFilteredHolidays] = useState<Holiday[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedHoliday, setSelectedHoliday] = useState<Holiday | null>(
    null
  );

  const fetchHolidays = async () => {
    try {
      setIsLoading(true);
      const response = await holidayApi.getAll();

      if (response.statusCode === 200) {
        setHolidays(response.data);
        setFilteredHolidays(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch holidays:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
  }, []);

  useEffect(() => {
    let filtered = [...holidays];

    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((holiday) =>
        holiday.description.toLowerCase().includes(query)
      );
    }
    if (startDateFilter) {
      filtered = filtered.filter((holiday) => {
        const holidayStart = new Date(holiday.start_date);
        const filterStart = new Date(startDateFilter);
        return holidayStart >= filterStart;
      });
    }
    if (endDateFilter) {
      filtered = filtered.filter((holiday) => {
        const holidayEnd = new Date(holiday.end_date);
        const filterEnd = new Date(endDateFilter);
        return holidayEnd <= filterEnd;
      });
    }

    setFilteredHolidays(filtered);
  }, [searchQuery, startDateFilter, endDateFilter, holidays]);

  const handleAdd = () => {
    setSelectedHoliday(null);
    setIsFormOpen(true);
  };
  const handleEdit = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsFormOpen(true);
  };
  const handleDelete = (holiday: Holiday) => {
    setSelectedHoliday(holiday);
    setIsDeleteOpen(true);
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
                  <BreadcrumbPage>Holiday</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Holiday</h1>
            <p className="text-muted-foreground">
              Manage your company custom holidays
            </p>
          </div>
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-8 flex-1 w-full">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search by description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    placeholder="Start Date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="w-[160px]"
                  />
                  <Input
                    type="date"
                    placeholder="End Date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="w-[160px]"
                  />
                </div>
              </div>
            </div>
            <Button onClick={handleAdd} className="gap-2 w-full sm:w-auto">
              <Plus className="h-4 w-4" />
              Add Holiday
            </Button>
          </div>
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Start & End Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading holidays...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredHolidays.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="text-muted-foreground">
                        {searchQuery
                          ? "No holidays found matching your search"
                          : "No holidays yet. Add your first holiday!"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredHolidays.map((holiday) => (
                    <TableRow key={holiday.company_custom_holiday_id}>
                      <TableCell className="font-medium">
                        {formatDateRangeUTC7(holiday.start_date, holiday.end_date)}
                      </TableCell>
                      <TableCell>{holiday.description}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(holiday)}
                            className="gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(holiday)}
                            className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-3 w-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="text-sm text-muted-foreground">
            {filteredHolidays.length} of {holidays.length} holidays
          </div>
          <HolidayFormDialog
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            holiday={selectedHoliday}
            onSuccess={fetchHolidays}
          />
          <DeleteHolidayDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            holiday={selectedHoliday}
            onSuccess={fetchHolidays}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default HolidayPage;