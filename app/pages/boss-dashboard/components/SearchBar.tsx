"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { useRouter } from "next/navigation"
import { searchStaff } from "./_queries"

interface SearchBarProps {
  onSearch?: (results: any[]) => void;
  placeholder?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search staff..."
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const router = useRouter()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!searchQuery.trim()) return
    
    setIsSearching(true)
    
    try {
      if (onSearch) {
        // Use the server action directly
        const result = await searchStaff(searchQuery)
        
        if (result.success) {
          onSearch(result.results || [])
        } else {
          console.error("Search failed:", result.error)
        }
      } else {
        // Navigate to search results page with query parameter
        router.push(`/boss-dashboard/search?q=${encodeURIComponent(searchQuery)}`)
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-grow"
        disabled={isSearching}
      />
      <Button type="submit" variant="outline" disabled={isSearching}>
        <Search className="h-4 w-4 mr-2" />
        {isSearching ? "Searching..." : "Search"}
      </Button>
    </form>
  )
}

