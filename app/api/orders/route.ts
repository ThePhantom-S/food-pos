import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

type OrderWithItems = Prisma.OrderGetPayload<{
  include: { table: true; items: { include: { item: true } } }
}>

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ['NEW', 'PREPARING', 'READY']
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

    const data = (orders as OrderWithItems[]).map((order) => ({
      id: order.id.slice(-4),
      tableNo: order.tableId,
      items: order.items.map((oi) => oi.item.name).join(', '),
      fullItems: order.items.map((oi) => ({
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

