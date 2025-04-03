import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CalendarIcon, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateTaskStatus } from "../_queries";

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
  employee_notes: string | null;
  created_at: string;
  updated_at: string;
};

interface EmployeeTasksProps {
  taskData: TaskData[];
  onTaskUpdate: () => void;
}

export default function EmployeeTasks({ taskData, onTaskUpdate }: EmployeeTasksProps) {
  const { toast } = useToast();
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
  const [completionNote, setCompletionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Filter out completed tasks
  const pendingTasks = taskData.filter(task => task.status.toLowerCase() !== 'completed');

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
              Completed
            </Badge>
          </div>
        );
      case 'in progress':
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-blue-500" />
            <Badge variant="outline" className="bg-blue-100 text-blue-800">
              In Progress
            </Badge>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-yellow-500" />
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Pending
            </Badge>
          </div>
        );
      case 'overdue':
        return (
          <div className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <Badge variant="outline" className="bg-red-100 text-red-800">
              Overdue
            </Badge>
          </div>
        );
      default:
        return (
          <Badge variant="secondary">{status}</Badge>
        );
    }
  };

  const handleTaskClick = (task: TaskData) => {
    setSelectedTask(task);
    setCompletionNote(task.employee_notes || "");
  };

  const handleCompleteTask = async () => {
    if (!selectedTask) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateTaskStatus({
        task_id: selectedTask.task_id,
        status: "completed",
        completion_note: completionNote,
        move_to_finished: true // Indicate that we want to move this to finished_tasks
      });
      
      if (result.success) {
        toast({
          title: "Task completed",
          description: "Task has been marked as completed and moved to finished tasks",
        });
        setSelectedTask(null);
        onTaskUpdate();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update task",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description: "Something went wrong while updating the task",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInProgressTask = async () => {
    if (!selectedTask) return;
    
    setIsSubmitting(true);
    try {
      const result = await updateTaskStatus({
        task_id: selectedTask.task_id,
        status: "in progress",
        completion_note: completionNote,
        move_to_finished: false
      });
      
      if (result.success) {
        toast({
          title: "Task updated",
          description: "Task has been marked as in progress",
        });
        setSelectedTask(null);
        onTaskUpdate();
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to update task",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error",
        description: "Something went wrong while updating the task",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
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
          {pendingTasks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No pending tasks at the moment
            </div>
          ) : (
            pendingTasks.map((task) => (
              <div 
                key={task.task_id} 
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleTaskClick(task)}
              >
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
                </div>
                
                {task.employee_notes && (
                  <div className="mt-2 pt-2 border-t text-sm">
                    <p className="font-medium">Your notes:</p>
                    <p className="text-muted-foreground">{task.employee_notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>

      {/* Task Update Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Task Status</DialogTitle>
            <DialogDescription>
              You can mark this task as complete or in progress and add notes about your progress.
            </DialogDescription>
          </DialogHeader>
          
          {selectedTask && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">{selectedTask.title}</h3>
                <p className="text-sm text-muted-foreground">{selectedTask.description}</p>
                <div className="flex items-center mt-2 text-sm">
                  <CalendarIcon className="mr-1 h-4 w-4 text-muted-foreground" />
                  <span>Due: {format(new Date(selectedTask.due_date), 'PPP')}</span>
                </div>
              </div>
              
              <div>
                <label htmlFor="completion-note" className="block text-sm font-medium mb-1">
                  Notes or Comments
                </label>
                <Textarea
                  id="completion-note"
                  placeholder="Add details about your progress or completion..."
                  value={completionNote}
                  onChange={(e) => setCompletionNote(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleInProgressTask}
                disabled={isSubmitting}
              >
                <Clock className="h-4 w-4 mr-2 text-blue-500" />
                Mark as In Progress
              </Button>
              <Button
                onClick={handleCompleteTask}
                disabled={isSubmitting}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Mark as Completed
              </Button>
            </div>
            <DialogClose asChild>
              <Button variant="secondary" disabled={isSubmitting}>Cancel</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
} 