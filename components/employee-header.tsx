import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function EmployeeHeader() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src="/placeholder.svg" alt="John Doe" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">John Doe</h1>
            <p className="text-lg text-gray-600">Senior Software Developer</p>
            <p className="text-sm text-gray-500">Engineering • EMP001</p>
          </div>
        </div>
      </div>
    </header>
  )
}

