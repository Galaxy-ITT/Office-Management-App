"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import styles from "./layout.module.css"

interface AdminLayoutProps {
  children: React.ReactNode
  adminName: string
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, adminName }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [loginTime, setLoginTime] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const now = new Date()
    setLoginTime(now.toLocaleString())
  }, [])

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const handleLogout = () => {
    // Implement your logout logic here
    // For example, clear local storage, cookies, etc.
    router.push("/")
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Admin Dashboard</h1>
      </header>
      <button className={styles.sidebarToggle} onClick={toggleSidebar}>
        {isSidebarOpen ? "←" : "→"}
      </button>
      <aside className={`${styles.sidebar} ${!isSidebarOpen ? styles.sidebarCollapsed : ""}`}>
        <div className={styles.sidebarContent}>
          <h2>Welcome, {adminName}</h2>
          <p>Login Time: {loginTime}</p>
          <button className={styles.logoutButton} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>
      <main className={`${styles.content} ${!isSidebarOpen ? styles.contentExpanded : ""}`}>{children}</main>
    </div>
  )
}

export default AdminLayout;