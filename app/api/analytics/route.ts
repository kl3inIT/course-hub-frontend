import { type NextRequest, NextResponse } from "next/server"
import { analyticsAPI } from "@/lib/mock-api/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")
    const period = searchParams.get("period") || "7d"

    let data

    switch (type) {
      case "overview":
        data = await analyticsAPI.getOverview()
        break
      case "user-growth":
        data = await analyticsAPI.getUserGrowth(period)
        break
      case "revenue":
        data = await analyticsAPI.getRevenueData(period)
        break
      case "popular-courses":
        data = await analyticsAPI.getPopularCourses()
        break
      case "categories":
        data = await analyticsAPI.getCategoryStats()
        break
      default:
        data = await analyticsAPI.getFullAnalytics()
    }

    return NextResponse.json({
      success: true,
      data,
    })
  } catch (error) {
    console.error("Get analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
