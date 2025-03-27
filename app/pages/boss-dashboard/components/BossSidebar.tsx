"use client"

import { useRouter } from "next/navigation"
import { FileText, FolderOpen, Home, LogOut, Users, PlusCircle, Clock, Search, Send, BarChart, UserCheck, ClipboardCheck, InboxIcon, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { useContext, useState } from "react"
import { UserContext } from "@/userContext/userContext"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface BossSidebarProps {
  onMenuSelect: (menu: string) => void
}

export function BossSidebar({ onMenuSelect }: BossSidebarProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { userData } = useContext(UserContext)
  const bossName = userData?.name || "Boss"
  const [searchQuery, setSearchQuery] = useState("")
  
  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Get initials from boss name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implement search functionality here
    console.log("Searching for:", searchQuery)
    toast({
      title: "Search initiated",
      description: `Searching for: ${searchQuery}`,
    })
  }

  const handleLogout = () => {
    sessionStorage.clear()
    // Redirect to login page
    router.push("/pages/admins-login")
    
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Avatar" />
            <AvatarFallback>{getInitials(bossName)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-sm font-semibold">Welcome, <br></br> {bossName}!</h2>
            <p className="text-xs text-muted-foreground">{currentDate}</p>
          </div>
        </div>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="mt-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow text-sm h-8"
            />
            <Button type="submit" variant="outline" size="sm" className="px-2">
              <Search className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Dashboard")}>
                  <Home className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Files")}>
                  <FileText className="h-4 w-4" />
                  <span>Files</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Search Records")}>
                  <Search className="h-4 w-4" />
                  <span>Search Records</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Performance")}>
                  <BarChart className="h-4 w-4" />
                  <span>Performance</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Staff Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Staff List")}>
                  <Users className="h-4 w-4" />
                  <span>Staff List</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Leave Requests")}>
                  <UserCheck className="h-4 w-4" />
                  <span>Leave Requests</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Recent Activities")}>
                  <Clock className="h-4 w-4" />
                  <span>Recent Activities</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Document Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("File Records")}>
                  <FolderOpen className="h-4 w-4" />
                  <span>File Records</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Create Document")}>
                  <PlusCircle className="h-4 w-4" />
                  <span>Create Document</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Forwarded Documents")}>
                  <Send className="h-4 w-4" />
                  <span>Forwarded Documents</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>Reviewed Records</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={() => onMenuSelect("Reviewed Records")}>
                  <ClipboardCheck className="h-4 w-4" />
                  <span>Reviewed Records</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
} 