import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

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

    const data = tables.map((table: any) => ({
      id: table.id,
      status: table.orders.length > 0 ? 'OCCUPIED' : 'AVAILABLE',
      guests: 2 + Math.floor(Math.random() * 4), // Mock guests
      server: table.orders.length > 0 ? ['Priya', 'Kumar', 'Lakshmi', 'Ravi'][Math.floor(Math.random()*4)] : null
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Tables API error:', error)
    return NextResponse.json({ error: 'Failed to fetch tables' }, { status: 500 })
  }
}

