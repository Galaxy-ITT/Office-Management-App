"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveAdmins } from "@/server-side/saveAdmins"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "./ui/use-toast"

type Admin = {
  id: string
  name: string
  email: string
  role: string
  username: string
  password: string
}

type AdminFormProps = {
  admin?: Admin
  onSave: (admin?: Admin) => void
  onCancel: () => void
}

export function AdminForm({ admin, onSave, onCancel }: AdminFormProps) {
  const [name, setName] = useState(admin?.name || "")
  const [email, setEmail] = useState(admin?.email || "")
  const [role, setRole] = useState(admin?.role || "")
  const [username, setUsername] = useState(admin?.username || "")
  const [password, setPassword] = useState(admin?.password || "")
  const [error, setError] = useState<{ username?: string; email?: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent, edit = false, del = false) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("role", role)
      formData.append("username", username)
      formData.append("password", password)

      if (admin?.id) {
        formData.append("id", admin.id)
      }

      console.log("📝 FormData submitted:")
      formData.forEach((value, key) => console.log(`${key}: ${value}`))

      const result = await saveAdmins(formData, edit, del)

      if (result.success) {
        if (!edit && !del) {
          toast({
            title: "Admin Created",
            description: `${name} has been successfully added as an admin.`,
            variant: "success",
          })

          onSave({
            id: Date.now().toString(),
            name,
            email,
            role,
            username,
            password,
          })
        } else if (edit) {
          toast({
            title: "Admin Updated",
            description: `${name}'s information has been successfully updated.`,
            variant: "success",
          })
          onSave()
        } else if (del) {
          toast({
            title: "Admin Deleted",
            description: `${name} has been removed from the system.`,
            variant: "destructive",
          })
          onSave()
        }
      } else {
        if (result.error === "Username already exists") {
          setError({ username: result.error })
          toast({
            title: "Error",
            description: "Username already exists. Please choose a different username.",
            variant: "destructive",
          })
        } else if (result.error === "Email already exists") {
          setError({ email: result.error })
          toast({
            title: "Error",
            description: "Email already exists. Please use a different email address.",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Error",
            description: result.error || "Failed to save admin. Please try again.",
            variant: "destructive",
          })
        }
      }
    } catch (err) {
      console.error("Error submitting form:", err)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!admin
  const formTitle = isEditing ? "Edit Admin" : "Add New Admin"
  const formDescription = isEditing ? "Update the administrator's information" : "Create a new administrator account"

  return (
    <Card>
      <CardHeader>
        <CardTitle>{formTitle}</CardTitle>
        <CardDescription>{formDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={(e) => handleSubmit(e, isEditing, false)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                required
              />
              {error?.email && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.email}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Boss">Boss</SelectItem>
                  <SelectItem value="Registry">Registry</SelectItem>
                  <SelectItem value="Human Resource">Human Resource</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="Employee">Employee</SelectItem>
                  <SelectItem value="Super Admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="johndoe"
                required
              />
              {error?.username && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error.username}</AlertDescription>
                </Alert>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEditing ? "Leave blank to keep current password" : "Enter password"}
                required={!isEditing}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
              Cancel
            </Button>

            {isEditing ? (
              <>
                <Button
                  type="button"
                  variant="default"
                  onClick={(e) => handleSubmit(e, true, false)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Updating..." : "Update Admin"}
                </Button>
                <Button
                  type="button"
                  variant="destructive"
                  onClick={(e) => handleSubmit(e, false, true)}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Deleting..." : "Delete Admin"}
                </Button>
              </>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Admin"}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

