import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        items: {
          orderBy: { name: 'asc' }
        }
      }
    })

    const data = categories.map(cat => ({
      name: cat.name,
      items: cat.items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        veg: item.veg,
        description: item.description || '',
        ingredients: [] // Add if model
      }))
    }))

    return NextResponse.json(data)
  } catch (error) {
    console.error('Menu API error:', error)
    return NextResponse.json({ error: 'Failed to fetch menu' }, { status: 500 })
  }
}

