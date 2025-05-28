import { type NextRequest, NextResponse } from "next/server"
import { coursesAPI } from "@/lib/mock-api/api"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const course = await coursesAPI.getCourseById(params.id)

    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: course,
    })
  } catch (error) {
    console.error("Get course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const courseData = await request.json()

    const result = await coursesAPI.updateCourse(params.id, courseData)

    if (!result.success) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: result.course,
    })
  } catch (error) {
    console.error("Update course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await coursesAPI.deleteCourse(params.id)

    if (!result.success) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    })
  } catch (error) {
    console.error("Delete course error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
