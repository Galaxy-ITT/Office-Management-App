'use client'

import React, { createContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

type UserContextType = {
  userData: {
    admin_id?: number
    name?: string
    email?: string
    username?: string
    role?: string
    role_name?: string
    role_id?: string
    department_id?: number
    department_name?: string
    employee_id?: string
    position?: string
  } | null
  setUserData: (data: any) => void
  isLoading: boolean
  logout: () => void
  checkAuth: () => Promise<boolean>
}

export const UserContext = createContext<UserContextType>({
  userData: null,
  setUserData: () => {},
  isLoading: true,
  logout: () => {},
  checkAuth: async () => false
})

type UserProviderProps = {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const [userData, setUserData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Function to check authentication status
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      const data = await response.json()
      
      if (data.success && data.data) {
        setUserData(data.data)
        return true
      } else {
        setUserData(null)
        return false
      }
    } catch (error) {
      console.error('Auth check error:', error)
      setUserData(null)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Check auth status on component mount
  useEffect(() => {
    checkAuth()
  }, [])

  // Logout function
  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      setUserData(null)
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <UserContext.Provider value={{ userData, setUserData, isLoading, logout, checkAuth }}>
      {children}
    </UserContext.Provider>
  )
}
