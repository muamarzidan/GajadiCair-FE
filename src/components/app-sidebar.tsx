import * as React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  SquareTerminal,
  Users,
  Calendar,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Button } from  "./ui/button";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuth()
  
  const companyInfo = {
    name: user?.name,
    plan: user?.level_plan,
    company_identifier: user?.company_identifier,
    level_plan: user && 'level_plan' in user ? user.level_plan : 1,
  };
  const userData = {
    name: user?.name || "User",
    username: user?.username || "username",
    email: user?.email || "hacker@gmail.com", 
    avatar: user?.avatar_uri || "",
  };
  
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
    
    if (user?.role === 'employee') {
      items.push({
        title: "Attendance",
        url: "#",
        icon: Calendar,
        items: [
          {
            title: "My Attendance",
            url: "/attendance",
          },
        ],
      });
    };
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
    };
    
    return items;
  }, [user?.role]);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="grid flex-1 text-left text-sm leading-tight gap-2">
          {
            user?.role === 'company' ? (
              <span className="truncate text-xl font-bold">{companyInfo.name}</span>
            ) : (
              <span className="truncate text-xl font-bold">{userData.username}</span>
            )
          }
          <div className="w-full flex items-center gap-3">
            {
              user?.role === 'company' ? (
                <span className="truncate text-xs">{
                  companyInfo.plan === 1 ? 'Free' :
                  companyInfo.plan === 2 ? 'Basic' :
                  companyInfo.plan === 3 ? 'Pro ' :
                  'Free Plan'
                  }
                </span>
              ) : null
            }
            {
              user?.role === 'company' ? (
                <>
                  <div className="w-0.5 bg-black/40 h-full"></div>
                  <span className="truncate">
                    {companyInfo.company_identifier}
                  </span>
                </>
              ) : null
            }
          </div>
        </div>
      </SidebarHeader>
      <hr />
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        {
          user?.role === 'company' && (
            <Link to="/upgrade" className="w-full">
              <Button variant="pro" size="lg" className="!rounded-xl w-full text-white !p-10 text-xl font-bold mb-4">
                <Sparkles className="h-8 w-8" />
                <span>Upgrade Plan</span>
              </Button>
            </Link>
          )
        }
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  ) 
};