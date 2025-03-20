import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

interface PerformanceData {
  review_id: string;
  rating: number;
  review_date: string;
  review_period: string;
  status: string;
  reviewer_id: number;
  reviewer_comments: string;
  reviewer_name: string;
}

interface EmployeePerformanceProps {
  performanceData: PerformanceData[];
}

export default function EmployeePerformance({ performanceData }: EmployeePerformanceProps) {
  // Calculate average rating
  const avgRating = performanceData.length > 0
    ? performanceData.reduce((sum, review) => sum + (review.rating ?? 0), 0) / performanceData.length
    : 0;
  
  // Get latest review safely
  const latestReview = performanceData.length > 0
    ? [...performanceData].sort((a, b) => 
        new Date(b.review_date).getTime() - new Date(a.review_date).getTime()
      )[0]
    : null;
    
  // Safe getter for rating with a default value
  const getRating = (review: any) => review?.rating ?? 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold mb-2">Overall Performance Rating</h3>
          <div className="flex items-center">
            <span className="text-3xl font-bold mr-2">{avgRating.toFixed(1)}</span>
            <span className="text-muted-foreground">/ 5.0</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Based on {performanceData.length} performance review{performanceData.length !== 1 ? 's' : ''}
          </p>
        </div>

        {performanceData.length > 0 ? (
          <>
            <div>
              <h3 className="font-semibold mb-2">Latest Performance Review</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Review period: {latestReview?.review_period || "N/A"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Date: {new Date(latestReview?.review_date || "").toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    getRating(latestReview) >= 4 ? "success" : 
                    getRating(latestReview) >= 3 ? "default" : "destructive"
                  }>
                    Rating: {latestReview?.rating ?? "N/A"}/5
                  </Badge>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Reviewer: {latestReview?.reviewer_name || "N/A"}</p>
                  <p className="mt-1">{latestReview?.reviewer_comments || "No comments provided."}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Performance History</h3>
              {performanceData.length > 1 ? (
                performanceData.slice(1).map(review => (
                  <div key={review.review_id} className="border-t pt-4 pb-2">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="font-medium">{review.review_period}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(review.review_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant={
                        getRating(review) >= 4 ? "success" : 
                        getRating(review) >= 3 ? "default" : "destructive"
                      }>
                        Rating: {review.rating ?? "N/A"}/5
                      </Badge>
                    </div>
                    <Progress value={getRating(review) * 20} className="h-2 mt-1" />
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No previous performance reviews available.</p>
              )}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No performance reviews available yet.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

