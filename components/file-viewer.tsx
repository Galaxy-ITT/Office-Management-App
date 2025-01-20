import type { File } from "@/types/file"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface FileViewerProps {
  file: File
}

export function FileViewer({ file }: FileViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{file.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="aspect-video bg-gray-100 flex items-center justify-center">
          {/* In a real application, you would integrate with a document viewer library here */}
          <p className="text-gray-500">File preview would be displayed here</p>
        </div>
      </CardContent>
    </Card>
  )
}

