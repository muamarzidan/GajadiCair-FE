import * as React from "react";

import { useAuth } from "@/contexts/AuthContext";
import {
  SquareTerminal,
  Users,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  
  const companyInfo = {
    name: user?.name || "Company",
    plan: user?.plan_expiration || "free",
  };
  const userData = {
    name: user?.name || "User",
    email: user?.email || "user@gajadicair.com", 
    avatar: user?.avatar_uri || "/avatars/shadcn.jpg",
    level_plan: user && 'level_plan' in user ? user.level_plan : 0,
  };
  
  // Role-based navigation items
  const navMain = React.useMemo(() => {
    const items = [
      {
        title: "Dashboard",
        url: "#",
        icon: SquareTerminal,
        items: [
          {
            title: "Overview",
            url: "/dashboard",
          }
        ],
      },
    ];
    
    // Only show Employee menu for company users
    if (user?.role === 'company') {
      items.push({
        title: "Employee",
        url: "#",
        icon: Users,
        items: [
          {
            title: "Overview",
            url: "/employee",
          },
        ],
      });
    }
    
    return items;
  }, [user?.role]);
  
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="grid flex-1 text-left text-sm leading-tight">
          <span className="truncate text-2xl font-bold">{companyInfo.name}</span>
          <span className="truncate text-xs">{companyInfo.plan}</span>
        </div>
      </SidebarHeader>
      <hr />
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
};