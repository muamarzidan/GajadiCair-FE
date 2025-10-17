import { Outlet } from "react-router-dom";
// import { DashboardNavbar } from "@/components/bo/DashboardNavbar";
// import { Sidebar } from "@/components/bo/Sidebar";

const DashboardLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout untuk dashboard/back office */}
      {/* <DashboardNavbar /> */}
      <div className="flex">
        {/* <Sidebar /> */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;