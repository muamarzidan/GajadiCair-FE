import { useState, useRef, useEffect } from 'react';
import { Camera, Clock, MapPin, Check, X, RefreshCw, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { attendanceApi, type TodayAttendanceStatus, type AttendanceRecord } from '@/services/attendance';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

const AttendancePage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [todayStatus, setTodayStatus] = useState<TodayAttendanceStatus | null>(null);
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [checkType, setCheckType] = useState<'in' | 'out'>('in');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Load initial data
  useEffect(() => {
    loadTodayStatus();
    loadAttendanceHistory();
  }, []);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  const loadTodayStatus = async () => {
    try {
      const response = await attendanceApi.getTodayStatus();
      if (response.statusCode === 200) {
        setTodayStatus(response.data);
      }
    } catch (err) {
      console.error('Failed to load today status:', err);
    }
  };

  const loadAttendanceHistory = async () => {
    try {
      const response = await attendanceApi.getAttendanceHistories();
      if (response.statusCode === 200) {
        setAttendanceHistory(response.data);
      }
    } catch (err) {
      console.error('Failed to load attendance history:', err);
    }
  };

  const getGeolocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation tidak didukung oleh browser Anda'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(new Error('Gagal mendapatkan lokasi: ' + error.message));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  };

  const startCamera = async () => {
    try {
      setError('');
      setSuccess('');

      // Get location first
      const coords = await getGeolocation();
      setLocation(coords);

      // Get camera stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      setStream(mediaStream);
      setShowCamera(true);

      // Wait for next render
      await new Promise(resolve => setTimeout(resolve, 100));

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Gagal membuka kamera');
    }
  };

  const captureAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current || !location) {
      setError('Kamera atau lokasi belum siap');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Canvas context tidak tersedia');
      }

      // Check video dimensions
      if (!video.videoWidth || !video.videoHeight) {
        throw new Error('Video belum siap');
      }

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.95);
      });

      if (!blob) {
        throw new Error('Gagal membuat foto');
      }

      const file = new File([blob], `attendance_${checkType}_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

      // Submit check in/out
      if (checkType === 'in') {
        const response = await attendanceApi.checkInFace(file, location.latitude, location.longitude);
        if (response.statusCode === 200 || response.statusCode === 201) {
          setSuccess('Check-in berhasil!');
          await loadTodayStatus();
          await loadAttendanceHistory();
          closeCamera();
        } else {
          throw new Error(response.message || 'Check-in gagal');
        }
      } else {
        const response = await attendanceApi.checkOutFace(file, location.latitude, location.longitude);
        if (response.statusCode === 200 || response.statusCode === 201) {
          setSuccess('Check-out berhasil!');
          await loadTodayStatus();
          await loadAttendanceHistory();
          closeCamera();
        } else {
          throw new Error(response.message || 'Check-out gagal');
        }
      }
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowCamera(false);
    setLocation(null);
  };

  const handleCheckIn = async () => {
    setCheckType('in');
    await startCamera();
  };

  const handleCheckOut = async () => {
    setCheckType('out');
    await startCamera();
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      present: 'default',
      late: 'secondary',
      absent: 'destructive',
      'half-day': 'outline',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDuration = (minutes: number | null) => {
    if (!minutes) return '-';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
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
                  <BreadcrumbPage>Attendance</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>
              <p className="text-muted-foreground">
                Kelola absensi Anda dengan face recognition
              </p>
            </div>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center gap-2 text-red-700">
              <X className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
          {success && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2 text-green-700">
              <Check className="h-4 w-4" />
              <span className="text-sm">{success}</span>
            </div>
          )}

          {/* Today's Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Status Hari Ini
              </CardTitle>
              <CardDescription>
                {format(new Date(), 'EEEE, dd MMMM yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Check-In
                  </div>
                  <div className="text-2xl font-bold">
                    {todayStatus?.check_in_time
                      ? format(new Date(todayStatus.check_in_time), 'HH:mm:ss')
                      : '-'}
                  </div>
                  {!todayStatus?.has_checked_in && (
                    <Button onClick={handleCheckIn} disabled={loading} className="mt-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Check In
                    </Button>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Check-Out
                  </div>
                  <div className="text-2xl font-bold">
                    {todayStatus?.check_out_time
                      ? format(new Date(todayStatus.check_out_time), 'HH:mm:ss')
                      : '-'}
                  </div>
                  {todayStatus?.has_checked_in && !todayStatus?.has_checked_out && (
                    <Button onClick={handleCheckOut} disabled={loading} variant="outline" className="mt-2">
                      <Camera className="h-4 w-4 mr-2" />
                      Check Out
                    </Button>
                  )}
                </div>
              </div>

              {todayStatus?.work_duration_minutes && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Durasi Kerja</span>
                    <span className="text-lg font-semibold">
                      {formatDuration(todayStatus.work_duration_minutes)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Camera Modal */}
          {showCamera && (
            <Card className="border-primary">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>
                    {checkType === 'in' ? 'Check In' : 'Check Out'} - Ambil Foto
                  </span>
                  <Button variant="ghost" size="sm" onClick={closeCamera} disabled={loading}>
                    <X className="h-4 w-4" />
                  </Button>
                </CardTitle>
                <CardDescription>
                  Pastikan wajah Anda terlihat jelas di kamera
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Lokasi: {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={captureAndSubmit}
                    disabled={loading || !location}
                    className="flex-1"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Submit {checkType === 'in' ? 'Check In' : 'Check Out'}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attendance History */}
          <Card>
            <CardHeader>
              <CardTitle>Riwayat Absensi</CardTitle>
              <CardDescription>
                Histori absensi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Durasi</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Belum ada data absensi
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceHistory.map((record) => (
                        <TableRow key={record.attendance_id}>
                          <TableCell>
                            {format(new Date(record.check_in_time), 'dd MMM yyyy')}
                          </TableCell>
                          <TableCell>
                            {format(new Date(record.check_in_time), 'HH:mm:ss')}
                          </TableCell>
                          <TableCell>
                            {record.check_out_time
                              ? format(new Date(record.check_out_time), 'HH:mm:ss')
                              : '-'}
                          </TableCell>
                          <TableCell>{formatDuration(record.work_duration_minutes)}</TableCell>
                          <TableCell>{getStatusBadge(record.status)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AttendancePage;
