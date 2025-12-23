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
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [geoError, setGeoError] = useState<string>('');
  const [checkInEligibility, setCheckInEligibility] = useState<any>(null);
  const [checkOutEligibility, setCheckOutEligibility] = useState<any>(null);

  useEffect(() => {
    loadTodayStatus();
    loadAttendanceHistory();
    loadEligibility();
  }, []);
  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      };
    };
  }, [stream]);

  const loadTodayStatus = async () => {
    try {
      const response = await attendanceApi.getTodayStatus();
      if (response.statusCode === 200) {
        setTodayStatus(response.data);
      };
    } catch (err) {
      console.error('Failed to load today status:', err);
    }
  };
  const loadAttendanceHistory = async () => {
    try {
      const response = await attendanceApi.getAttendanceHistories();
      if (response.statusCode === 200) {
        setAttendanceHistory(response.data);
      };
    } catch (err) {
      console.error('Failed to load attendance history:', err);
    }
  };
  const loadEligibility = async () => {
    try {
      const [checkInRes, checkOutRes] = await Promise.all([
        attendanceApi.checkInCheck(),
        attendanceApi.checkOutCheck(),
      ]);
      
      if (checkInRes.statusCode === 200) {
        setCheckInEligibility(checkInRes.data);
      }
      if (checkOutRes.statusCode === 200) {
        setCheckOutEligibility(checkOutRes.data);
      }
    } catch (err) {
      console.error('Failed to load eligibility:', err);
    }
  };
  const startCamera = async () => {
    try {
      setError('');
      setSuccess('');
      setGeoError('');

      if (!navigator.geolocation) {
        throw new Error('Geolocation tidak didukung oleh browser Anda');
      }
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media Devices API tidak didukung oleh browser Anda');
      }

      let locationPermission = 'unknown';
      let cameraPermission = 'unknown';

      try {
        const locPerm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
        locationPermission = locPerm.state;
      } catch (e) {
        console.error('Cannot check location permission:', e);
      }

      try {
        const camPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
        cameraPermission = camPerm.state;
      } catch (e) {
        console.error('Cannot check camera permission:', e);
      }

      const deniedPermissions = [];
      if (locationPermission === 'denied') {
        deniedPermissions.push('Lokasi');
      }
      if (cameraPermission === 'denied') {
        deniedPermissions.push('Kamera');
      }

      if (deniedPermissions.length > 0) {
        throw new Error(
          `Izin ${deniedPermissions.join(' dan ')} ditolak. Mohon aktifkan di pengaturan browser:\n\n` +
          `1. Klik ikon gembok di sebelah kiri address bar browser anda\n` +
          `2. Pilih "Site settings" atau "Pengaturan situs"\n` +
          `3. Ubah izin "Location" dan "Camera" menjadi "Allow"\n` +
          `4. Reload halaman dan coba lagi`
        );
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false, // Set false untuk lebih cepat
          timeout: 30000, // 30 detik timeout
          maximumAge: 60000, // Cache 1 menit OK
        });
      });

      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

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
        // Let the video play automatically without calling play()
        // to avoid "interrupted by new load request" error
      }
    } catch (err: any) {
      if (err.code === 1 || err.message?.includes('ditolak')) {
        setError(
          'Izin Lokasi ditolak. Mohon aktifkan akses lokasi:\n\n' +
          '1. Klik ikon gembok di sebelah kiri address bar browser anda\n' +
          '2. Pilih "Site settings" atau "Pengaturan situs"\n' +
          '3. Ubah "Location" menjadi "Allow"\n' +
          '4. Reload halaman dan coba lagi'
        );
      } else if (err.code === 2) {
        setError('Lokasi tidak tersedia. Mohon periksa pengaturan lokasi Anda.');
      } else if (err.code === 3) {
        setError('Timeout saat mendapatkan lokasi. Mohon coba lagi.');
      } else if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
        setError(
          'Izin Kamera ditolak. Mohon aktifkan akses kamera:\n\n' +
          '1. Klik ikon gembok di sebelah kiri address bar browser anda\n' +
          '2. Pilih "Site settings" atau "Pengaturan situs"\n' +
          '3. Ubah "Camera" menjadi "Allow"\n' +
          '4. Reload halaman dan coba lagi'
        );
      } else {
        const error = err as Error;
        setError(error.message || 'Gagal membuka kamera');
      }
    }
  };

  const captureAndSubmit = async () => {
    if (!videoRef.current || !canvasRef.current || !coords) {
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

      if (!video.videoWidth || !video.videoHeight) {
        throw new Error('Video belum siap');
      };

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

      if (checkType === 'in') {
        const response = await attendanceApi.checkInFace(file, coords.latitude, coords.longitude);
        if (response.statusCode === 200 || response.statusCode === 201) {
          setSuccess('Check-in berhasil!');
          await loadTodayStatus();
          await loadAttendanceHistory();
          await loadEligibility();
          closeCamera();
        } else {
          throw new Error(response.message || 'Check-in gagal');
        }
      } else {
        const response = await attendanceApi.checkOutFace(file, coords.latitude, coords.longitude);
        if (response.statusCode === 200 || response.statusCode === 201) {
          setSuccess('Check-out berhasil!');
          await loadTodayStatus();
          await loadAttendanceHistory();
          await loadEligibility();
          closeCamera();
        } else {
          throw new Error(response.message || 'Check-out gagal');
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Terjadi kesalahan';
      setError(errorMessage);
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
        {status?.toUpperCase()}
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
                    <>
                      <Button 
                        onClick={handleCheckIn} 
                        disabled={loading || !checkInEligibility?.can_check_in} 
                        className="mt-2"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Check In
                      </Button>
                      {checkInEligibility && !checkInEligibility.can_check_in && checkInEligibility.reason && (
                        <p className="text-xs text-red-500 mt-1">{checkInEligibility.reason}</p>
                      )}
                    </>
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
                    <>
                      <Button 
                        onClick={handleCheckOut} 
                        disabled={loading || !checkOutEligibility?.can_check_out} 
                        variant="outline" 
                        className="mt-2"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        Check Out
                      </Button>
                      {checkOutEligibility && !checkOutEligibility.can_check_out && checkOutEligibility.reason && (
                        <p className="text-xs text-red-500 mt-1">{checkOutEligibility.reason}</p>
                      )}
                    </>
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
                    muted
                    className="w-full h-full object-cover"
                  />
                  <canvas ref={canvasRef} className="hidden" />
                </div>

                {coords && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    Lokasi: {coords.latitude.toFixed(6)}, {coords.longitude.toFixed(6)}
                  </div>
                )}
                {geoError && (
                  <div className="flex items-center gap-2 text-sm text-red-500">
                    <MapPin className="h-4 w-4" />
                    {geoError}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={captureAndSubmit}
                    disabled={loading || !coords}
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
                            {
                              record.check_in_time ? (
                                format(new Date(record.check_in_time), 'dd MMMM yyyy')
                              ) : (
                                "-"
                              )
                            }
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
