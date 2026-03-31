import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body: unknown = await request.json()
    const { name, category, price, veg, description } = (body ?? {}) as {
      name?: string
      category?: string
      price?: number | string
      veg?: boolean
      description?: string | null
    }

    if (!name || !category || typeof veg !== "boolean" || price === undefined) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const parsedPrice = typeof price === "string" ? parseFloat(price) : Number(price)
    if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
      return NextResponse.json({ error: "Invalid price" }, { status: 400 })
    }

    const cat = await prisma.category.upsert({
      where: { name: category },
      update: {},
      create: { name: category },
    })

    const item = await prisma.item.update({
      where: { id },
      data: {
        name,
        price: parsedPrice,
        veg,
        description: description ?? null,
        categoryId: cat.id,
      },
    })

    return NextResponse.json({ success: true, item })
  } catch (error) {
    console.error("Menu item PATCH error:", error)
    return NextResponse.json({ error: "Failed to update dish" }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    await prisma.item.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Menu item DELETE error:", error)
    return NextResponse.json({ error: "Failed to delete dish" }, { status: 500 })
  }
}

