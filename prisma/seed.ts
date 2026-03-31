import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting seeding...')

  // Clear existing data (dev only)
  await prisma.orderItem.deleteMany()
  await prisma.bill.deleteMany()
  await prisma.order.deleteMany()
  await prisma.item.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()
  // Tables soft reset status
  await prisma.table.updateMany({ data: { status: 'AVAILABLE' } })

  // Seed Tables 1-10
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { id: i },
      update: { status: 'AVAILABLE' },
      create: { 
        id: i, 
        qrIdentifier: `T${i}-SAMBARFLOW`
      },
    })
  }
  console.log('✅ Seeded 10 tables')

  // Seed Categories
  const categoriesData = [
    { name: 'Tiffin' },
    { name: 'Rice' },
    { name: 'Starters' },
    { name: 'Beverages' },
    { name: 'Breakfast Specials' }
  ]
  for (const cat of categoriesData) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat
    })
  }
  console.log('✅ Seeded 5 categories')

  // Fetch category IDs
  const tiffinCat = await prisma.category.findUnique({ where: { name: 'Tiffin' } })!
  const riceCat = await prisma.category.findUnique({ where: { name: 'Rice' } })!
  const startersCat = await prisma.category.findUnique({ where: { name: 'Starters' } })!
  const beveragesCat = await prisma.category.findUnique({ where: { name: 'Beverages' } })!
  const breakfastCat = await prisma.category.findUnique({ where: { name: 'Breakfast Specials' } })!

  // Seed Items
  const items = [
    // Tiffin
    { name: 'Masala Dosa', price: 120, cat: tiffinCat.id, veg: true, desc: 'Crispy rice crepe with spiced potato filling' },
    { name: 'Idli Sambar', price: 80, cat: tiffinCat.id, veg: true, desc: 'Steamed rice cakes with lentil stew' },
    { name: 'Medu Vada', price: 60, cat: tiffinCat.id, veg: true, desc: 'Crispy fried lentil doughnuts' },
    { name: 'Uttapam', price: 100, cat: tiffinCat.id, veg: true, desc: 'Thick rice pancake with vegetable toppings' },
    { name: 'Rava Dosa', price: 130, cat: tiffinCat.id, veg: true, desc: 'Crispy semolina crepe' },
    { name: 'Pongal', price: 90, cat: tiffinCat.id, veg: true, desc: 'Rice and lentils with ghee' },
    // Rice
    { name: 'Curd Rice', price: 90, cat: riceCat.id, veg: true, desc: 'Cool yogurt rice' },
    { name: 'Sambar Rice', price: 110, cat: riceCat.id, veg: true, desc: 'Rice with sambar' },
    // Starters
    { name: 'Chicken 65', price: 220, cat: startersCat.id, veg: false, desc: 'Spicy deep-fried chicken' },
    { name: 'Gobi Manchurian', price: 150, cat: startersCat.id, veg: true, desc: 'Indo-Chinese cauliflower' },
    // Beverages
    { name: 'Filter Coffee', price: 40, cat: beveragesCat.id, veg: true, desc: 'South Indian coffee' },
    // Breakfast
    { name: 'Ghee Podi Roast', price: 120, cat: breakfastCat.id, veg: true, desc: 'Ghee with podi roast' },
    { name: 'Sambar Idli', price: 75, cat: breakfastCat.id, veg: true, desc: 'Idli in sambar' },
  ]

  for (const i of items) {
    await prisma.item.upsert({
      where: {
        name_categoryId: {
          name: i.name,
          categoryId: i.cat
        }
      },
      update: {},
      create: {
        name: i.name,
        price: i.price,
        description: i.desc,
        veg: i.veg,
        categoryId: i.cat
      }
    })
  }
  console.log(`✅ Seeded ${items.length} items`)

  // Sample users
  await prisma.user.upsert({
    where: { email: 'admin@sambarflow.com' },
    update: {},
    create: { email: 'admin@sambarflow.com', name: 'Admin User', role: 'ADMIN', password: 'adminpass' }
  })
  await prisma.user.upsert({
    where: { email: 'kitchen@sambarflow.com' },
    update: {},
    create: { email: 'kitchen@sambarflow.com', name: 'Kitchen Staff', role: 'KITCHEN', password: 'kitchenpass' }
  })

  console.log('🎉 Database seeded successfully!')
  console.log('Tables, Categories, Items, Users ready!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 

