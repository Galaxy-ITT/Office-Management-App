'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

export function DashboardLayoutComponent() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const router = useRouter()

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const navItems = [
    { icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard", href: "/" },
    { icon: <FileText className="h-5 w-5" />, label: "Administrative", href: "/administrative" },
    { icon: <DollarSign className="h-5 w-5" />, label: "Finance", href: "/finance" },
    { icon: <Users className="h-5 w-5" />, label: "Human Resources", href: "/hr" },
    { icon: <Settings className="h-5 w-5" />, label: "IT", href: "/it" },
    { icon: <HelpCircle className="h-5 w-5" />, label: "Support", href: "/support" },
  ]

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside 
        className={`bg-indigo-700 text-white transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-600">
          <h1 className={`text-xl font-bold ${isSidebarOpen ? 'block' : 'hidden'}`}>OfficeHub</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="text-white hover:bg-indigo-600"
          >
            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
        <nav className="space-y-2 p-4">
          {navItems.map((item) => (
            <Link 
              key={item.href} 
              href={item.href}
              className="flex items-center p-2 rounded-lg hover:bg-indigo-600 transition-colors"
            >
              {item.icon}
              {isSidebarOpen && <span className="ml-3">{item.label}</span>}
            </Link>
          ))}
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
                <AvatarFallback>JD</AvatarFallback>
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
              icon={<FileText className="h-6 w-6 text-indigo-600" />}
              href="/administrative"
            />
            <DashboardCard 
              title="Finance" 
              description="Track your company's financial performance and manage budgets."
              icon={<DollarSign className="h-6 w-6 text-green-600" />}
              href="/finance"
            />
            <DashboardCard 
              title="Human Resources" 
              description="Manage employee records, benefits, and company culture."
              icon={<Users className="h-6 w-6 text-blue-600" />}
              href="/hr"
            />
          </div>
        </main>
      </div>
    </div>
  )
}

function DashboardCard({ title, description, icon, href }) {
  const router = useRouter()

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full justify-between"
          onClick={() => router.push(href)}
        >
          Go to {title}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </CardFooter>
    </Card>
  )
}