'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, AlertCircle } from 'lucide-react'

const users = [
  { username: "adminUser", password: "adminPass", role: "Admin" },
  { username: "employeeUser", password: "employeePass", role: "Employee" },
  { username: "hrAdminUser", password: "hrAdminPass", role: "HR Admin" },
  { username: "hrUser", password: "hrPass", role: "Human Resource" },
  { username: "superAdminUser", password: "superAdminPass", role: "Super Admin" }
];

function getRedirectPath(role:any) {
  switch (role) {
    case "Admin":
      return "/pages/admin";
    case "Employee":
      return "/pages/employee-profile";
    case "HR Admin":
      return "/pages/hr-admin";
    case "Human Resource":
      return "/pages/hr";
    case "HR":
      return "/pages/hr";
    case "Super Admin":
      return "/pages/super-admin";
    default:
      return "/login";
  }
}

export function AdminLoginComponent() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      router.push(getRedirectPath(user.role));
    } else {
      setError('Invalid username or password. Please try again.')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Admin Login</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access the admin panel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              />
              <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me
              </Label>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              <Lock className="mr-2 h-4 w-4" /> Login
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <p className="text-sm text-center text-gray-600 mt-4 w-full">
            Forgot your password? <a href="#" className="text-blue-600 hover:underline">Reset it here</a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
