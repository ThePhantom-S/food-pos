"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Clock,
  ChefHat,
  CheckCircle2,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

type KitchenItem = {
  name: string
  qty: number
  customizations: string | null
}

type KitchenOrder = {
  id: string
  tableNo: number
  status: string
  createdAt: string
  fullItems: KitchenItem[]
}

function formatTimeElapsed(createdAtIso: string) {
  const createdAt = new Date(createdAtIso).getTime()
  const seconds = Math.floor((Date.now() - createdAt) / 1000)
  const minutes = Math.floor(seconds / 60)
  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}

function getCurrentTime() {
  return new Date().toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

export default function KitchenDisplaySystem() {
  const [orders, setOrders] = useState<KitchenOrder[]>([])
  const [currentTime, setCurrentTime] = useState(getCurrentTime())
  const [loading, setLoading] = useState(true)
  const [, setTick] = useState(0)

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getCurrentTime())
      setTick((t) => t + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch orders
  useEffect(() => {
    fetchOrders()
    const refresh = setInterval(fetchOrders, 10000) // 10s real-time
    return () => clearInterval(refresh)
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data: KitchenOrder[] = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Order ${newStatus.toLowerCase()}!`)
        fetchOrders() // Refresh
      } else {
        toast.error('Failed to update status')
      }
    } catch {
      toast.error('Network error')
    }
  }

  const newOrders = orders.filter((o) => o.status === "NEW")
  const preparingOrders = orders.filter((o) => o.status === "PREPARING")
  const readyOrders = orders.filter((o) => o.status === "READY")
  const pendingCount = newOrders.length + preparingOrders.length

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1419] flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0f1419] text-neutral-100">
      {/* Top Bar */}
      <header className="bg-[#1a2129] border-b border-neutral-800 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild className="text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800">
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="h-10 w-10 bg-primary/20 rounded-lg flex items-center justify-center">
              <ChefHat className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-neutral-50">Kitchen Display</h1>
              <p className="text-sm text-neutral-400">Sambar Flow</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {newOrders.length > 0 && (
                <Badge className="bg-red-500/20 text-red-400 border-red-500/30 gap-1 animate-pulse">
                  <Bell className="h-3 w-3" />
                  {newOrders.length} New
                </Badge>
              )}
              <Badge variant="outline" className="text-neutral-300 border-neutral-700">
                {pendingCount} Pending
              </Badge>
            </div>
            <div className="text-right">
              <p className="text-2xl font-mono font-bold text-neutral-50">{currentTime}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Kanban Layout */}
      <main className="p-6">
        <div className="grid grid-cols-3 gap-6">
          {/* New Orders */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-red-500" />
              <h2 className="text-lg font-semibold text-neutral-200">New Orders</h2>
              <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                {newOrders.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {newOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  borderColor="border-red-500"
                  bgColor="bg-red-500/5"
                  onMove={() => updateOrderStatus(order.id, "PREPARING")}
                  actionLabel="Start Preparing"
                />
              ))}
              {newOrders.length === 0 && (
                <EmptyColumn message="No new orders" />
              )}
            </div>
          </div>

          {/* Preparing */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-amber-500" />
              <h2 className="text-lg font-semibold text-neutral-200">Preparing</h2>
              <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                {preparingOrders.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {preparingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  borderColor="border-amber-500"
                  bgColor="bg-amber-500/5"
                  onMove={() => updateOrderStatus(order.id, "READY")}
                  actionLabel="Mark Ready"
                />
              ))}
              {preparingOrders.length === 0 && (
                <EmptyColumn message="No orders being prepared" />
              )}
            </div>
          </div>

          {/* Ready */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <h2 className="text-lg font-semibold text-neutral-200">Ready to Serve</h2>
              <Badge variant="secondary" className="bg-neutral-800 text-neutral-300">
                {readyOrders.length}
              </Badge>
            </div>
            <div className="space-y-4">
              {readyOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  borderColor="border-emerald-500"
                  bgColor="bg-emerald-500/5"
                  onMove={() => updateOrderStatus(order.id, "SERVED")}
                  actionLabel="Served"
                  actionIcon={<CheckCircle2 className="h-4 w-4" />}
                />
              ))}
              {readyOrders.length === 0 && (
                <EmptyColumn message="No orders ready" />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function OrderCard({
  order,
  borderColor,
  bgColor,
  onMove,
  actionLabel,
  actionIcon,
}: {
  order: KitchenOrder
  borderColor: string
  bgColor: string
  onMove: () => void
  actionLabel: string
  actionIcon?: React.ReactNode
}) {
  return (
    <Card className={`${bgColor} border-l-4 ${borderColor} bg-[#1a2129] border-r-0 border-t-0 border-b-0`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-3xl font-bold text-neutral-50">
            T{order.tableNo}
          </CardTitle>
          <span className="text-sm text-neutral-400 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formatTimeElapsed(order.createdAt)}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 mb-4">
          {order.fullItems.map((item, idx) => (
            <li key={idx} className="text-neutral-200">
              <span className="font-medium">
                {item.qty}x {item.name}
              </span>
              {item.customizations && (
                <p className="text-sm text-amber-400/80 ml-4">
                  → {item.customizations}
                </p>
              )}
            </li>
          ))}
        </ul>
        <Button
          onClick={onMove}
          className="w-full gap-2"
          variant={order.status === "READY" ? "outline" : "default"}
        >
          {actionIcon || <ArrowRight className="h-4 w-4" />}
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  )
}

function EmptyColumn({ message }: { message: string }) {
  return (
    <div className="border-2 border-dashed border-neutral-800 rounded-lg p-8 text-center">
      <p className="text-neutral-500">{message}</p>
    </div>
  )
}

