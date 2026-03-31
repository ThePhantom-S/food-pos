import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { tableId, items } = await request.json()

    if (!tableId || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const subtotal = items.reduce((sum: number, i: any) => sum + (i.price * i.qty), 0)

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

    const orderItemsData = items.map((i: any) => ({
      orderId: order.id,
      itemId: i.itemId,
      qty: i.qty,
      price: i.price,
      customizations: i.spiceLevel,
      extras: i.extras || {}
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

