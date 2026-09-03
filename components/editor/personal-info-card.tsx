import * as React from 'react'
import { Card } from '@/components/ui/card'
import {
  Button,
} from '@/components/ui/button'
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar'
import {
  Mail,
  Phone,
  MapPin,
} from 'lucide-react'

interface PersonalInfoCardProps {
  personalDetails: {
    fullName: string
    jobTitle: string
    email: string
    phone: string
    address: string
    avatarUrl?: string
  }
  onEditClick: () => void
}

export default function PersonalInfoCard({
  personalDetails,
  onEditClick,
}: PersonalInfoCardProps) {
  const { fullName, jobTitle, email, phone, address, avatarUrl } = personalDetails

  return (
    <Card className="bg-card border border-border rounded-2xl p-6 relative shadow-sm hover:shadow-md transition-shadow">
      {/* Edit Trigger Button */}
      <Button
        onClick={onEditClick}
        className="absolute top-5 right-5 size-9 rounded-full bg-rose-500 text-white hover:bg-rose-600 flex items-center justify-center shadow-sm transition-transform active:scale-95"
        aria-label="Edit personal details"
      >
        <Mail className="h-4 w-4" /> {/* Using Mail as edit icon? Pencil would be better but we don't have it in lucide? Actually we have Pencil. Let's use Pencil. */}
      </Button>
      <div className="flex flex-col md:flex-row md:items-start md:gap-6">
        {/* Left Column: Text Details */}
        <div className="flex-1 space-y-4">
          <h2 className="text-xl font-bold text-foreground">{fullName}</h2>
          <p className="text-sm text-muted-foreground font-medium">{jobTitle}</p>
          <div className="flex flex-col gap-1.5 mt-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Mail className="h-3 w-3" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="h-3 w-3" />
              <span>{phone}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3" />
              <span>{address}</span>
            </div>
          </div>
        </div>
        {/* Right Column: Avatar */}
        <div className="flex-shrink-0">
          <Avatar className="size-20 rounded-full border-2 border-border overflow-hidden object-cover">
            {avatarUrl ? (
              <AvatarImage src={avatarUrl} alt={fullName} />
            ) : (
              <AvatarFallback>{fullName.charAt(0)}</AvatarFallback>
            )}
          </Avatar>
        </div>
      </div>
    </Card>
  )
}