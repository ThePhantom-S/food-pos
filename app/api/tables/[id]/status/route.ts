import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { TableStatus } from "@prisma/client"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const tableId = Number(id)
    if (!Number.isFinite(tableId)) {
      return NextResponse.json({ error: "Invalid table id" }, { status: 400 })
    }

    const body: unknown = await request.json()
    const { status } = (body ?? {}) as { status?: TableStatus }

    if (!status || !["AVAILABLE", "OCCUPIED", "CLEANING"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const table = await prisma.table.update({
      where: { id: tableId },
      data: { status },
    })

    return NextResponse.json({ success: true, table })
  } catch (error) {
    console.error("Update table status error:", error)
    return NextResponse.json({ error: "Failed to update table" }, { status: 500 })
  }
}

