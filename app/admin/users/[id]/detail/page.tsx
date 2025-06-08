"use client"

import { Suspense, use } from "react"
import { UserDetail } from "@/components/profile/user-detail"
import { Skeleton } from "@/components/ui/skeleton"

interface UserPageProps {
  params: Promise<{
    id: string
  }>
}

export default function AdminUserDetailPage({ params }: UserPageProps) {
  // Properly unwrap params using React.use()
  const resolvedParams = use(params)
  const userId = resolvedParams.id

  return (
    <div className="container py-6">
      <Suspense fallback={
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[200px]" />
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </div>
        </div>
      }>
        <UserDetail userId={userId} />
      </Suspense>
    </div>
  )
} 