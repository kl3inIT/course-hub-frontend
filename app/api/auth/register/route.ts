import { type NextRequest, NextResponse } from "next/server"
import { authAPI } from "@/lib/mock-api/api"

export async function POST(request: NextRequest) {
  try {
    const userData = await request.json()

    if (!userData.email || !userData.name || !userData.password) {
      return NextResponse.json({ error: "Email, name, and password are required" }, { status: 400 })
    }

    const result = await authAPI.register(userData)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const token = `mock-jwt-token-${result.user!.id}`

    const response = NextResponse.json({
      success: true,
      user: result.user,
      token,
    })

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 86400,
    })

    return response
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
