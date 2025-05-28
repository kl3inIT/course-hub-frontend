import { type NextRequest, NextResponse } from "next/server"
import { enrollmentsAPI } from "@/lib/mock-api/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const enrollments = await enrollmentsAPI.getUserEnrollments(userId)

    return NextResponse.json({
      success: true,
      data: enrollments,
    })
  } catch (error) {
    console.error("Get enrollments error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
