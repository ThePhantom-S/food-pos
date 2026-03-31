"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  Users,
  ClipboardList,
  Timer,
  QrCode,
  Eye,
  Hand,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

type ServerTable = {
  id: number
  status: "AVAILABLE" | "OCCUPIED" | "CLEANING"
  activeOrderId: string | null
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "OCCUPIED":
      return "default"
    case "CLEANING":
      return "secondary"
    case "AVAILABLE":
      return "outline"
    default:
      return "outline"
  }
}

export default function ServerDashboard() {
  const [tables, setTables] = useState<ServerTable[]>([])

  useEffect(() => {
    const fetchTables = async () => {
      try {
        const res = await fetch("/api/tables", { cache: "no-store" })
        if (!res.ok) return
        const data: ServerTable[] = await res.json()
        setTables(data)
      } catch {
        // ignore
      }
    }

    fetchTables()
    const t = setInterval(fetchTables, 10000)
    return () => clearInterval(t)
  }, [])

  const myTables = useMemo(() => tables.filter((t) => t.status === "OCCUPIED"), [tables])
  const availableTables = useMemo(() => tables.filter((t) => t.status === "AVAILABLE"), [tables])
  const cleaningTables = useMemo(() => tables.filter((t) => t.status === "CLEANING"), [tables])

  const setTableStatus = async (tableId: number, status: ServerTable["status"]) => {
    try {
      await fetch(`/api/tables/${tableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
    } catch {
      // ignore
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-card-foreground">Server Dashboard</h1>
              <p className="text-sm text-muted-foreground flex items-center gap-2">
                <span className="font-medium text-primary">Priya</span>
                <span>&bull;</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Shift started 10:00 AM
                </span>
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{myTables.length}</p>
              <p className="text-xs text-muted-foreground">Occupied Tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{availableTables.length}</p>
              <p className="text-xs text-muted-foreground">Available Tables</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{cleaningTables.length}</p>
              <p className="text-xs text-muted-foreground">Cleaning</p>
            </CardContent>
          </Card>
        </div>

        {/* My Tables Section */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-foreground mb-4">My Tables</h2>
          {myTables.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myTables.map((table) => (
                <Card key={table.id} className="overflow-hidden">
                  <div className="h-2 bg-primary" />
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl font-bold text-card-foreground">T{table.id}</span>
                      <Badge variant={getStatusBadgeVariant(table.status)}>{table.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        —
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" />
                        —
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Button className="flex-1 gap-2" variant="outline" asChild disabled={!table.activeOrderId}>
                        <Link href={table.activeOrderId ? `/billing?orderId=${table.activeOrderId}` : "#"}>
                          <Eye className="h-4 w-4" />
                          View
                        </Link>
                      </Button>
                      <Button className="flex-1 gap-2" variant="secondary" onClick={() => setTableStatus(table.id, "CLEANING")}>
                        <Hand className="h-4 w-4" />
                        Cleaning
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No tables assigned yet</p>
                <p className="text-sm text-muted-foreground">Claim a table below to get started</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Claim a Table Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Claim a Table</h2>
            <Button variant="outline" className="gap-2">
              <QrCode className="h-4 w-4" />
              Scan QR
            </Button>
          </div>
          {availableTables.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {availableTables.map((table) => (
                <Card key={table.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="h-16 w-16 bg-emerald-50 border-2 border-emerald-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                      <span className="text-xl font-bold text-emerald-700">T{table.id}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Available</p>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => setTableStatus(table.id, "OCCUPIED")}
                    >
                      <Hand className="h-4 w-4" />
                      Claim
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                  <Clock className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No tables available</p>
                <p className="text-sm text-muted-foreground">All tables are currently occupied</p>
              </CardContent>
            </Card>
          )}
        </section>
      </main>
    </div>
  )
}
