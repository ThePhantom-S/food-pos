"use client"

import { useState } from "react"
import Link from "next/link"
import {
  LayoutDashboard,
  UtensilsCrossed,
  Users,
  Receipt,
  BarChart3,
  Settings,
  ChevronDown,
  Clock,
  IndianRupee,
  ShoppingBag,
  FileText,
  MoreVertical,
  Grid3X3,
  ChefHat,
  Clipboard,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Mock data
const mockOrders = [
  { id: 1, tableNo: 3, items: "Masala Dosa, Filter Coffee", server: "Priya", status: "Preparing", time: "12 min" },
  { id: 2, tableNo: 7, items: "Idli Sambar, Vada", server: "Kumar", status: "Ready", time: "8 min" },
  { id: 3, tableNo: 1, items: "Uttapam, Curd Rice", server: "Lakshmi", status: "Served", time: "25 min" },
  { id: 4, tableNo: 5, items: "Pongal, Kesari", server: "Ravi", status: "New", time: "2 min" },
  { id: 5, tableNo: 9, items: "Rava Dosa, Tea", server: "Priya", status: "Preparing", time: "6 min" },
]

const mockTables = [
  { id: 1, status: "Occupied", server: "Lakshmi", guests: 4 },
  { id: 2, status: "Available", server: null, guests: 0 },
  { id: 3, status: "Occupied", server: "Priya", guests: 2 },
  { id: 4, status: "Cleaning", server: null, guests: 0 },
  { id: 5, status: "Occupied", server: "Ravi", guests: 3 },
  { id: 6, status: "Available", server: null, guests: 0 },
  { id: 7, status: "Occupied", server: "Kumar", guests: 2 },
  { id: 8, status: "Available", server: null, guests: 0 },
  { id: 9, status: "Occupied", server: "Priya", guests: 1 },
  { id: 10, status: "Cleaning", server: null, guests: 0 },
]

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: UtensilsCrossed, label: "Menu Mgmt", href: "/admin/menu" },
  { icon: Receipt, label: "Billing", href: "/billing" },
  { icon: Clipboard, label: "Server", href: "/server" },
  { icon: ChefHat, label: "Kitchen", href: "/kitchen" },
  { icon: Grid3X3, label: "Customer Menu", href: "/menu/3" },
]

function getStatusColor(status: string) {
  switch (status) {
    case "Occupied":
      return "bg-primary/10 text-primary border-primary/20"
    case "Available":
      return "bg-emerald-50 text-emerald-700 border-emerald-200"
    case "Cleaning":
      return "bg-amber-50 text-amber-700 border-amber-200"
    default:
      return "bg-muted text-muted-foreground"
  }
}

function getOrderStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "New":
      return "destructive"
    case "Preparing":
      return "default"
    case "Ready":
      return "secondary"
    default:
      return "outline"
  }
}

export default function AdminDashboard() {
  const [selectedBranch, setSelectedBranch] = useState("Anna Nagar")

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Sambar Flow</h1>
          <p className="text-sm text-sidebar-foreground/60">Restaurant POS</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item.href === "/"
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/50">Version 1.0.0</p>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-card-foreground">Dashboard</h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {selectedBranch}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setSelectedBranch("Anna Nagar")}>
                  Anna Nagar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedBranch("T. Nagar")}>
                  T. Nagar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSelectedBranch("Adyar")}>
                  Adyar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-medium text-card-foreground">Admin</p>
              <p className="text-xs text-muted-foreground">Superuser</p>
            </div>
            <Avatar>
              <AvatarImage src="/placeholder-avatar.jpg" alt="Admin" />
              <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-auto p-6">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Today&apos;s Revenue</p>
                    <p className="text-2xl font-bold text-card-foreground mt-1">
                      <span className="inline-flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        42,580
                      </span>
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <IndianRupee className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Active Tables</p>
                    <p className="text-2xl font-bold text-card-foreground mt-1">5 / 10</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Grid3X3 className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                    <p className="text-2xl font-bold text-card-foreground mt-1">127</p>
                  </div>
                  <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Pending Bills</p>
                    <p className="text-2xl font-bold text-card-foreground mt-1">8</p>
                  </div>
                  <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Orders Table */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Live Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Table</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Server</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead className="w-10"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">#{order.tableNo}</TableCell>
                          <TableCell className="max-w-[200px] truncate">{order.items}</TableCell>
                          <TableCell>{order.server}</TableCell>
                          <TableCell>
                            <Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="h-3.5 w-3.5" />
                              {order.time}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Table Status Grid */}
            <div>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Table Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    {mockTables.map((table) => (
                      <div
                        key={table.id}
                        className={`p-3 rounded-lg border ${getStatusColor(table.status)}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold">T{table.id}</span>
                          {table.guests > 0 && (
                            <span className="text-xs opacity-75">{table.guests} guests</span>
                          )}
                        </div>
                        <p className="text-xs font-medium">{table.status}</p>
                        {table.server && (
                          <p className="text-xs opacity-75 mt-0.5">{table.server}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
