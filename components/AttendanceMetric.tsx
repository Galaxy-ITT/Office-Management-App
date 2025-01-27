import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface AttendanceMetricProps {
  title: string
  value: number
  unit: string
}

export function AttendanceMetric({ title, value, unit }: AttendanceMetricProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toFixed(1)}</div>
        <p className="text-xs text-muted-foreground">{unit}</p>
      </CardContent>
    </Card>
  )
}

