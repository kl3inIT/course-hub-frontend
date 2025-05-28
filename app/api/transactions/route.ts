import { type NextRequest, NextResponse } from "next/server"
import { transactionsAPI } from "@/lib/mock-api/api"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = {
      status: searchParams.get("status") || undefined,
      type: searchParams.get("type") || undefined,
      userId: searchParams.get("userId") || undefined,
      dateFrom: searchParams.get("dateFrom") || undefined,
      dateTo: searchParams.get("dateTo") || undefined,
    }

    const transactions = await transactionsAPI.getTransactions(filters)

    return NextResponse.json({
      success: true,
      data: transactions,
      total: transactions.length,
    })
  } catch (error) {
    console.error("Get transactions error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json()

    const result = await transactionsAPI.createTransaction(transactionData)

    if (!result.success) {
      return NextResponse.json({ error: "Failed to create transaction" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      data: result.transaction,
    })
  } catch (error) {
    console.error("Create transaction error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
