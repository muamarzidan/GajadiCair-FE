import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const DashboardPage = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // TODO: Implement logout logic
    navigate("/login");
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Button onClick={handleLogout} variant="outline">
          Logout
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Total Karyawan</h3>
          <p className="text-3xl font-bold text-primary">150</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Hadir Hari Ini</h3>
          <p className="text-3xl font-bold text-green-600">142</p>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-2">Tidak Hadir</h3>
          <p className="text-3xl font-bold text-red-600">8</p>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Selamat datang di Dashboard Gajadicair!</h3>
          <p className="text-muted-foreground">
            Ini adalah halaman dashboard untuk back office. Di sini Anda dapat mengelola:
          </p>
          <ul className="mt-4 space-y-2 text-muted-foreground">
            <li>• Manajemen karyawan</li>
            <li>• Absensi dan kehadiran</li>
            <li>• Penggajian dan payroll</li>
            <li>• Laporan dan analytics</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;