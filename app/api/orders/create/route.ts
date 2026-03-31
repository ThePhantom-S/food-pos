import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type CreateOrderItemInput = {
  itemId: string
  qty: number
  price: number
  spiceLevel?: string | null
  extras?: unknown
}

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const { tableId, items } = (body ?? {}) as {
      tableId?: number
      items?: CreateOrderItemInput[]
    }

    if (!tableId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)

    const order = await prisma.order.create({
      data: {
        tableId,
        status: 'NEW',
        subtotal
      },
      include: {
        table: true
      }
    })

    const orderItemsData = items.map((i) => ({
      orderId: order.id,
      itemId: i.itemId,
      qty: i.qty,
      price: i.price,
      customizations: i.spiceLevel ?? null,
      extras: i.extras ?? {}
    }))

    await prisma.orderItem.createMany({
      data: orderItemsData,
      skipDuplicates: true
    })

    // Update table status
    await prisma.table.update({
      where: { id: tableId },
      data: { status: 'OCCUPIED' }
    })

    return NextResponse.json({ success: true, orderId: order.id, subtotal })
  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

