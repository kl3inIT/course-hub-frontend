import { type NextRequest, NextResponse } from "next/server"
import { notificationsAPI } from "@/lib/mock-api/api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const result = await notificationsAPI.markAsRead(params.id)

    if (!result.success) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Notification marked as read",
    })
  } catch (error) {
    console.error("Mark notification as read error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
