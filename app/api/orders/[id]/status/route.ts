import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import type { OrderStatus } from '@prisma/client'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body: unknown = await request.json()
    const { status } = (body ?? {}) as { status?: OrderStatus }

    if (!status || !['NEW', 'PREPARING', 'READY', 'SERVED', 'CANCELLED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: { table: true }
    })

    // Update table status if served
    if (status === 'SERVED') {
      const activeOrders = await prisma.order.count({
        where: {
          tableId: order.tableId,
          status: {
            in: ['NEW', 'PREPARING', 'READY']
          }
        }
      })
      const newTableStatus = activeOrders === 0 ? 'AVAILABLE' : 'OCCUPIED'
      await prisma.table.update({
        where: { id: order.tableId },
        data: { status: newTableStatus }
      })
    }

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Update order status error:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

