import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { JSX, SVGProps } from "react"

export function Registry() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-background">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="grid gap-2">
          <div className="text-2xl font-bold">Registry</div>
          <p className="text-muted-foreground">Manage your company's records, documents, and archives.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="relative w-full max-w-md">
            <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full rounded-lg bg-muted pl-8 pr-4 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            />
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
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="#"
            className="flex h-full w-full flex-col items-start justify-between rounded-lg bg-card p-6"
            prefetch={false}
          >
            <div>
              <div className="mb-2 flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-lg p-2">
                <FileIcon className="h-5 w-5" />
                <span>Manage Documents</span>
              </div>
              <div className="mb-2 flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-lg p-2">
                <ArchiveIcon className="h-5 w-5" />
                <span>Maintain Archives</span>
              </div>
              <div className="mb-2 flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-lg p-2">
                <DatabaseIcon className="h-5 w-5" />
                <span>Track Records</span>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <span>Go to Registry</span>
              <ChevronRightIcon className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </div>
          </Link>
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
