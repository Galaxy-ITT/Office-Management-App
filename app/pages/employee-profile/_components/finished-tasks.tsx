import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle } from "lucide-react";
import { fetchFinishedTasks } from "../_queries";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

type FinishedTaskData = {
  finished_id: string;
  task_id: string;
  title: string;
  description: string;
  employee_id: string;
  assigned_by: number;
  assigned_by_name: string;
  due_date: string;
  priority: string;
  completion_date: string;
  completion_note: string | null;
  performance_rating: number | null;
  admin_remarks: string | null;
  created_at: string;
};

interface FinishedTasksProps {
  employeeId: string;
  refreshTrigger?: number;
}

export default function FinishedTasks({ employeeId, refreshTrigger = 0 }: FinishedTasksProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<FinishedTaskData[]>([]);

  useEffect(() => {
    const loadFinishedTasks = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        const result = await fetchFinishedTasks(employeeId);
        if (result.success && Array.isArray(result.data)) {
          setCompletedTasks(result.data as FinishedTaskData[]);
        } else {
          toast({
            title: "Error",
            description: "Failed to load completed tasks",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error("Error loading finished tasks:", error);
        toast({
          title: "Error",
          description: "An error occurred while loading completed tasks",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadFinishedTasks();
  }, [employeeId, refreshTrigger, toast]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finished Tasks</CardTitle>
          <CardDescription>Loading your completed tasks...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map(index => (
              <div key={index} className="border rounded-lg p-4">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-4 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (completedTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Finished Tasks</CardTitle>
          <CardDescription>No completed tasks yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // Get priority badge color
  const getPriorityBadge = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return <Badge variant="destructive">{priority}</Badge>;
      case 'medium':
        return <Badge variant="default">{priority}</Badge>;
      case 'low':
        return <Badge variant="outline">{priority}</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Finished Tasks</CardTitle>
        <CardDescription>Tasks you have completed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {completedTasks.map((task) => (
            <div key={task.finished_id} className="border rounded-lg p-4 shadow-sm bg-green-50">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <div className="flex gap-2">
                  {getPriorityBadge(task.priority)}
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      Completed
                    </Badge>
                  </div>
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{task.description}</p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>Due: {format(new Date(task.due_date), 'PPP')}</span>
                </div>
                
                <div className="flex items-center">
                  <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                  <span>Completed: {format(new Date(task.completion_date), 'PPP')}</span>
                </div>
              </div>
              
              {task.completion_note && (
                <div className="mt-2 pt-2 border-t text-sm">
                  <p className="font-medium">Completion note:</p>
                  <p className="text-muted-foreground">{task.completion_note}</p>
                </div>
              )}
              
              {task.admin_remarks && (
                <div className="mt-2 pt-2 border-t text-sm">
                  <p className="font-medium">Admin remarks:</p>
                  <p className="text-muted-foreground">{task.admin_remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 