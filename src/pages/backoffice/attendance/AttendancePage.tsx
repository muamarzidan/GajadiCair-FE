import { useState, useRef, useEffect } from 'react';
import { Camera, Clock, MapPin, Check, X, RefreshCw, Calendar } from 'lucide-react';
import { format } from 'date-fns';

import { 
  attendanceApi, 
  type TodayAttendanceStatus, 
  type AttendanceRecord,
  type CheckInEligibility,
  type CheckOutEligibility
} from '@/services/attendance';
import { faceRecognitionApi } from '@/services/faceRecognition';
import { profileApi } from '@/services/profile';
import type { GestureSelection, HandType } from '@/types/faceRecognition';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';


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
  const [checkInEligibility, setCheckInEligibility] = useState<CheckInEligibility | null>(null);
  const [checkOutEligibility, setCheckOutEligibility] = useState<CheckOutEligibility | null>(null);
  
  // Profile & Company settings
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [gestureEnabled, setGestureEnabled] = useState(false);
  const [levelPlan, setLevelPlan] = useState(0);
  
  // Gesture states
  const [allowedGestures, setAllowedGestures] = useState<string[]>([]);
  const [randomGesture, setRandomGesture] = useState<{ gesture: string; hand: HandType } | null>(null);
  const [gestureSelections, setGestureSelections] = useState<GestureSelection[]>([
    { gesture: '', hand: 'Left' },
  ]);

  useEffect(() => {
    loadEmployeeProfile();
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

  const loadEmployeeProfile = async () => {
    try {
      const response = await profileApi.getProfile();
      if (response.statusCode === 200) {
        setLocationEnabled(response.data.company.attendance_location_enabled);
        setGestureEnabled(response.data.company.recognize_with_gesture);
        setLevelPlan(response.data.company.level_plan);
        
        // Load gesture list only if gesture is enabled and level plan > 0
        if (response.data.company.recognize_with_gesture && response.data.company.level_plan > 0) {
          await loadGestureList(response.data.company.level_plan);
        }
      }
    } catch (err) {
      console.error('Failed to load employee profile:', err);
    }
  };

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

  const loadGestureList = async (level: number) => {
    try {
      const response = await faceRecognitionApi.getGestureList();
      if (response.statusCode === 200) {
        setAllowedGestures(response.data.allowed_gestures);
        
        // Level 1: Random pick 1 gesture + 1 hand from FE
        if (level === 1 && response.data.allowed_gestures.length > 0) {
          const randomGestureValue = response.data.allowed_gestures[
            Math.floor(Math.random() * response.data.allowed_gestures.length)
          ];
          const randomHand: HandType = Math.random() > 0.5 ? 'Left' : 'Right';
          setRandomGesture({ gesture: randomGestureValue, hand: randomHand });
        }
      }
    } catch (err) {
      console.error('Failed to load gesture list:', err);
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      setSuccess('');
      setGeoError('');

      // Check location permission only if location is enabled
      if (locationEnabled) {
        if (!navigator.geolocation) {
          throw new Error('Geolocation tidak didukung oleh browser Anda');
        }

        let locationPermission = 'unknown';
        try {
          const locPerm = await navigator.permissions.query({ name: 'geolocation' as PermissionName });
          locationPermission = locPerm.state;
        } catch (e) {
          console.error('Cannot check location permission:', e);
        }

        if (locationPermission === 'denied') {
          throw new Error(
            'Izin Lokasi ditolak. Mohon aktifkan di pengaturan browser:\n\n' +
            '1. Klik ikon gembok di sebelah kiri address bar browser anda\n' +
            '2. Pilih "Site settings" atau "Pengaturan situs"\n' +
            '3. Ubah izin "Location" menjadi "Allow"\n' +
            '4. Reload halaman dan coba lagi'
          );
        }

        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: false,
            timeout: 30000,
            maximumAge: 60000,
          });
        });

        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      } else {
        // Location not required, set dummy coords or null handling
        setCoords({ latitude: 0, longitude: 0 });
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media Devices API tidak didukung oleh browser Anda');
      }

      let cameraPermission = 'unknown';
      try {
        const camPerm = await navigator.permissions.query({ name: 'camera' as PermissionName });
        cameraPermission = camPerm.state;
      } catch (e) {
        console.error('Cannot check camera permission:', e);
      }

      if (cameraPermission === 'denied') {
        throw new Error(
          'Izin Kamera ditolak. Mohon aktifkan di pengaturan browser:\n\n' +
          '1. Klik ikon gembok di sebelah kiri address bar browser anda\n' +
          '2. Pilih "Site settings" atau "Pengaturan situs"\n' +
          '3. Ubah izin "Camera" menjadi "Allow"\n' +
          '4. Reload halaman dan coba lagi'
        );
      }

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

      // Prepare gesture data based on level plan and gesture enabled setting
      let gestures: string[] | undefined;
      let hands: string[] | undefined;

      if (gestureEnabled) {
        if (levelPlan === 1 && randomGesture) {
          // Level 1: Use random gesture picked by FE
          gestures = [randomGesture.gesture];
          hands = [randomGesture.hand];
        } else if (levelPlan === 2 && gestureSelections.length > 0) {
          // Level 2: User picks gestures
          const validSelections = gestureSelections.filter(s => s.gesture && s.hand);
          
          if (validSelections.length === 0) {
            throw new Error('Silakan pilih gesture dan hand yang diperlukan');
          }

          // Check for duplicate hands
          if (validSelections.length === 2) {
            if (validSelections[0].hand === validSelections[1].hand) {
              throw new Error('Tidak boleh memilih hand yang sama untuk kedua gesture');
            }
          }

          gestures = validSelections.map(s => s.gesture);
          hands = validSelections.map(s => s.hand);
        }
      }
      // If gestureEnabled is false or level 0: No gestures, remain undefined

      if (checkType === 'in') {
        const response = await attendanceApi.checkInFace(
          file, 
          coords.latitude, 
          coords.longitude,
          gestures,
          hands
        );
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
        const response = await attendanceApi.checkOutFace(
          file, 
          coords.latitude, 
          coords.longitude,
          gestures,
          hands
        );
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
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string; errors?: { message?: string } } }; message?: string };
      const errorMessage = 
        axiosError.response?.data?.message || 
        axiosError.response?.data?.errors?.message || 
        axiosError.message || 
        'Terjadi kesalahan saat memproses absensi';
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
    // Reset gesture selections when closing camera
    setGestureSelections([{ gesture: '', hand: 'Left' }]);
  };

  const handleCheckIn = async () => {
    setCheckType('in');
    setGestureSelections([{ gesture: '', hand: 'Left' }]);
    await startCamera();
  };

  const handleCheckOut = async () => {
    setCheckType('out');
    setGestureSelections([{ gesture: '', hand: 'Left' }]);
    await startCamera();
  };
  
  // Gesture selection helpers
  const addGestureSelection = () => {
    if (gestureSelections.length < 2) {
      const usedHand = gestureSelections[0].hand;
      const newHand: HandType = usedHand === 'Left' ? 'Right' : 'Left';
      setGestureSelections([...gestureSelections, { gesture: '', hand: newHand }]);
    }
  };
  
  const removeGestureSelection = (index: number) => {
    if (gestureSelections.length > 1) {
      setGestureSelections(gestureSelections.filter((_, i) => i !== index));
    }
  };
  
  const updateGestureSelection = (index: number, field: 'gesture' | 'hand', value: string) => {
    const updated = [...gestureSelections];
    updated[index] = { ...updated[index], [field]: value as HandType };
    setGestureSelections(updated);
  };
  
  const getStatusBadge = (status: string) => {
    const statusUpper = status.toUpperCase();
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PRESENT: 'default',
      ABSENT: 'destructive',
      SICK: 'secondary',
      LEAVE: 'outline',
    };
    return (
      <Badge variant={variants[statusUpper] || 'default'}>
        {statusUpper}
      </Badge>
    );
  };
  const formatDuration = (hours: number | null) => {
    if (!hours) return '-';
    const wholeHours = Math.floor(hours);
    const mins = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${mins}m`;
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
                Manage your attendance with facial recognition
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
          <Card className="!shadow-none"> 
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Today status
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
                  <Button 
                    onClick={handleCheckIn} 
                    disabled={loading || !checkInEligibility?.can_check_in} 
                    className="mt-2"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Check In
                  </Button>
                  {checkInEligibility && !checkInEligibility.can_check_in && checkInEligibility.reason && (
                    <p className="text-xs text-gray-500 mt-1">{checkInEligibility.reason}</p>
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
                    <p className="text-xs text-gray-500 mt-1">{checkOutEligibility.reason}</p>
                  )}
                </div>
              </div>

              {todayStatus?.work_duration_minutes && todayStatus.work_duration_minutes > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Durasi Kerja</span>
                    <span className="text-lg font-semibold">
                      {formatDuration(todayStatus.work_duration_minutes / 60)}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          {/* Camera Modal */}
          {showCamera && (
            <Card className="!shadow-none">
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

                {/* Gesture Section - Based on Level Plan and Gesture Enabled */}
                {gestureEnabled && levelPlan === 1 && randomGesture && (
                  <div className="space-y-2 p-4 border rounded-lg bg-blue-50">
                    <Label className="text-sm font-semibold">Gesture Recognition (Auto)</Label>
                    <div className="flex items-center gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Gesture:</span>
                        <span className="font-semibold">{randomGesture.gesture}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Hand:</span>
                        <span className="font-semibold">{randomGesture.hand}</span>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pastikan Anda melakukan gesture ini saat mengambil foto
                    </p>
                  </div>
                )}

                {gestureEnabled && levelPlan === 2 && allowedGestures.length > 0 && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-semibold">Gesture Recognition (Manual)</Label>
                      {gestureSelections.length < 2 && (
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addGestureSelection}
                        >
                          + Add Gesture
                        </Button>
                      )}
                    </div>
                    
                    {gestureSelections.map((selection, index) => (
                      <div key={index} className="flex gap-2 items-end">
                        <div className="flex-1">
                          <Label htmlFor={`gesture-${index}`} className="text-xs mb-1">
                            Gesture {index + 1}
                          </Label>
                          <Select
                            value={selection.gesture}
                            onValueChange={(value) => updateGestureSelection(index, 'gesture', value)}
                          >
                            <SelectTrigger id={`gesture-${index}`}>
                              <SelectValue placeholder="Select gesture" />
                            </SelectTrigger>
                            <SelectContent>
                              {allowedGestures.map((gesture) => (
                                <SelectItem key={gesture} value={gesture}>
                                  {gesture}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="w-32">
                          <Label htmlFor={`hand-${index}`} className="text-xs mb-1">
                            Hand
                          </Label>
                          <Select
                            value={selection.hand}
                            onValueChange={(value) => updateGestureSelection(index, 'hand', value)}
                          >
                            <SelectTrigger id={`hand-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Left">Left</SelectItem>
                              <SelectItem value="Right">Right</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        {gestureSelections.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeGestureSelection(index)}
                            className="mb-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
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
          <Card className="!shadow-none">
            <CardHeader>
              <CardTitle>Your past attendance records</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Check-In</TableHead>
                      <TableHead>Check-Out</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No attendance records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      attendanceHistory.map((record) => (
                        <TableRow key={record.employee_attendance_id}>
                          <TableCell>
                            {format(new Date(record.attendance_date), 'dd MMMM yyyy')}
                          </TableCell>
                          <TableCell>
                            {record.check_in_time
                              ? format(new Date(record.check_in_time), 'HH:mm:ss')
                              : '-'}
                          </TableCell>
                          <TableCell>
                            {record.check_out_time
                              ? format(new Date(record.check_out_time), 'HH:mm:ss')
                              : '-'}
                          </TableCell>
                          <TableCell>{formatDuration(record.total_work_hours)}</TableCell>
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
