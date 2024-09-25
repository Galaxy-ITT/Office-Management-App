"use client";

import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { FaUser, FaChartBar, FaBriefcase, FaChevronRight, FaCode, FaDatabase, FaDollarSign, FaFileAlt, FaHeadphones, FaSmile, FaUsers, FaSearch, FaBars, FaMegaphone, FaPalette, FaInfoCircle, FaFileArchive, FaServer } from "react-icons/fa";

export function Home_Page() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-14 items-center justify-between bg-background px-4 shadow-md">
        {/* Sidebar Trigger */}
        <div className="flex items-center gap-4">
          <SidebarToggle />
          <h1 className="text-xl font-bold">Dashboard</h1>
        </div>
        {/* Search Input */}
        <div className="relative max-w-md">
          <FaSearch className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-lg bg-muted pl-10 pr-4 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
        </div>
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <img
                src="/placeholder.svg"
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden rounded-full"
                style={{ aspectRatio: "1/1", objectFit: "cover" }}
              />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-background border-r p-4">
          <nav className="flex flex-col space-y-4">
            <SidebarLink href="#" label="Administrative" icon={<FaUsers />} />
            <SidebarLink href="#" label="Finance" icon={<FaChartBar />} />
            <SidebarLink href="registry" label="Registry" icon={<FaFileAlt />} />
            <SidebarLink href="#" label="Human Resources" icon={<FaUsers />} />
            <SidebarLink href="#" label="IT" icon={<FaServer />} />
            <SidebarLink href="#" label="Marketing" icon={<FaMegaphone />} />
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DashboardCard
              title="Administrative"
              description="Manage your office operations, employee records, and more."
              actions={[
                { icon: <FaUser />, label: "Manage Employees" },
                { icon: <FaBriefcase />, label: "Oversee Office Operations" },
                { icon: <FaFileAlt />, label: "Maintain Records" },
              ]}
              linkLabel="Go to Admin"
              linkHref="#"
            />
            <DashboardCard
              title="Finance"
              description="Track your company's financial performance and manage budgets."
              actions={[
                { icon: <FaChartBar />, label: "Monitor Financial Performance" },
                { icon: <FaDollarSign />, label: "Manage Budgets" },
                { icon: <FaFileAlt />, label: "Track Expenses" },
              ]}
              linkLabel="Go to Finance"
              linkHref="#"
            />
            <DashboardCard
              title="Registry"
              description="Manage your company's records, documents, and archives."
              actions={[
                { icon: <FaFileAlt />, label: "Manage Documents" },
                { icon: <FaFileArchive />, label: "Maintain Archives" },
                { icon: <FaDatabase />, label: "Track Records" },
              ]}
              linkLabel="Go to Registry"
              linkHref="registry"
            />
            <DashboardCard
              title="Human Resources"
              description="Manage employee records, benefits, and company culture."
              actions={[
                { icon: <FaUsers />, label: "Manage Employee Records" },
                { icon: <FaBriefcase />, label: "Administer Benefits" },
                { icon: <FaSmile />, label: "Foster Company Culture" },
              ]}
              linkLabel="Go to HR"
              linkHref="#"
            />
            <DashboardCard
              title="IT"
              description="Manage your company's technology infrastructure and support."
              actions={[
                { icon: <FaServer />, label: "Manage IT Infrastructure" },
                { icon: <FaHeadphones />, label: "Provide Technical Support" },
                { icon: <FaCode />, label: "Develop Custom Solutions" },
              ]}
              linkLabel="Go to IT"
              linkHref="#"
            />
            <DashboardCard
              title="Marketing"
              description="Manage your company's marketing campaigns and brand strategy."
              actions={[
                { icon: <FaMegaphone />, label: "Manage Marketing Campaigns" },
                { icon: <FaPalette />, label: "Maintain Brand Identity" },
                { icon: <FaInfoCircle />, label: "Analyze Marketing Data" },
              ]}
              linkLabel="Go to Marketing"
              linkHref="#"
            />
          </div>
        </main>
      </div>
    </div>
  );
}

// Dashboard Card Component
function DashboardCard({ title, description, actions, linkLabel, linkHref }) {
  return (
    <Card className="group hover:bg-accent hover:text-accent-foreground transition-shadow shadow-md hover:shadow-lg rounded-lg">
      <Link href={linkHref} className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
        <div>
          <div className="mb-2 text-2xl font-bold">{title}</div>
          <p className="text-muted-foreground mb-4">{description}</p>
          <div className="space-y-2">
            {actions.map((action, index) => (
              <div key={index} className="flex items-center gap-2">
                {action.icon}
                <span>{action.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2">
          <span>{linkLabel}</span>
          <FaChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </div>
      </Link>
    </Card>
  );
}

// Sidebar Link Component
function SidebarLink({ href, label, icon }) {
  return (
    <Link href={href} className="flex items-center gap-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground p-2 rounded-lg transition">
      <div className="w-6 h-6">{icon}</div>
      <span>{label}</span>
    </Link>
  );
}

// Sidebar Toggle Component (Optional if you plan to make the sidebar collapsible)
function SidebarToggle() {
  return (
    <button className="text-muted-foreground hover:text-accent-foreground transition">
      <FaBars />
    </button>
  );
}
