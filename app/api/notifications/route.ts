import { type NextRequest, NextResponse } from "next/server"
import { notificationsAPI } from "@/lib/mock-api/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    const notifications = await notificationsAPI.getUserNotifications(userId)

    return NextResponse.json({
      success: true,
      data: notifications,
    })
  } catch (error) {
    console.error("Get notifications error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
