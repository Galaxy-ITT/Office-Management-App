import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

const performanceCategories = ["Job Knowledge", "Work Quality", "Productivity", "Communication Skills", "Teamwork"]

export function StaffPerformance({ selectedStaff }) {
  const [performanceData, setPerformanceData] = useState({})
  const [comments, setComments] = useState("")

  useEffect(() => {
    if (selectedStaff) {
      // In a real app, you'd fetch the existing performance data here
      setPerformanceData({})
      setComments("")
    }
  }, [selectedStaff])

  const handleRatingChange = (category, value) => {
    setPerformanceData((prev) => ({ ...prev, [category]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // In a real app, you'd send this data to your backend
    console.log("Performance data:", { ...performanceData, comments })
    // Show a success message to the user
    alert("Performance review submitted successfully!")
  }

  if (!selectedStaff) {
    return <div>Please select a staff member</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Staff Performance Review</CardTitle>
        <CardDescription>Rate {selectedStaff.name}'s performance</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {performanceCategories.map((category) => (
            <div key={category} className="space-y-2">
              <Label>{category}</Label>
              <RadioGroup
                onValueChange={(value) => handleRatingChange(category, value)}
                value={performanceData[category]}
              >
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <RadioGroupItem value={rating.toString()} id={`${category}-${rating}`} />
                    <Label htmlFor={`${category}-${rating}`}>{rating}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea id="comments" value={comments} onChange={(e) => setComments(e.target.value)} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit">Submit Review</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

