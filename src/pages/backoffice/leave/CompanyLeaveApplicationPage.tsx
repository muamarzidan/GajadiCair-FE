import { useState, useEffect } from 'react';
import { Check, X, FileIcon, User } from 'lucide-react';
import { format } from 'date-fns';

import { companyLeaveApplicationApi } from '@/services/leaveApplication';
import type { LeaveApplication } from '@/types/leaveApplication';
import { getImageUrl } from '@/utils';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const CompanyLeaveApplicationPage = () => {
  const [applications, setApplications] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Dialog state
  const [showDialog, setShowDialog] = useState(false);
  const [selectedApp, setSelectedApp] = useState<LeaveApplication | null>(null);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await companyLeaveApplicationApi.getLeaveApplications();
      if (response.statusCode === 200) {
        setApplications(response.data);
      }
    } catch (err: any) {
      console.error('Failed to load applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = (app: LeaveApplication, action: 'approve' | 'reject') => {
    setSelectedApp(app);
    setDialogAction(action);
    setShowDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedApp) return;

    setActionLoading(true);
    setError('');
    setSuccess('');

    try {
      const data = {
        employee_leave_application_id: selectedApp.employee_leave_application_id,
        is_approve: dialogAction === 'approve',
      };

      const response = await companyLeaveApplicationApi.updateLeaveApplicationStatus(data);
      if (response.statusCode === 200) {
        setSuccess(`Pengajuan berhasil di${dialogAction === 'approve' ? 'setujui' : 'tolak'}!`);
        setShowDialog(false);
        await loadApplications();
      } else {
        throw new Error(response.message || 'Gagal memproses pengajuan');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setError(errorMessage);
    } finally {
      setActionLoading(false);
    }
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
                  <BreadcrumbPage>Leave Management</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Application Management</h1>
            <p className="text-muted-foreground">    
              Manage employee leave and sick leave applications
            </p>
          </div>
          {/* Success Message */}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}
          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {/* Applications Table */}
          <div className="rounded-md border">
            {
              loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Karyawan</TableHead>
                      <TableHead>Tipe</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Alasan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Lampiran</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          Belum ada pengajuan
                        </TableCell>
                      </TableRow>
                    ) : (
                      applications.map((app) => (
                        <TableRow key={app.employee_leave_application_id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage 
                                  src={app.employee?.avatar_uri ? getImageUrl(app.employee.avatar_uri) : undefined}
                                  alt={app.employee?.name || 'Employee'} 
                                />
                                <AvatarFallback>
                                  <User className="h-4 w-4" />
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium">{app.employee?.name || 'N/A'}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getTypeBadge(app.type)}</TableCell>
                          <TableCell className="whitespace-nowrap">
                            <div className="text-sm">
                              {format(new Date(app.start_date), 'dd MMM yyyy')} <br />
                              {format(new Date(app.end_date), 'dd MMM yyyy')}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[250px] truncate">{app.reason}</TableCell>
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
                                Lihat
                              </a>
                            )}
                          </TableCell>
                          <TableCell>
                            {app.status === 0 ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleAction(app, 'approve')}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Setujui
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleAction(app, 'reject')}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Tolak
                                </Button>
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )
            }
          </div>
        </div>

        {/* Confirmation Dialog */}
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {dialogAction === 'approve' ? 'Setujui' : 'Tolak'} Pengajuan
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin {dialogAction === 'approve' ? 'menyetujui' : 'menolak'} pengajuan {selectedApp?.type} dari {selectedApp?.employee?.name}?
              </DialogDescription>
            </DialogHeader>
            {selectedApp && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span>
                    {format(new Date(selectedApp.start_date), 'dd MMM yyyy')} - {format(new Date(selectedApp.end_date), 'dd MMM yyyy')}
                  </span>
                  <span className="text-muted-foreground">Alasan:</span>
                  <span>{selectedApp.reason}</span>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={actionLoading}>
                Batal
              </Button>
              <Button
                variant={dialogAction === 'approve' ? 'default' : 'destructive'}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Memproses...' : dialogAction === 'approve' ? 'Setujui' : 'Tolak'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default CompanyLeaveApplicationPage;
