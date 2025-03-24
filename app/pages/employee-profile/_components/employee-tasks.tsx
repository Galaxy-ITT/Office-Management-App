import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, Clock, AlertTriangle } from "lucide-react";

type TaskData = {
  task_id: string;
  title: string;
  description: string;
  employee_id: string;
  assigned_by: number;
  due_date: string;
  priority: string;
  status: string;
  completion_date: string | null;
  completion_note: string | null;
  created_at: string;
  updated_at: string;
};

interface EmployeeTasksProps {
  taskData: TaskData[];
}

export default function EmployeeTasks({ taskData }: EmployeeTasksProps) {
  if (!taskData || taskData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Tasks</CardTitle>
          <CardDescription>No tasks assigned yet</CardDescription>
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

  // Get status badge and icon
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return (
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <Badge variant="outline" className="bg-green-100 text-green-800">
              {status}
            </Badge>
          </div>
        );
      case 'in progress':
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              {status}
            </Badge>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              {status}
            </Badge>
          </div>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>Your assigned tasks and their status</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {taskData.map((task) => (
            <div key={task.task_id} className="border rounded-lg p-4 shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg">{task.title}</h3>
                <div className="flex gap-2">
                  {getPriorityBadge(task.priority)}
                  {getStatusBadge(task.status)}
                </div>
              </div>
              
              <p className="text-muted-foreground mb-4">{task.description}</p>
              
              <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>Due: {format(new Date(task.due_date), 'PPP')}</span>
                </div>
                
                {task.completion_date && (
                  <div className="flex items-center">
                    <CheckCircle className="mr-1 h-4 w-4 text-green-500" />
                    <span>Completed: {format(new Date(task.completion_date), 'PPP')}</span>
                  </div>
                )}
              </div>
              
              {task.completion_note && (
                <div className="mt-2 pt-2 border-t text-sm">
                  <p className="font-medium">Completion note:</p>
                  <p className="text-muted-foreground">{task.completion_note}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
} 