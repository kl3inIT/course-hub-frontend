import { type NextRequest, NextResponse } from "next/server"
import { transactionsAPI } from "@/lib/mock-api/api"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { amount, reason } = await request.json()

    if (!amount || !reason) {
      return NextResponse.json({ error: "Amount and reason are required" }, { status: 400 })
    }

    const result = await transactionsAPI.processRefund(params.id, { amount, reason })

    if (!result.success) {
      return NextResponse.json({ error: "Failed to process refund" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      message: "Refund processed successfully",
    })
  } catch (error) {
    console.error("Process refund error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
