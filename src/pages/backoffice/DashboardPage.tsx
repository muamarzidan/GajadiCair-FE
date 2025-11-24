import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/app-sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card } from "@/components/ui/card"


export default function DashboardPage() {
  const { user } = useAuth();
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <DashboardContent user={user} />
      </SidebarInset>
    </SidebarProvider>
  );
};

function DashboardContent({ user }: { user: any }) {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator
            orientation="vertical"
            className="mr-2 data-[orientation=vertical]:h-4"
          />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  Dashboard
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Overview</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Selamat datang, {user?.name || 'Admin'}!</h1>
          <p className="text-muted-foreground">Berikut adalah ringkasan aktivitas hari ini</p>
        </div>

        {/* Stats Cards */}
        <div className="grid auto-rows-min gap-4 md:grid-cols-3">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Total Karyawan</h3>
            <p className="text-3xl font-bold text-primary">150</p>
            <p className="text-sm text-muted-foreground mt-2">+5 dari bulan lalu</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Hadir Hari Ini</h3>
            <p className="text-3xl font-bold text-green-600">142</p>
            <p className="text-sm text-muted-foreground mt-2">94.7% attendance rate</p>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-2">Tidak Hadir</h3>
            <p className="text-3xl font-bold text-red-600">8</p>
            <p className="text-sm text-muted-foreground mt-2">5.3% absence rate</p>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Aktivitas Terbaru</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm">John Doe melakukan check-in</span>
                <span className="text-xs text-muted-foreground ml-auto">08:30</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Jane Smith mengajukan cuti</span>
                <span className="text-xs text-muted-foreground ml-auto">10:15</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Payroll bulan ini telah diproses</span>
                <span className="text-xs text-muted-foreground ml-auto">14:20</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="grid gap-2">
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                + Tambah Karyawan Baru
              </button>
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                📊 Lihat Laporan Bulanan
              </button>
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                💰 Proses Payroll
              </button>
              <button className="text-left p-3 rounded-md hover:bg-muted transition-colors">
                ⚙️ Pengaturan Sistem
              </button>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
};