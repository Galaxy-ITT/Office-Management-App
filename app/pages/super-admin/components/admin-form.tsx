"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Admin = {
  id: string
  name: string
  email: string
  role: string
}

type AdminFormProps = {
  admin?: Admin
  onSave: (admin: Admin) => void
  onCancel: () => void
}

export function AdminForm({ admin, onSave, onCancel }: AdminFormProps) {
  const [name, setName] = useState(admin?.name || "")
  const [email, setEmail] = useState(admin?.email || "")
  const [role, setRole] = useState(admin?.role || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newAdmin = {
      id: admin?.id || Date.now().toString(),
      name,
      email,
      role,
    }
    onSave(newAdmin)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="role">Role</Label>
        <Select value={role} onValueChange={setRole} required>
          <SelectTrigger id="role">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Super Admin">Super Admin</SelectItem>
            <SelectItem value="Content Manager">Content Manager</SelectItem>
            <SelectItem value="Moderator">Moderator</SelectItem>
          </SelectContent>
        </Select>
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
