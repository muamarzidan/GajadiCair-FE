import { useState, useEffect } from 'react';
import { Plus, Search, Pencil, Trash2, Loader2, Users } from 'lucide-react';

import { employeeApi, type Employee } from '@/services/employee';
import { bankApi, type Bank } from '@/services/bank';
import type { AvailableSeats } from '@/types/employee';
import { EmployeeFormDialog } from '@/components/backoffice/employee/EmployeeFormDialog';
import { DeleteEmployeeDialog } from '@/components/backoffice/employee/DeleteEmployeeDialog';
import { formatCurrency, formatDate } from '@/utils';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';


const EmployeePage = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [availableSeats, setAvailableSeats] = useState<AvailableSeats | null>(null);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const response = await employeeApi.getAll();
      
      if (response.statusCode === 200) {
        const employeesData = response.data.employees || [];
        setEmployees(employeesData);
        setFilteredEmployees(employeesData);
        setAvailableSeats(response.data.availableSeats);
      };
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    } finally {
      setIsLoading(false);
    };
  };
  const fetchBanks = async () => {
    try {
      setIsLoading(true);
      const response = await bankApi.getBanks();
      
      if (response.statusCode === 200) {
        setBanks(response.data);
      };
    } catch (error) {
      console.error('Failed to fetch banks:', error);
    } finally {
      setIsLoading(false);
    };
  };

  useEffect(() => {
    fetchEmployees();
    fetchBanks();
  }, []);
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEmployees(employees);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = employees.filter(
        (emp) =>
          emp.name.toLowerCase().includes(query)
      );
      setFilteredEmployees(filtered);
    };
  }, [searchQuery, employees]);

  const handleAdd = () => {
    setSelectedEmployee(null);
    setIsFormOpen(true);
  };
  const handleEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsFormOpen(true);
  };
  const handleDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDeleteOpen(true);
  };

  const isAddButtonDisabled = () => {
    if (!availableSeats) return false;
    if (availableSeats.seat_capacity === null) return false;
    if (availableSeats.seat_availability !== null && availableSeats.seat_availability <= 0) {
      return true;
    }
    
    return false;
  };

  const getSeatStatusMessage = () => {
    if (!availableSeats) return null;
    
    if (availableSeats.seat_capacity !== null) {
      const remaining = availableSeats.seat_availability || 0;
      const capacity = availableSeats.seat_capacity;
      const taken = availableSeats.seat_taken;
      
      if (remaining <= 0) {
        return {
          type: 'error' as const,
          message: `Employee limit reached (${taken}/${capacity}). Upgrade your plan to add more employees.`
        };
      } else if (remaining <= 2) {
        return {
          type: 'warning' as const,
          message: `Only ${remaining} employee slot${remaining > 1 ? 's' : ''} remaining (${taken}/${capacity})`
        };
      }
      
      return {
        type: 'info' as const,
        message: `${remaining} employee slot${remaining > 1 ? 's' : ''} available (${taken}/${capacity})`
      };
    }
    
    return {
      type: 'success' as const,
      message: `${availableSeats.seat_taken} employee${availableSeats.seat_taken !== 1 ? 's' : ''} has enrolled in your company.`
    };
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
                  <BreadcrumbPage>Employees</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
            <p className="text-muted-foreground">
              Manage your company employees and their information
            </p>
          </div>
          {/* Search & Create */}
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button 
              onClick={handleAdd} 
              className="gap-2"
              disabled={isAddButtonDisabled()}
            >
              <Plus className="h-4 w-4" />
              Add Employee
            </Button>
          </div>
          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Base Salary</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Joined Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading employees...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="text-muted-foreground">
                        {searchQuery
                          ? 'No employees found matching your search'
                          : 'No employees yet. Add your first employee!'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees?.map((employee) => (
                    <TableRow key={employee.employee_id}>
                      <TableCell className="font-medium">{employee.name}</TableCell>
                      <TableCell>{employee.username}</TableCell>
                      <TableCell>{employee.email}</TableCell>
                      <TableCell>{formatCurrency(employee.base_salary)}</TableCell>
                      <TableCell>
                        <Badge variant={employee.is_active ? 'success' : 'secondary'}>
                          {employee.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(employee.last_login)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(employee.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(employee)}
                            className="gap-1"
                          >
                            <Pencil className="h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(employee)}
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
          {/* Seat Status Alert */}
          {availableSeats && getSeatStatusMessage() && (
            <div
              className={`p-4 rounded-lg border flex items-center gap-3 ${
                getSeatStatusMessage()?.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : getSeatStatusMessage()?.type === 'warning'
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  : getSeatStatusMessage()?.type === 'info'
                  ? 'bg-blue-50 border-blue-200 text-blue-800'
                  : 'bg-green-50 border-green-200 text-green-800'
              }`}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm font-medium">{getSeatStatusMessage()?.message}</p>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            {filteredEmployees.length} of {employees.length} employees
          </div>
          <EmployeeFormDialog
            bankProps={
              banks
            }
            open={isFormOpen}
            onOpenChange={setIsFormOpen}
            employee={selectedEmployee}
            onSuccess={fetchEmployees}
          />
          <DeleteEmployeeDialog
            open={isDeleteOpen}
            onOpenChange={setIsDeleteOpen}
            employee={selectedEmployee}
            onSuccess={fetchEmployees}
          />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default EmployeePage;