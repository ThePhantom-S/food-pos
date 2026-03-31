"use client"

import { useState } from "react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Mock data for server's tables
const mockMyTables = [
  { id: 1, tableNo: 3, guests: 4, status: "Order Placed", items: 4 },
  { id: 2, tableNo: 7, guests: 2, status: "Waiting for Food", items: 3 },
  { id: 3, tableNo: 9, guests: 1, status: "Served", items: 2 },
]

const mockAvailableTables = [
  { id: 1, tableNo: 2, capacity: 4 },
  { id: 2, tableNo: 4, capacity: 2 },
  { id: 3, tableNo: 6, capacity: 6 },
  { id: 4, tableNo: 8, capacity: 4 },
  { id: 5, tableNo: 10, capacity: 8 },
]

const mockStats = {
  tablesServed: 12,
  ordersTaken: 28,
  avgServiceTime: "18 min",
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "outline" {
  switch (status) {
    case "Order Placed":
      return "default"
    case "Waiting for Food":
      return "secondary"
    case "Served":
      return "outline"
    default:
      return "outline"
  }
}

export default function ServerDashboard() {
  const [myTables, setMyTables] = useState(mockMyTables)
  const [availableTables, setAvailableTables] = useState(mockAvailableTables)

  const handleClaimTable = (tableNo: number) => {
    const table = availableTables.find((t) => t.tableNo === tableNo)
    if (table) {
      setAvailableTables(availableTables.filter((t) => t.tableNo !== tableNo))
      setMyTables([
        ...myTables,
        {
          id: Date.now(),
          tableNo: table.tableNo,
          guests: 0,
          status: "Waiting for Guests",
          items: 0,
        },
      ])
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
              <p className="text-2xl font-bold text-card-foreground">{mockStats.tablesServed}</p>
              <p className="text-xs text-muted-foreground">Tables Served Today</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <ClipboardList className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{mockStats.ordersTaken}</p>
              <p className="text-xs text-muted-foreground">Orders Taken</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                <Timer className="h-5 w-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-card-foreground">{mockStats.avgServiceTime}</p>
              <p className="text-xs text-muted-foreground">Avg Service Time</p>
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
                      <span className="text-2xl font-bold text-card-foreground">T{table.tableNo}</span>
                      <Badge variant={getStatusBadgeVariant(table.status)}>{table.status}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {table.guests} guests
                      </span>
                      <span className="flex items-center gap-1">
                        <ClipboardList className="h-4 w-4" />
                        {table.items} items
                      </span>
                    </div>
                    <Button className="w-full gap-2" variant="outline">
                      <Eye className="h-4 w-4" />
                      View Order
                    </Button>
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
                      <span className="text-xl font-bold text-emerald-700">T{table.tableNo}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {table.capacity} seats
                    </p>
                    <Button
                      size="sm"
                      className="w-full gap-2"
                      onClick={() => handleClaimTable(table.tableNo)}
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
