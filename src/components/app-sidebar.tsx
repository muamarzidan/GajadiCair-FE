import * as React from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  SquareTerminal,
  Users,
  Calendar,
  FileText,
  Receipt,
  TreePalm,
  DollarSign,
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { useSidebar } from "@/components/ui/sidebar";
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
  const { open } = useSidebar()
  
  const companyInfo = {
    name: user?.name,
    plan: user?.level_plan,
    company_identifier: user?.company_identifier,
    level_plan: user && 'level_plan' in user ? user.level_plan : 0,
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
          {
            title: "Summary",
            url: "/my-attendance-summary",
          },
        ],
      });
      items.push({
        title: "Application",
        url: "#",
        icon: FileText,
        items: [
          {
            title: "Overview",
            url: "/application",
          },
        ],
      });
      items.push({
        title: "Payroll",
        url: "#",
        icon: DollarSign,
        items: [
          {
            title: "History",
            url: "/my-payroll/history",
          },
          {
            title: "Summary",
            url: "/my-payroll/summary",
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
      items.push({
        title: "Attendance",
        url: "#",
        icon: Calendar,
        items: [
          {
            title: "Overview",
            url: "/attendance-overview",
          },
          {
            title: "Summary",
            url: "/attendance-summary",
          },
        ],
      });
      items.push({
        title: "Application",
        url: "#",
        icon: FileText,
        items: [
          {
            title: "Manage",
            url: "/application-management",
          },
        ],
      });
      items.push({
        title: "Payroll",
        url: "#",
        icon: DollarSign,
        items: [
          {
            title: "Overview",
            url: "/payroll-summary",
          },
          {
            title: "Allowance Rules",
            url: "/payroll-allowance-rules",
          },
          {
            title: "Deduction Rules",
            url: "/payroll-deduction-rules",
          },
        ],
      });      
      items.push({
        title: "Subscription",
        url: "#",
        icon: Receipt,
        items: [
          {
            title: "History",
            url: "/subscription-history",
          },
        ],
      }); 
      items.push({
        title: "Holiday",
        url: "#",
        icon: TreePalm,
        items: [
          {
            title: "Overview",
            url: "/holiday-preview",
          },
          {
            title: "Manage",
            url: "/holiday",
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
          <div className={`w-full items-center gap-3 ${open ? "flex" : "hidden"}`}>
            {
              user?.role === 'company' ? (
                <span className="truncate text-xs">{
                  companyInfo.plan === 0 ? 'Free' :
                  companyInfo.plan === 1 ? 'Basic' :
                  companyInfo.plan === 2 ? 'Pro' :
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
                {
                  open ? (
                    <span>Upgrade Plan</span>
                  ) : null
                }
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