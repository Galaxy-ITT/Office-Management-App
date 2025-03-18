"use client"

import type { Metadata } from "next"
import { UserContext } from "@/userContext/userContext"
import { useContext } from "react"


export default function DashboardPage() {

  const { userData } = useContext(UserContext)

  console.log(userData)

  return <>
  <div>
    Working on it!
  </div>
  </>
}

