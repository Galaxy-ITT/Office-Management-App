import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface NoteEditorProps {
  initialNotes: string
  onSave: (notes: string) => void
}

export function NoteEditor({ initialNotes, onSave }: NoteEditorProps) {
  const [notes, setNotes] = useState(initialNotes)

  const handleSave = () => {
    onSave(notes)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add your notes here..."
          className="min-h-[100px]"
        />
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave}>Save Notes</Button>
      </CardFooter>
    </Card>
  )
}

