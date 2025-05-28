import { type NextRequest, NextResponse } from "next/server"
import { coursesAPI } from "@/lib/mock-api/api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const result = await coursesAPI.enrollInCourse(userId, params.id)

    if (!result.success) {
      return NextResponse.json({ error: "Already enrolled or course not found" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.enrollment,
    })
  } catch (error) {
    console.error("Enroll course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
