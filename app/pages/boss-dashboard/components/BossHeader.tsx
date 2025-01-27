import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BossHeader() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="w-16 h-16">
          <AvatarImage src="/boss-avatar.jpg" alt="Boss" />
          <AvatarFallback>JD</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>John Doe</CardTitle>
          <p className="text-sm text-muted-foreground">Chief Executive Officer</p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm">Welcome back, CEO. Here's an overview of your staff and their activities.</p>
      </CardContent>
    </Card>
  )
}

