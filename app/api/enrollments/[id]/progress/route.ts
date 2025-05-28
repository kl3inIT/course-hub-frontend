import { type NextRequest, NextResponse } from "next/server"
import { enrollmentsAPI } from "@/lib/mock-api/api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { lessonId } = await request.json()

    if (!lessonId) {
      return NextResponse.json({ error: "Lesson ID is required" }, { status: 400 })
    }

    const result = await enrollmentsAPI.updateProgress(params.id, lessonId)

    if (!result.success) {
      return NextResponse.json({ error: "Enrollment not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Progress updated successfully",
    })
  } catch (error) {
    console.error("Update progress error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
