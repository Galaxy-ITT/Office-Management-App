"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { saveAdmins } from "@/server-side/saveAdmins";

type Admin = {
  id: string;
  name: string;
  email: string;
  role: string;
  username: string;
  password: string;
};

type AdminFormProps = {
  admin?: Admin;
  onSave: (admin: Admin) => void;
  onCancel: () => void;
};

export function AdminForm({ admin, onSave, onCancel }: AdminFormProps) {
  const [name, setName] = useState(admin?.name || "");
  const [email, setEmail] = useState(admin?.email || "");
  const [role, setRole] = useState(admin?.role || "");
  const [username, setUsername] = useState(admin?.username || "");
  const [password, setPassword] = useState(admin?.password || "");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Create FormData
    const formData = new FormData();
    formData.append("id", admin?.id || Date.now().toString());
    formData.append("name", name);
    formData.append("email", email);
    formData.append("role", role);
    formData.append("username", username);
    formData.append("password", password);

    // Log FormData for debugging
    console.log("📝 FormData submitted:");
    formData.forEach((value, key) => console.log(`${key}: ${value}`));

    // Send to saveAdmins function
    await saveAdmins(formData);

    // Call onSave with the new admin data
    onSave({
      id: formData.get("id") as string,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      role: formData.get("role") as string,
      username: formData.get("username") as string,
      password: formData.get("password") as string,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            <SelectItem value="Boss">Boss</SelectItem>
            <SelectItem value="Registry">Registry</SelectItem>
            <SelectItem value="Human Resource">Human Resource</SelectItem>
            <SelectItem value="HOD">HOD</SelectItem>
            <SelectItem value="Employee">Employee</SelectItem>
            <SelectItem value="Others">Others</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="username">Username</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div>
        <Label htmlFor="password">Password</Label>
        <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}
