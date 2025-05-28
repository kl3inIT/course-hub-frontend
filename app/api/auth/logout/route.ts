import { type NextRequest, NextResponse } from "next/server"
import { authAPI } from "@/lib/mock-api/api"

export async function POST(request: NextRequest) {
  try {
    await authAPI.logout()

    const response = NextResponse.json({ success: true })

    // Clear the authentication cookie
    response.cookies.set("auth-token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
