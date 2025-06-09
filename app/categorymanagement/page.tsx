"use client"
import { CoursesCatalogSection } from "@/components/courses/courses-catalog-section"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function CategoryManagementPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-50 p-0 flex flex-col items-center justify-start">
      <div className="w-full max-w-[1600px] px-8 py-12">
        <div className="flex items-center mb-10 gap-6">
          <Button variant="outline" className="scale-110" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <h1 className="text-4xl font-bold text-blue-900 text-center flex-1">Course List by Category</h1>
        </div>
        <div className="bg-white rounded-3xl shadow-xl p-10">
          <CoursesCatalogSection managementView />
        </div>
      </div>
    </div>
  )
} 