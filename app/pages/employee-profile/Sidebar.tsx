"use client"

import React, { useContext, useState } from "react";
import { UserContext } from "@/userContext/userContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  UserCircle, 
  ClipboardCheck, 
  Star, 
  CalendarDays,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const employeePages = [
  { name: 'Dashboard', icon: UserCircle },
  { name: 'Performance', icon: Star },
  { name: 'Leave Applications', icon: ClipboardCheck },
  { name: 'Personal Details', icon: CalendarDays },
];

export default function EmployeeSidebar({ activePage, setActivePage }: { activePage: string, setActivePage: (page: string) => void }) {
  const { userData } = useContext(UserContext);
  const router = useRouter();
  const { toast } = useToast();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    sessionStorage.clear();
    router.push("/");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  // Format current date
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className={cn(
      "h-screen flex flex-col bg-background border-r border-border transition-all duration-300",
      collapsed ? "w-[70px]" : "w-[250px]"
    )}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Welcome, {userData?.name || "Employee"}</p>
              <p className="text-xs text-muted-foreground">{currentDate}</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setCollapsed(!collapsed)}
            className={cn("", collapsed && "mx-auto")}
          >
            {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 py-4 overflow-y-auto">
        <nav className="space-y-1 px-2">
          {employeePages.map((page) => (
            <Button 
              key={page.name}
              variant="ghost" 
              className={cn(
                "w-full justify-start",
                collapsed ? "px-2" : "px-3",
                activePage === page.name && "bg-secondary"
              )}
              onClick={() => setActivePage(page.name)}
            >
              <page.icon className="h-4 w-4" />
              {!collapsed && <span className="ml-2">{page.name}</span>}
            </Button>
          ))}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 border-t">
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start",
            collapsed ? "px-2" : "px-3"
          )}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
} 