import { useContext, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { UserContext } from "@/userContext/userContext"
import { fetchEmployeeSkills, fetchEmployeeCourses } from "../_queries"
import { Plus, Loader2 } from "lucide-react"

interface Skill {
  skill_id: number;
  skill_name: string;
  proficiency_level: string;
  years_experience: number;
}

interface Course {
  course_id: number;
  course_name: string;
  provider: string;
  certification_obtained: boolean;
  start_date: string;
  completion_date: string;
  status: string;
  notes: string;
}

export default function ProfessionalDevelopment() {
  const { userData } = useContext(UserContext);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!userData?.employee_id) return;

      try {
        const [skillsResult, coursesResult] = await Promise.all([
          fetchEmployeeSkills(userData.employee_id),
          fetchEmployeeCourses(userData.employee_id)
        ]);

        if (skillsResult.success) {
          setSkills(skillsResult.data as Skill[]);
        }

        if (coursesResult.success) {
          setCourses(coursesResult.data as Course[]);
        }
      } catch (error) {
        console.error("Error loading professional development data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [userData]);

  const getBadgeVariantForProficiency = (level: string) => {
    switch (level) {
      case 'Expert': return 'destructive';
      case 'Advanced': return 'default';
      case 'Intermediate': return 'secondary';
      default: return 'outline';
    }
  };

  const getBadgeVariantForStatus = (status: string) => {
    switch (status) {
      case 'Completed': return 'success';
      case 'In Progress': return 'default';
      default: return 'secondary';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Development</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : (
          <>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Skills</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Skill
                </Button>
              </div>
              
              {skills.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {skills.map((skill) => (
                    <div key={skill.skill_id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{skill.skill_name}</span>
                        <Badge variant={getBadgeVariantForProficiency(skill.proficiency_level)}>
                          {skill.proficiency_level}
                        </Badge>
                      </div>
                      {skill.years_experience && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {skill.years_experience} year{skill.years_experience !== 1 ? 's' : ''} experience
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No skills have been added yet.</p>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">Training & Certifications</h3>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Course
                </Button>
              </div>
              
              {courses.length > 0 ? (
                <div className="space-y-3">
                  {courses.map((course) => (
                    <div key={course.course_id} className="border rounded-md p-3">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{course.course_name}</span>
                        <Badge variant={getBadgeVariantForStatus(course.status)}>
                          {course.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {course.provider || "No provider specified"}
                      </p>
                      {course.certification_obtained && (
                        <Badge variant="outline" className="mt-2">Certification Obtained</Badge>
                      )}
                      {course.notes && (
                        <p className="text-sm mt-2">{course.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No courses or certifications have been added yet.</p>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

