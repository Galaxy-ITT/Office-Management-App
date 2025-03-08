'use client'

import { createContext, useState, useEffect } from 'react'

interface UserContextType {
  userData: any
  setUserData: (data: any) => void
}

export const UserContext = createContext<UserContextType>({
  userData: null,
  setUserData: () => {}
})

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const [userData, setUserData] = useState<any>(null)

  useEffect(() => {
    // Load from sessionStorage on mount
    const storedUserData = sessionStorage.getItem('userData')
    if (storedUserData) {
      setUserData(JSON.parse(storedUserData))
    }
  }, [])

  const handleSetUserData = (data: any) => {
    setUserData(data)
    sessionStorage.setItem('userData', JSON.stringify(data)) // Save to sessionStorage
  }

  return (
    <UserContext.Provider value={{ userData, setUserData: handleSetUserData }}>
      {children}
    </UserContext.Provider>
  )
}
