import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const professionalDetails = {
  education: "Master's in Computer Science, XYZ University",
  skills: ["JavaScript", "React", "Node.js", "Python", "AWS"],
  certifications: ["AWS Certified Developer", "Scrum Master"],
  languages: ["English (Native)", "Spanish (Intermediate)"],
  projects: [
    { name: "Project A", role: "Lead Developer" },
    { name: "Project B", role: "Backend Specialist" },
  ],
}

export default function ProfessionalDetails() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <strong className="font-semibold">Education:</strong>
          <p>{professionalDetails.education}</p>
        </div>
        <div>
          <strong className="font-semibold">Skills:</strong>
          <p>{professionalDetails.skills.join(", ")}</p>
        </div>
        <div>
          <strong className="font-semibold">Certifications:</strong>
          <ul className="list-disc list-inside">
            {professionalDetails.certifications.map((cert, index) => (
              <li key={index}>{cert}</li>
            ))}
          </ul>
        </div>
        <div>
          <strong className="font-semibold">Languages:</strong>
          <p>{professionalDetails.languages.join(", ")}</p>
        </div>
        <div>
          <strong className="font-semibold">Key Projects:</strong>
          <ul className="list-disc list-inside">
            {professionalDetails.projects.map((project, index) => (
              <li key={index}>
                {project.name} - {project.role}
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

