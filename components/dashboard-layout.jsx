'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  Users, 
  Settings, 
  HelpCircle,
  Search,
  Bell,
  ChevronRight
} from 'lucide-react'

export function DashboardLayoutComponent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className={`bg-white p-4 ${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 ease-in-out`}>
        <div className="flex items-center justify-between mb-6">
          <h1 className={`text-xl font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>Dashboard</h1>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <ChevronRight className={`h-6 w-6 transition-transform ${isSidebarOpen ? 'rotate-180' : ''}`} />
          </Button>
        </div>
        <nav className="space-y-2">
          <NavItem icon={<LayoutDashboard />} label="Dashboard" isOpen={isSidebarOpen} />
          <NavItem icon={<FileText />} label="Administrative" isOpen={isSidebarOpen} />
          <NavItem icon={<DollarSign />} label="Finance" isOpen={isSidebarOpen} />
          <NavItem icon={<Users />} label="Human Resources" isOpen={isSidebarOpen} />
          <NavItem icon={<Settings />} label="IT" isOpen={isSidebarOpen} />
          <NavItem icon={<HelpCircle />} label="Support" isOpen={isSidebarOpen} />
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2 w-96">
              <Search className="h-5 w-5 text-gray-500 mr-2" />
              <Input type="search" placeholder="Search..." className="border-none bg-transparent focus:outline-none" />
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
              <Avatar>
                <AvatarImage src="/placeholder-avatar.jpg" alt="User" />
                <AvatarFallback>U</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DashboardCard 
              title="Administrative" 
              description="Manage your office operations, employee records, and more."
            
              icon={<FileText className="h-6 w-6" />}
            />
            <DashboardCard 
              title="Finance" 
              description="Track your company's financial performance and manage budgets."
              icon={<DollarSign className="h-6 w-6" />}
            />
            <DashboardCard 
              title="Human Resources" 
              description="Manage employee records, benefits, and company culture."
              icon={<Users className="h-6 w-6" />}
            />
            {/* Add more cards as needed */}
          </div>
        </main>
      </div>
    </div>
  )
}


function NavItem({ icon, label, isOpen }) {
  return (
    <Link href="#" className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition-colors">
      {icon}
      {isOpen && <span className="ml-3">{label}</span>}
    </Link>
  )
}

function DashboardCard({ title, description, icon }) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href="/registry" >
             {icon}
        </Link>
      </div>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button variant="outline" className="w-full justify-between">
        Go to {title}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </Card>
  )
}