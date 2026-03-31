import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['NEW', 'PREparing', 'READY']
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        table: true,
        items: {
          include: {
            item: true
          }
        }
      }
    })

const data = orders.map((order: any) => ({
      id: order.id.slice(-4),
      tableNo: order.tableId,
      items: order.items.map((oi: any) => oi.item.name).join(', '),
      fullItems: order.items.map((oi: any) => ({
        name: oi.item.name,
        qty: oi.qty,
        customizations: oi.customizations || null
      })),
      server: 'Server',
      status: order.status,
      createdAt: order.createdAt.toISOString()
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

