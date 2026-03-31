import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

type TableWithActiveOrders = Prisma.TableGetPayload<{
  include: {
    orders: {
      where: { status: { in: ['NEW', 'PREPARING', 'READY'] } }
      take: 1
      select: { id: true }
    }
  }
}>

export async function GET() {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: {
            status: {
              in: ['NEW', 'PREPARING', 'READY']
            }
          },
          take: 1,
          select: { id: true }
        }
      }
    })

    const data = (tables as TableWithActiveOrders[]).map((table) => ({
      id: table.id,
      status: table.status,
      activeOrderId: table.orders[0]?.id ?? null,
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Tables API error:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

