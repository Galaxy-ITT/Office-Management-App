"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Phone, Loader2 } from "lucide-react"
import { fetchEmployeePerformance } from "./_queries"
import { toast } from "@/hooks/use-toast"

export default function PerformanceOverview() {
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [performanceData, setPerformanceData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPerformanceData()
  }, [])

  const loadPerformanceData = async () => {
    setLoading(true)
    try {
      const result = await fetchEmployeePerformance()
      if (result.success && result.data) {
        setPerformanceData(result.data)
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load performance data",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error loading performance data:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : performanceData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No performance data available</p>
        ) : (
          <ul className="space-y-4">
            {performanceData.map((staff) => (
              <li key={staff.employee_id} className="space-y-2">
                <div className="flex justify-between items-center">
                  <p className="font-medium">{staff.name}</p>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedStaff(staff)}>
                    View Details
                  </Button>
                </div>
                <Progress value={staff.performance_score} className="h-2" />
                <p className="text-sm text-muted-foreground">Performance Score: {staff.performance_score}%</p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={!!selectedStaff} onOpenChange={() => setSelectedStaff(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Staff Details</DialogTitle>
          </DialogHeader>
          {selectedStaff && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedStaff.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedStaff.position} - {selectedStaff.department_name || "No Department"}
                </p>
              </div>
              <div className="space-y-2">
                <p>
                  <strong>Performance Score:</strong> {selectedStaff.performance_score}%
                </p>
                <p>
                  <strong>Attendance:</strong> {selectedStaff.attendance}%
                </p>
                <p>
                  <strong>Email:</strong> {selectedStaff.email}
                </p>
                {selectedStaff.phone && (
                  <p>
                    <strong>Phone:</strong> {selectedStaff.phone}
                  </p>
                )}
              </div>
              <div>
                <h4 className="font-semibold">Management Notes:</h4>
                <ul className="space-y-2 mt-2">
                  {selectedStaff.notes.map((note, index) => (
                    <li
                      key={index}
                      className={`text-sm ${note.type === "positive" ? "text-green-600" : "text-red-600"}`}
                    >
                      {note.note}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedStaff(null)}>
              Close
            </Button>
            <Button onClick={() => window.open(`tel:${selectedStaff.phone}`)}>
              <Phone className="h-4 w-4 mr-2" />
              Call Staff
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}

