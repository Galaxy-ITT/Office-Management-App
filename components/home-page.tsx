import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { JSX, SVGProps } from "react"


export function HomePage() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex-1 sm:ml-auto">
          <div className="relative">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-muted pl-8 pr-4 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="overflow-hidden rounded-full">
              <img
                src="/placeholder.svg"
                width={36}
                height={36}
                alt="Avatar"
                className="overflow-hidden rounded-full"
                style={{ aspectRatio: "36/36", objectFit: "cover" }}
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
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="group hover:bg-accent hover:text-accent-foreground">
            <Link href="#" className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
              <div>
                <div className="mb-2 text-2xl font-bold">Administrative</div>
                <p className="text-muted-foreground">Manage your office operations, employee records, and more.</p>
                <div className="mt-4 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  <span>Manage Employees</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  <span>Oversee Office Operations</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <FileTextIcon className="h-5 w-5" />
                  <span>Maintain Records</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span>Go to Admin</span>
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
          <Card className="group hover:bg-accent hover:text-accent-foreground">
            <Link href="#" className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
              <div>
                <div className="mb-2 text-2xl font-bold">Finance</div>
                <p className="text-muted-foreground">Track your company's financial performance and manage budgets.</p>
                <div className="mt-4 flex items-center gap-2">
                  <BarChartIcon className="h-5 w-5" />
                  <span>Monitor Financial Performance</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <DollarSignIcon className="h-5 w-5" />
                  <span>Manage Budgets</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ReceiptIcon className="h-5 w-5" />
                  <span>Track Expenses</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span>Go to Finance</span>
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
          <Card className="group hover:bg-accent hover:text-accent-foreground">
            <Link href="#" className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
              <div>
                <div className="mb-2 text-2xl font-bold">Registry</div>
                <p className="text-muted-foreground">Manage your company's records, documents, and archives.</p>
                <div className="mt-4 flex items-center gap-2">
                  <FileIcon className="h-5 w-5" />
                  <span>Manage Documents</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ArchiveIcon className="h-5 w-5" />
                  <span>Maintain Archives</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <DatabaseIcon className="h-5 w-5" />
                  <span>Track Records</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span>Go to Registry</span>
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
          <Card className="group hover:bg-accent hover:text-accent-foreground">
            <Link href="#" className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
              <div>
                <div className="mb-2 text-2xl font-bold">Human Resources</div>
                <p className="text-muted-foreground">Manage employee records, benefits, and company culture.</p>
                <div className="mt-4 flex items-center gap-2">
                  <UsersIcon className="h-5 w-5" />
                  <span>Manage Employee Records</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <BriefcaseIcon className="h-5 w-5" />
                  <span>Administer Benefits</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <SmileIcon className="h-5 w-5" />
                  <span>Foster Company Culture</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span>Go to HR</span>
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
          <Card className="group hover:bg-accent hover:text-accent-foreground">
            <Link href="#" className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
              <div>
                <div className="mb-2 text-2xl font-bold">IT</div>
                <p className="text-muted-foreground">Manage your company's technology infrastructure and support.</p>
                <div className="mt-4 flex items-center gap-2">
                  <ServerIcon className="h-5 w-5" />
                  <span>Manage IT Infrastructure</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <HeadphonesIcon className="h-5 w-5" />
                  <span>Provide Technical Support</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <CodeIcon className="h-5 w-5" />
                  <span>Develop Custom Solutions</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span>Go to IT</span>
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
          <Card className="group hover:bg-accent hover:text-accent-foreground">
            <Link href="#" className="flex h-full w-full flex-col items-start justify-between p-6" prefetch={false}>
              <div>
                <div className="mb-2 text-2xl font-bold">Marketing</div>
                <p className="text-muted-foreground">Manage your company's marketing campaigns and brand strategy.</p>
                <div className="mt-4 flex items-center gap-2">
                  <MegaphoneIcon className="h-5 w-5" />
                  <span>Manage Marketing Campaigns</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <PaletteIcon className="h-5 w-5" />
                  <span>Maintain Brand Identity</span>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <InfoIcon className="h-5 w-5" />
                  <span>Analyze Marketing Data</span>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <span>Go to Marketing</span>
                <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          </Card>
        </div>
      </main>
    </div>
  )
}

function ArchiveIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  )
}


function BarChartIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  )
}


function BriefcaseIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      <rect width="20" height="14" x="2" y="6" rx="2" />
    </svg>
  )
}


function ChevronRightIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}


function CodeIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  )
}


function DatabaseIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5V19A9 3 0 0 0 21 19V5" />
      <path d="M3 12A9 3 0 0 0 21 12" />
    </svg>
  )
}


function DollarSignIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}


function FileIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  )
}


function FileTextIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </svg>
  )
}


function HeadphonesIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
    </svg>
  )
}


function InfoIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  )
}


function MegaphoneIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  )
}


function PaletteIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )
}


function ReceiptIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  )
}


function SearchIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}


function ServerIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <line x1="6" x2="6.01" y1="6" y2="6" />
      <line x1="6" x2="6.01" y1="18" y2="18" />
    </svg>
  )
}


function SmileIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2" />
      <line x1="9" x2="9.01" y1="9" y2="9" />
      <line x1="15" x2="15.01" y1="9" y2="9" />
    </svg>
  )
}


function UsersIcon(props: JSX.IntrinsicAttributes & SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
