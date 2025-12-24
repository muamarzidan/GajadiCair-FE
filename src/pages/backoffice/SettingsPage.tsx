import { useState, useEffect } from 'react';
import { Settings as Check, X, MapPin, Clock, Calendar, Navigation } from 'lucide-react';

import { useIsMobile } from '@/hooks/use-mobile';
import { attendanceSettingsApi } from '@/services/settings';
import { workingDayApi } from '@/services/workingDay';
import { getErrorMessage } from '@/utils';
import type { WorkingDay } from '@/types/workingDay';
import { MapPicker } from '@/components/shared/MapPicker';
import { AppSidebar } from '@/components/app-sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Checkbox } from '@/components/ui/checkbox';

const SettingsPage = () => {
  const isMobile = useIsMobile();
  
  // Helper function to extract time from ISO datetime or return empty string
  const extractTimeFromISO = (isoString: string | null): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      const hours = date.getUTCHours().toString().padStart(2, '0');
      const minutes = date.getUTCMinutes().toString().padStart(2, '0');
      return `${hours}:${minutes}`;
    } catch {
      return '';
    }
  };
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Form state
  const [minimumHoursPerDay, setMinimumHoursPerDay] = useState<number>(0);
  const [attendanceOpenTime, setAttendanceOpenTime] = useState('');
  const [attendanceCloseTime, setAttendanceCloseTime] = useState('');
  const [workStartTime, setWorkStartTime] = useState('');
  const [attendanceToleranceMinutes, setAttendanceToleranceMinutes] = useState<number>(0);
  const [payrollDayOfMonth, setPayrollDayOfMonth] = useState<number>(1);
  const [attendanceLocationEnabled, setAttendanceLocationEnabled] = useState(false);
  const [attendanceRadiusMeters, setAttendanceRadiusMeters] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  // Working day state
  const [workingDay, setWorkingDay] = useState<WorkingDay>({
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false,
  });

  useEffect(() => {
    loadSettings();
  }, []);

  // Auto-hide success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const loadSettings = async () => {
    try {
      setFetchLoading(true);
      // Load attendance settings
      const response = await attendanceSettingsApi.getSettings();
      if (response.statusCode === 200) {
        // Populate form with existing data
        setMinimumHoursPerDay(response.data.minimum_hours_per_day || 0);
        setAttendanceOpenTime(extractTimeFromISO(response.data.attendance_open_time));
        setAttendanceCloseTime(extractTimeFromISO(response.data.attendance_close_time));
        setWorkStartTime(extractTimeFromISO(response.data.work_start_time));
        setAttendanceToleranceMinutes(response.data.attendance_tolerance_minutes || 0);
        setAttendanceLocationEnabled(response.data.attendance_location_enabled || false);
        setAttendanceRadiusMeters(response.data.attendance_radius_meters || 0);
        setLatitude(response.data.attendance_location.latitude || 0);
        setLongitude(response.data.attendance_location.longitude || 0);
      }

      // Load working day settings
      const workingDayResponse = await workingDayApi.getWorkingDay();
      if (workingDayResponse.statusCode === 200) {
        setWorkingDay(workingDayResponse.data);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Gagal memuat settings'));
    } finally {
      setFetchLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation tidak didukung oleh browser Anda');
      return;
    }

    setLoadingLocation(true);
    setError('');
    setSuccess('');

    // Use high accuracy for better precision
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude: lat, longitude: lng, accuracy } = position.coords;
        setLatitude(lat);
        setLongitude(lng);
        
        // Warn if accuracy is too low
        if (accuracy > 1000) {
          setSuccess(`Lokasi didapatkan dengan akurasi rendah (±${accuracy.toFixed(0)}m). Untuk hasil terbaik, aktifkan GPS dan coba lagi di area terbuka.`);
        } else if (accuracy > 100) {
          setSuccess(`Lokasi berhasil didapatkan! (Akurasi: ±${accuracy.toFixed(0)}m)`);
        } else {
          setSuccess(`Lokasi berhasil didapatkan dengan akurasi tinggi! (±${accuracy.toFixed(0)}m)`);
        }
        
        setLoadingLocation(false);
      },
      (error) => {
        let errorMessage = 'Gagal mendapatkan lokasi';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Izin lokasi ditolak. Mohon klik "Allow" pada popup permission browser.';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Lokasi tidak tersedia. Aktifkan GPS/Location Services di device Anda.';
            break;
          case error.TIMEOUT:
            errorMessage = 'Timeout mendapatkan lokasi. Coba lagi atau pindah ke area dengan sinyal GPS lebih baik.';
            break;
        }
        setError(errorMessage);
        setLoadingLocation(false);
        console.error('Geolocation error:', error);
      },
      {
        enableHighAccuracy: true,   // Use GPS for better accuracy
        timeout: 15000,             // 15 detik timeout - balance antara speed dan accuracy
        maximumAge: 0,              // Always get fresh location
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validasi input
    if (minimumHoursPerDay < 0) {
      setError('Minimum jam kerja tidak boleh negatif');
      setLoading(false);
      return;
    }
    if (attendanceToleranceMinutes < 0) {
      setError('Toleransi keterlambatan tidak boleh negatif');
      setLoading(false);
      return;
    }
    if (payrollDayOfMonth < 1 || payrollDayOfMonth > 31) {
      setError('Tanggal gajian harus antara 1-31');
      setLoading(false);
      return;
    }
    if (attendanceRadiusMeters < 0) {
      setError('Radius absensi tidak boleh negatif');
      setLoading(false);
      return;
    }

    try {
      // Update attendance settings
      const attendanceData = {
        minimum_hours_per_day: minimumHoursPerDay,
        attendance_open_time: attendanceOpenTime,
        attendance_close_time: attendanceCloseTime,
        work_start_time: workStartTime,
        attendance_tolerance_minutes: attendanceToleranceMinutes,
        payroll_day_of_month: payrollDayOfMonth,
        attendance_location_enabled: attendanceLocationEnabled,
        attendance_radius_meters: attendanceRadiusMeters,
        latitude: latitude,
        longitude: longitude,
      };

      const response = await attendanceSettingsApi.updateSettings(attendanceData);
      if (response.statusCode !== 200) {
        throw new Error(response.message || 'Gagal update attendance settings');
      }

      // Update working day
      const workingDayResponse = await workingDayApi.updateWorkingDay(workingDay);
      if (workingDayResponse.statusCode !== 200) {
        throw new Error(workingDayResponse.message || 'Gagal update working day');
      }

      setSuccess('Settings berhasil diupdate!');
      await loadSettings();
    } catch (err) {
      setError(getErrorMessage(err, 'Terjadi kesalahan saat update settings'));
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-muted-foreground">Loading settings...</p>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    );
  }

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
                  <BreadcrumbPage>Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
              <p className="text-muted-foreground">
                Manage your company's attendance and payroll settings
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              {/* Working Hours Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Pengaturan Jam Kerja
                  </CardTitle>
                  <CardDescription>
                    Atur jam kerja dan toleransi keterlambatan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Minimum Hours Per Day */}
                  <div className="space-y-2">
                    <Label htmlFor="minimum_hours">Minimum Jam Kerja Per Hari</Label>
                    <Input
                      id="minimum_hours"
                      type="number"
                      min="0"
                      step="0.5"
                      placeholder="Contoh: 8"
                      value={minimumHoursPerDay}
                      onChange={(e) => setMinimumHoursPerDay(Math.max(0, Number(e.target.value)))}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Dalam satuan jam (contoh: 8 untuk 8 jam)
                    </p>
                  </div>

                  {/* Attendance Open Time */}
                  <div className="space-y-2">
                    <Label htmlFor="open_time">Jam Buka Absensi</Label>
                    <Input
                      id="open_time"
                      type="time"
                      value={attendanceOpenTime}
                      onChange={(e) => setAttendanceOpenTime(e.target.value)}
                    />
                  </div>

                  {/* Attendance Close Time */}
                  <div className="space-y-2">
                    <Label htmlFor="close_time">Jam Tutup Absensi</Label>
                    <Input
                      id="close_time"
                      type="time"
                      value={attendanceCloseTime}
                      onChange={(e) => setAttendanceCloseTime(e.target.value)}
                    />
                  </div>

                  {/* Work Start Time */}
                  <div className="space-y-2">
                    <Label htmlFor="work_start">Jam Mulai Kerja</Label>
                    <Input
                      id="work_start"
                      type="time"
                      value={workStartTime}
                      onChange={(e) => setWorkStartTime(e.target.value)}
                    />
                  </div>

                  {/* Tolerance Minutes */}
                  <div className="space-y-2">
                    <Label htmlFor="tolerance">Toleransi Keterlambatan (Menit)</Label>
                    <Input
                      id="tolerance"
                      type="number"
                      min="0"
                      placeholder="Contoh: 15"
                      value={attendanceToleranceMinutes}
                      onChange={(e) => setAttendanceToleranceMinutes(Math.max(0, Number(e.target.value)))}
                      required
                    />
                    {/* <p className="text-xs text-muted-foreground">
                      Dalam satuan menit (contoh: 15 untuk 15 menit)
                    </p> */}
                  </div>

                  {/* Payroll Day */}
                  <div className="space-y-2">
                    <Label htmlFor="payroll_day">Tanggal Gajian (1-31)</Label>
                    <Input
                      id="payroll_day"
                      type="number"
                      min="1"
                      max="31"
                      placeholder="Contoh: 25"
                      value={payrollDayOfMonth}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        setPayrollDayOfMonth(Math.min(31, Math.max(1, value)));
                      }}
                      required
                    />
                    {/* <p className="text-xs text-muted-foreground">
                      Tanggal penggajian setiap bulan
                    </p> */}
                  </div>
                </CardContent>
              </Card>

              {/* Location Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Pengaturan Lokasi Absensi
                  </CardTitle>
                  <CardDescription>
                    Atur lokasi dan radius untuk absensi berbasis lokasi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Enable Location */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="location_enabled"
                      checked={attendanceLocationEnabled}
                      onCheckedChange={(checked) => setAttendanceLocationEnabled(checked as boolean)}
                    />
                    <Label
                      htmlFor="location_enabled"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Aktifkan Absensi Berbasis Lokasi
                    </Label>
                  </div>

                  {attendanceLocationEnabled && (
                    <>
                      {/* Radius */}
                      <div className="space-y-2">
                        <Label htmlFor="radius">Radius Absensi (Meter)</Label>
                        <Input
                          id="radius"
                          type="number"
                          min="0"
                          placeholder="Contoh: 200"
                          value={attendanceRadiusMeters}
                          onChange={(e) => setAttendanceRadiusMeters(Math.max(0, Number(e.target.value)))}
                          required
                        />
                      </div>
                      {/* Map Picker */}
                      <div className="space-y-2">
                        <Label>Pilih Lokasi Kantor di Peta</Label>
                        <MapPicker
                          latitude={latitude}
                          longitude={longitude}
                          radius={attendanceRadiusMeters}
                          onLocationChange={(lat, lng) => {
                            setLatitude(lat);
                            setLongitude(lng);
                          }}
                        />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                          <div className="text-xs">
                            <span className="font-medium">Latitude:</span> {latitude.toFixed(7)}
                          </div>
                          <div className="text-xs">
                            <span className="font-medium">Longitude:</span> {longitude.toFixed(7)}
                          </div>
                        </div>
                        {isMobile && (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={getCurrentLocation}
                              disabled={loadingLocation}
                              className="w-full mt-2 gap-2"
                            >
                              <Navigation className={`h-4 w-4 ${loadingLocation ? 'animate-spin' : ''}`} />
                              {loadingLocation ? 'Mendapatkan Lokasi...' : 'Presisikan lokasi saya'}
                            </Button>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Working Day Settings */}
              <Card className="md:col-span-1 lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Hari Kerja
                  </CardTitle>
                  <CardDescription>
                    Pilih hari kerja aktif untuk karyawan
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    {/* Monday */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="monday"
                        checked={workingDay.monday}
                        onCheckedChange={(checked) =>
                          setWorkingDay({ ...workingDay, monday: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="monday"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Senin
                      </Label>
                    </div>

                    {/* Tuesday */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tuesday"
                        checked={workingDay.tuesday}
                        onCheckedChange={(checked) =>
                          setWorkingDay({ ...workingDay, tuesday: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="tuesday"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Selasa
                      </Label>
                    </div>

                    {/* Wednesday */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="wednesday"
                        checked={workingDay.wednesday}
                        onCheckedChange={(checked) =>
                          setWorkingDay({ ...workingDay, wednesday: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="wednesday"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Rabu
                      </Label>
                    </div>

                    {/* Thursday */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="thursday"
                        checked={workingDay.thursday}
                        onCheckedChange={(checked) =>
                          setWorkingDay({ ...workingDay, thursday: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="thursday"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Kamis
                      </Label>
                    </div>

                    {/* Friday */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="friday"
                        checked={workingDay.friday}
                        onCheckedChange={(checked) =>
                          setWorkingDay({ ...workingDay, friday: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="friday"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Jumat
                      </Label>
                    </div>

                    {/* Saturday */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="saturday"
                        checked={workingDay.saturday}
                        onCheckedChange={(checked) =>
                          setWorkingDay({ ...workingDay, saturday: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="saturday"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Sabtu
                      </Label>
                    </div>

                    {/* Sunday */}
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="sunday"
                        checked={workingDay.sunday}
                        onCheckedChange={(checked) =>
                          setWorkingDay({ ...workingDay, sunday: checked as boolean })
                        }
                      />
                      <Label
                        htmlFor="sunday"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Minggu
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={loading}>
                {loading ? 'Menyimpan...' : 'Simpan Pengaturan'}
              </Button>
            </div>
          </form>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SettingsPage;
