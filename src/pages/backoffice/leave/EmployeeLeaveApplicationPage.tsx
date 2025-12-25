import { useState, useEffect } from 'react';
import { Plus, Check, X, FileIcon, Filter } from 'lucide-react';
import { format } from 'date-fns';

import { employeeLeaveApplicationApi } from '@/services/leaveApplication';
import type { LeaveApplication } from '@/types/leaveApplication';
import { getImageUrl } from '@/utils';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const EmployeeLeaveApplicationPage = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  
  // Filter states
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  // Form state
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [type, setType] = useState<'SICK' | 'LEAVE'>('SICK');
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    loadApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [filterStartDate, filterEndDate, filterType, filterStatus, applications]);

  const filterApplications = () => {
    let filtered = [...applications];

    // Filter by date range
    if (filterStartDate) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.start_date);
        const filterDate = new Date(filterStartDate);
        return appDate >= filterDate;
      });
    }

    if (filterEndDate) {
      filtered = filtered.filter((app) => {
        const appDate = new Date(app.end_date);
        const filterDate = new Date(filterEndDate);
        filterDate.setHours(23, 59, 59, 999);
        return appDate <= filterDate;
      });
    }

    // Filter by type
    if (filterType !== 'ALL') {
      filtered = filtered.filter((app) => app.type === filterType);
    }

    // Filter by status
    if (filterStatus !== 'ALL') {
      filtered = filtered.filter((app) => app.status.toString() === filterStatus);
    }

    setFilteredApplications(filtered);
  };

  const loadApplications = async () => {
    try {
      setFetchLoading(true);
      const response = await employeeLeaveApplicationApi.getLeaveApplications();
      if (response.statusCode === 200) {
        setApplications(response.data);
        setFilteredApplications(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Format file tidak valid. Hanya PDF, JPG, PNG, dan WEBP yang diperbolehkan.');
        e.target.value = '';
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError('Ukuran file terlalu besar. Maksimal 5MB.');
        e.target.value = '';
        return;
      }

      setError('');
      setAttachment(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!attachment) {
      setError('Mohon upload file lampiran');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        attachment,
        start_date: startDate,
        end_date: endDate,
        reason,
        type,
      };

      const response = await employeeLeaveApplicationApi.createLeaveApplication(data);
      if (response.statusCode === 200 || response.statusCode === 201) {
        setSuccess('Pengajuan izin/sakit berhasil dikirim!');
        setShowDialog(false);
        resetForm();
        await loadApplications();
      } else {
        throw new Error(response.message || 'Gagal mengirim pengajuan');
      }
    } catch (err: any) {
      let errorMessage = 'Terjadi kesalahan saat mengirim pengajuan';
      
      // Check for validation errors
      if (err.response?.data?.errors?.validationErrors) {
        const validationErrors = err.response.data.errors.validationErrors;
        errorMessage = validationErrors
          .map((ve: any) => ve.messages.join(', '))
          .join('; ');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setStartDate('');
    setEndDate('');
    setReason('');
    setType('SICK');
    setAttachment(null);
  };

  const getStatusBadge = (status: 0 | 1 | 2) => {
    const config = {
      0: { label: 'Pending', variant: 'secondary' as const },
      1: { label: 'Approved', variant: 'default' as const },
      2: { label: 'Rejected', variant: 'destructive' as const },
    };
    const { label, variant } = config[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  const getTypeBadge = (type: string) => {
    return (
      <Badge variant={type === 'SICK' ? 'outline' : 'secondary'}>
        {type}
      </Badge>
    );
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
                  <BreadcrumbPage>Leave Application</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Leave Application</h1>
              <p className="text-muted-foreground">
                Manage your leave and sick leave applications
              </p>
            </div>
            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-1" />
                  Submit Leave/Sick
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Submit Leave/Sick</DialogTitle>
                  <DialogDescription>
                    Fill out the form to apply for leave or sick leave
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Type */}
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select value={type} onValueChange={(value) => setType(value as 'SICK' | 'LEAVE')}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih tipe" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SICK">SICK - Sakit</SelectItem>
                        <SelectItem value="LEAVE">LEAVE - Izin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Start Date */}
                  <div className="space-y-2">
                    <Label htmlFor="start_date">Start Date</Label>
                    <Input
                      id="start_date"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      required
                    />
                  </div>
                  {/* End Date */}
                  <div className="space-y-2">
                    <Label htmlFor="end_date">End Date</Label>
                    <Input
                      id="end_date"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      required
                    />
                  </div>
                  {/* Reason */}
                  <div className="space-y-2">
                    <Label htmlFor="reason">Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for leave/sick application"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      required
                      rows={4}
                    />
                  </div>
                  {/* Attachment */}
                  <div className="space-y-2">
                    <Label htmlFor="attachment">Attachment (Supporting Document)</Label>
                    <Input
                      id="attachment"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      onChange={handleFileChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Format: PDF, JPG, PNG, WEBP. Max 5MB
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
                      <X className="h-4 w-4" />
                      <span className="text-sm">{error}</span>
                    </div>
                  )}

                  <div className="flex justify-end gap-3">
                    <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                      {loading ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
          {/* Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8 w-full sm:w-auto flex-wrap">
              {/* Date Range */}
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-[160px]"
                  placeholder="Start date"
                />
                <span className="text-muted-foreground">to</span>
                <Input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-[160px]"
                  placeholder="End date"
                />
              </div>
              <div className="flex items-center gap-2">
                {/* Type Filter */}
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All Types</SelectItem>
                    <SelectItem value="SICK">Sick</SelectItem>
                    <SelectItem value="LEAVE">Leave</SelectItem>
                  </SelectContent>
                </Select>
                {/* Status Filter */}
                <Select value={filterStatus} onValueChange={setFilterStatus}>
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
          </div>
          {/* Applications Table */}
          {fetchLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
            </div>
          ) : (
            <div className="rounded-md border">
              {
                fetchLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Attachment</TableHead>
                        <TableHead>Created</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            {filterStartDate || filterEndDate || filterType !== 'ALL' || filterStatus !== 'ALL'
                              ? 'No applications found matching your filters'
                              : 'Belum ada pengajuan'}
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredApplications.map((app) => (
                          <TableRow key={app.employee_leave_application_id}>
                            <TableCell>{getTypeBadge(app.type)}</TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(app.start_date), 'dd MMM yyyy')} - {format(new Date(app.end_date), 'dd MMM yyyy')}
                            </TableCell>
                            <TableCell className="max-w-[200px] truncate">{app.reason}</TableCell>
                            <TableCell>{getStatusBadge(app.status)}</TableCell>
                            <TableCell>
                              {app.attachment_uri && (
                                <a
                                  href={getImageUrl(app.attachment_uri)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline flex items-center gap-1"
                                >
                                  <FileIcon className="h-4 w-4" />
                                  Open
                                </a>
                              )}
                            </TableCell>
                            <TableCell className="whitespace-nowrap">
                              {format(new Date(app.created_at), 'dd MMM yyyy')}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                )
              }
            </div>
          )}
          
          {/* Results Counter */}
          {!fetchLoading && filteredApplications.length > 0 && (
            <div className="text-sm text-muted-foreground">
              Showing {filteredApplications.length} of {applications.length} applications
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default EmployeeLeaveApplicationPage;
