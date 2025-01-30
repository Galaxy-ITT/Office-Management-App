"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"

type Role = {
  id: string
  name: string
  permissions: string[]
}

type RoleFormProps = {
  role?: Role
  onSave: (role: Role) => void
  onCancel: () => void
}

const allPermissions = [
  "Create Content",
  "Edit Content",
  "Delete Content",
  "Moderate Comments",
  "Ban Users",
  "Manage Admins",
  "Manage Roles",
]

export function RoleForm({ role, onSave, onCancel }: RoleFormProps) {
  const [name, setName] = useState(role?.name || "")
  const [permissions, setPermissions] = useState<string[]>(role?.permissions || [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: role?.id || Date.now().toString(),
      name,
      permissions,
    })
  }

  const handlePermissionChange = (permission: string) => {
    setPermissions((current) =>
      current.includes(permission) ? current.filter((p) => p !== permission) : [...current, permission],
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Role Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label>Permissions</Label>
        <div className="space-y-2">
          {allPermissions.map((permission) => (
            <div key={permission} className="flex items-center space-x-2">
              <Checkbox
                id={permission}
                checked={permissions.includes(permission)}
                onCheckedChange={() => handlePermissionChange(permission)}
              />
              <Label htmlFor={permission}>{permission}</Label>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  )
}

