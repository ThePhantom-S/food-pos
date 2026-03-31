import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import type { BillStatus } from "@prisma/client"

function formatTimeSince(date: Date) {
  const ms = Date.now() - date.getTime()
  const mins = Math.floor(ms / 60000)
  if (mins < 1) return "Just now"
  if (mins < 60) return `${mins} min`
  const hrs = Math.floor(mins / 60)
  return `${hrs} hr ${mins % 60} min`
}

async function getSystemUserId() {
  const user = await prisma.user.upsert({
    where: { email: "system@sambarflow.com" },
    update: {},
    create: { email: "system@sambarflow.com", name: "System", role: "ADMIN" },
  })
  return user.id
}

// Returns "open bills" per table based on latest served/ready order.
export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: { status: { in: ["READY", "SERVED"] } },
      orderBy: { createdAt: "desc" },
      include: {
        table: true,
        bill: true,
        items: { include: { item: true } },
      },
      take: 50,
    })

    // Keep only latest order per table
    const latestByTable = new Map<number, (typeof orders)[number]>()
    for (const o of orders) {
      if (!latestByTable.has(o.tableId)) latestByTable.set(o.tableId, o)
    }

    const data = Array.from(latestByTable.values()).map((o) => {
      const subtotal = o.subtotal
      const gst = subtotal * 0.05
      const total = subtotal + gst
      const paymentStatus: BillStatus | "NONE" = o.bill?.status ?? "NONE"

      return {
        orderId: o.id,
        tableNo: o.tableId,
        itemsCount: o.items.reduce((sum, it) => sum + it.qty, 0),
        subtotal,
        gst,
        total,
        timeSinceOrder: formatTimeSince(o.createdAt),
        paymentStatus,
        items: o.items.map((it) => ({
          name: it.item.name,
          qty: it.qty,
          price: it.price,
          customizations: it.customizations ?? null,
        })),
      }
    })

    return NextResponse.json(data)
  } catch (error) {
    console.error("Billing API error:", error)
    return NextResponse.json({ error: "Failed to fetch billing data" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const { orderId, discount } = (body ?? {}) as {
      orderId?: string
      discount?: number
    }

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { bill: true },
    })
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const discountAmount = Number.isFinite(discount) ? Math.max(0, discount!) : 0
    const subtotal = order.subtotal
    const gst = subtotal * 0.05
    const total = subtotal + gst - discountAmount

    const userId = await getSystemUserId()

    const bill = await prisma.bill.upsert({
      where: { orderId: order.id },
      update: {
        subtotal,
        gst,
        total,
        status: "PAID",
      },
      create: {
        orderId: order.id,
        subtotal,
        gst,
        total,
        status: "PAID",
        userId,
      },
    })

    return NextResponse.json({ success: true, bill })
  } catch (error) {
    console.error("Billing pay error:", error)
    return NextResponse.json({ error: "Failed to mark paid" }, { status: 500 })
  }
}

