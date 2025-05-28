import { type NextRequest, NextResponse } from "next/server"
import { usersAPI } from "@/lib/mock-api/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      role: searchParams.get("role") || undefined,
      status: searchParams.get("status") || undefined,
      search: searchParams.get("search") || undefined,
    }

    const users = await usersAPI.getUsers(filters)

    return NextResponse.json({
      success: true,
      data: users,
      total: users.length,
    })
  } catch (error) {
    console.error("Get users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
