import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, UserPlus } from "lucide-react"

const initialStaff = [
  { id: 1, name: "John Doe" },
  { id: 2, name: "Jane Smith" },
  { id: 3, name: "Bob Johnson" },
]

export function StaffSidebar({ onSelectStaff, onChangeView }) {
  const [staff, setStaff] = useState(initialStaff)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredStaff = staff.filter((s) => s.name.toLowerCase().includes(searchTerm.toLowerCase()))

  const addNewStaff = () => {
    const newStaff = { id: staff.length + 1, name: "New Staff Member" }
    setStaff([...staff, newStaff])
    onSelectStaff(newStaff)
    onChangeView("staff-details")
  }

  return (
    <div className="pb-12">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Staff Management</h2>
          <div className="space-y-1">
            <Button variant="secondary" className="w-full justify-start" onClick={() => onChangeView("dashboard")}>
              <Search className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </div>
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Staff List</h2>
          <div className="space-y-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <ScrollArea className="h-[300px]">
              {filteredStaff.map((s) => (
                <Button
                  key={s.id}
                  variant="ghost"
                  className="w-full justify-start font-normal"
                  onClick={() => {
                    onSelectStaff(s)
                    onChangeView("staff-details")
                  }}
                >
                  <span>{s.name}</span>
                </Button>
              ))}
            </ScrollArea>
            <Button onClick={addNewStaff} className="w-full mt-2">
              <UserPlus className="mr-2 h-4 w-4" />
              Add New Staff
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

