import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface EmployeeDetailsProps {
  employeeDetails: {
    employee_id?: string;
    name?: string;
    email?: string;
    phone?: string;
    position?: string;
    department_id?: number;
    hire_date?: string;
    status?: string;
  }
}

export default function EmployeeDetails({ employeeDetails }: EmployeeDetailsProps) {
  // Check if we have employee details
  if (!employeeDetails) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No employee details available.</p>
        </CardContent>
      </Card>
    );
  }

  const {
    employee_id,
    name,
    email,
    phone,
    position,
    hire_date,
    status
  } = employeeDetails;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Employee Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <strong className="font-semibold">Name:</strong> {name || 'N/A'}
          </div>
          <div>
            <strong className="font-semibold">Position:</strong> {position || 'N/A'}
          </div>
          <div>
            <strong className="font-semibold">Email:</strong> {email || 'N/A'}
          </div>
          <div>
            <strong className="font-semibold">Phone:</strong> {phone || 'N/A'}
          </div>
          <div>
            <strong className="font-semibold">Date of Employment:</strong> {hire_date || 'N/A'}
          </div>
          <div>
            <strong className="font-semibold">Status:</strong> 
            <Badge variant={status === 'active' ? 'success' : 'secondary'}>
              {status || 'N/A'}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

