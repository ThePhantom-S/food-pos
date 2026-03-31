# Sambar Flow POS Error Rectification & Completion TODO

## Current Progress: 6/12 [✅✅✅✅✅✅░░░░░░░░░░░ ]

1. [✅] Update `prisma/schema.prisma` with POS models (Table, Category, Item, Order, OrderItem, Bill, User)
2. [✅] Fix `prisma/seed.ts` import and seed data
3. [✅] Add Tailwind sidebar CSS vars to `app/globals.css` (already present)
4. [✅] `npx prisma migrate dev --name init_pos`
5. [✅] `npx prisma generate`
6. [✅] `pnpm run seed` (tsx prisma/seed.ts success - data ready!)
7. [✅] Update `app/page.tsx` - real dashboard data from Prisma (APIs + fetch)
8. [✅] Update `app/menu/[tableId]/page.tsx` - fetch menu, create orders (real DB order creation)
9. [✅] Update `app/kitchen/page.tsx` - real orders, Socket.io (APIs + status update)


8. [ ] Update `app/menu/[tableId]/page.tsx` - fetch menu, create orders
9. [ ] Update `app/kitchen/page.tsx` - real orders, Socket.io
10. [ ] Implement `app/billing/page.tsx` - bills, GST
11. [ ] Add Socket.io server `app/api/socket/route.ts`
12. [ ] Test full flow, attempt_completion

**Next**: Step 7 - Create dashboard API + update page.tsx

**Notes**: DB ready! Ignore VSCode TS warnings (runtime OK).
2. [ ] Fix `prisma/seed.ts` import and seed data
3. [ ] Add Tailwind sidebar CSS vars to `app/globals.css`
4. [ ] `npx prisma migrate dev --name init_pos`
5. [ ] `npx prisma generate`
6. [ ] `pnpm run seed` (or tsx prisma/seed.ts)
7. [ ] Update `app/page.tsx` - real dashboard data from Prisma
8. [ ] Update `app/menu/[tableId]/page.tsx` - fetch menu, create orders
9. [ ] Update `app/kitchen/page.tsx` - real orders, Socket.io
10. [ ] Implement `app/billing/page.tsx` - bills, GST
11. [ ] Add Socket.io server `app/api/socket/route.ts`
12. [ ] Test full flow, attempt_completion

**Next**: Step 1 - schema.prisma

**Notes**: Run commands in terminal after each DB step. Check for TS errors.
