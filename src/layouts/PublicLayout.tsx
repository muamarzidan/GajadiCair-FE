import { Outlet } from "react-router-dom";

const PublicLayout = () => {
  return (
    <div className="min-h-screen">
      {/* Layout untuk halaman publik (landing page, dll) */}
      <Outlet />
    </div>
  );
};

export default PublicLayout;