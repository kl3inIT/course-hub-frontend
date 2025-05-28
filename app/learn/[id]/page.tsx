"use client"

import { useSearchParams } from "next/navigation"
import LessonViewer from "@/components/learning/lesson-viewer"
import { Navbar } from "@/components/layout/navbar"

export default function LearnPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams()
  const moduleId = searchParams.get("module")
  const lessonId = searchParams.get("lesson")

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <LessonViewer courseId={params.id} moduleId={moduleId || undefined} lessonId={lessonId || undefined} />
      </div>
    </div>
  )
}
