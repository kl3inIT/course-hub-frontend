import { UserDetail } from "@/components/profile/user-detail"
import { Suspense, use } from "react"
import { Skeleton } from "@/components/ui/skeleton"

interface UserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function UserPage({ params }: UserPageProps) {
  const resolvedParams = use(params)
  const userId = resolvedParams.id

  return (
    <div className="container py-6">
      <Suspense fallback={<UserDetailSkeleton />}>
        <UserDetail userId={userId} />
      </Suspense>
    </div>
  )
}

function UserDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-[200px] rounded-lg bg-muted animate-pulse" />
      <div className="space-y-4">
        <div className="h-4 w-[250px] bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
      </div>
    </div>
  )
}
