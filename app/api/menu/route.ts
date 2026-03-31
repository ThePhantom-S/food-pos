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

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json()
    const { name, category, price, veg, description } = (body ?? {}) as {
      name?: string
      category?: string
      price?: number | string
      veg?: boolean
      description?: string | null
    }

    if (!name || !category) {
      return NextResponse.json({ error: 'Missing name/category' }, { status: 400 })
    }

    const parsedPrice = typeof price === 'string' ? parseFloat(price) : Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: 'Invalid price' }, { status: 400 })
    }

    if (typeof veg !== 'boolean') {
      return NextResponse.json({ error: 'Missing veg flag' }, { status: 400 })
    }

    const cat = await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: { name: category },
    })

    const item = await prisma.item.upsert({
      where: {
        name_categoryId: {
          name,
          categoryId: cat.id,
        },
      },
      update: {
        price: parsedPrice,
        veg,
        description: description ?? null,
      },
      create: {
        name,
        price: parsedPrice,
        veg,
        description: description ?? null,
        categoryId: cat.id,
      },
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error('Menu POST error:', error)
    return NextResponse.json({ error: 'Failed to create dish' }, { status: 500 })
  }
}

