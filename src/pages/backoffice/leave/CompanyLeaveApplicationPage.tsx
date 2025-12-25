import { useState, useEffect } from 'react';
import { Search, Filter, Loader2, FileText, CheckCircle, XCircle, Clock, FileIcon } from 'lucide-react';

import { companyLeaveApplicationApi } from '@/services/leaveApplication';
import { getImageUrl } from '@/utils';
import type { LeaveApplication } from '@/types/leaveApplication';
import { getErrorMessage, formatDate } from '@/utils';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';


const ApplicationPage = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [searchQuery, typeFilter, statusFilter, applications]);

  const fetchApplications = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await companyLeaveApplicationApi.getLeaveApplications();
      
      if (response.statusCode === 200) {
        setApplications(response.data);
        setFilteredApplications(response.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to fetch leave applications'));
      console.error('Failed to fetch applications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = [...applications];

    // Search by employee name
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((app) =>
        app.employee?.name.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.type === typeFilter);
    }

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((app) => app.status.toString() === statusFilter);
    }

    setFilteredApplications(filtered);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Pending
          </Badge>
        );
      case 1:
        return (
          <Badge variant="default" className="gap-1 bg-green-600">
            <CheckCircle className="h-3 w-3" />
            Approved
          </Badge>
        );
      case 2:
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejected
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'SICK' ? 'secondary' : 'default'}>
        {type}
      </Badge>
    );
  };

  const handleApprove = async (applicationId: string) => {
    try {
      await companyLeaveApplicationApi.updateLeaveApplicationStatus({
        employee_leave_application_id: applicationId,
        is_approve: true,
      });
      fetchApplications();
    } catch (err) {
      console.error('Failed to approve:', err);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await companyLeaveApplicationApi.updateLeaveApplicationStatus({
        employee_leave_application_id: applicationId,
        is_approve: false,
      });
      fetchApplications();
    } catch (err) {
      console.error('Failed to reject:', err);
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
                  <BreadcrumbPage>Leave Applications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex flex-col gap-1">
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-8 w-8" />
              Leave Applications
            </h1>
            <p className="text-muted-foreground">
              Manage employee leave and sick applications
            </p>
          </div>
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <p className="text-sm text-red-700">{error}</p>
              </CardContent>
            </Card>
          )}
          {/* Search & Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by employee name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="SICK">Sick</SelectItem>
                  <SelectItem value="LEAVE">Leave</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="0">Pending</SelectItem>
                  <SelectItem value="1">Approved</SelectItem>
                  <SelectItem value="2">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Attacment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading applications...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredApplications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center">
                      <div className="text-muted-foreground">
                        {searchQuery || typeFilter !== 'ALL' || statusFilter !== 'ALL'
                          ? 'No applications found matching your filters'
                          : 'No applications yet'}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApplications.map((app) => (
                    <TableRow key={app.employee_leave_application_id}>
                      <TableCell className="font-medium">
                        {app.employee?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{getTypeBadge(app.type)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{formatDate(app.start_date)}</div>
                          <div className="text-muted-foreground">
                            to {formatDate(app.end_date)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {app.reason}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-1'>
                          <FileIcon className="h-4 w-4" />
                          {app.attachment_uri ? (
                            <a
                              href={getImageUrl(app.attachment_uri)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Open
                            </a>
                          ) : (
                            <span className="text-muted-foreground">No Attachment</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(app.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(app.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        {app.status === 0 && (
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApprove(app.employee_leave_application_id)}
                              className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle className="h-3 w-3" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReject(app.employee_leave_application_id)}
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="h-3 w-3" />
                              Reject
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="text-sm text-muted-foreground">
            Showing {filteredApplications.length} of {applications.length} applications
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ApplicationPage;