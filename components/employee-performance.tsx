import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function EmployeePerformance() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Overall Performance Rating</h3>
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-2">4.5</span>
            <span className="text-muted-foreground">/ 5.0</span>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Key Performance Indicators</h3>
          {[
            { name: "Project Delivery", score: 95 },
            { name: "Code Quality", score: 92 },
            { name: "Team Collaboration", score: 88 },
            { name: "Innovation", score: 85 },
            { name: "Communication", score: 90 },
          ].map((kpi) => (
            <div key={kpi.name} className="mb-4">
              <div className="flex justify-between mb-1">
                <span>{kpi.name}</span>
                <span>{kpi.score}%</span>
              </div>
              <Progress value={kpi.score} className="h-2" />
            </div>
          ))}
        </div>
        <div>
          <h3 className="font-semibold mb-2">Recent Feedback</h3>
          <div className="space-y-2">
            <p>
              <strong>Project Manager:</strong> John consistently delivers high-quality work ahead of schedule.
            </p>
            <p>
              <strong>Team Lead:</strong> Excellent mentor to junior developers, significantly improving team
              productivity.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

