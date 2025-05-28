import { type NextRequest, NextResponse } from "next/server"
import { coursesAPI } from "@/lib/mock-api/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      category: searchParams.get("category") || undefined,
      level: searchParams.get("level") || undefined,
      search: searchParams.get("search") || undefined,
      instructor: searchParams.get("instructor") || undefined,
      status: searchParams.get("status") || undefined,
    }

    const courses = await coursesAPI.getCourses(filters)

    return NextResponse.json({
      success: true,
      data: courses,
      total: courses.length,
    })
  } catch (error) {
    console.error("Get courses error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const courseData = await request.json()

    const result = await coursesAPI.createCourse(courseData)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to create course" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.course,
    })
  } catch (error) {
    console.error("Create course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
