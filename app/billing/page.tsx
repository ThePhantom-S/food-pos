"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Clock,
  IndianRupee,
  QrCode,
  Hand,
  Check,
  CreditCard,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

// Mock data for tables with open bills
const mockTableBills = [
  {
    id: 1,
    tableNo: 3,
    itemsCount: 4,
    total: 680,
    timeSinceOrder: "45 min",
    server: "Priya",
    items: [
      { name: "Masala Dosa", qty: 2, price: 120, customizations: "Extra chutney" },
      { name: "Filter Coffee", qty: 2, price: 60, customizations: null },
      { name: "Sambar Vada", qty: 1, price: 80, customizations: "Less spicy" },
      { name: "Kesari Bath", qty: 1, price: 70, customizations: null },
    ],
    paymentStatus: "PENDING",
  },
  {
    id: 2,
    tableNo: 7,
    itemsCount: 2,
    total: 240,
    timeSinceOrder: "20 min",
    server: "Kumar",
    items: [
      { name: "Idli Sambar", qty: 1, price: 80, customizations: null },
      { name: "Medu Vada", qty: 2, price: 100, customizations: "Crispy" },
      { name: "Tea", qty: 1, price: 30, customizations: null },
    ],
    paymentStatus: "PENDING",
  },
  {
    id: 3,
    tableNo: 1,
    itemsCount: 5,
    total: 950,
    timeSinceOrder: "1 hr 10 min",
    server: "Lakshmi",
    items: [
      { name: "Ghee Roast Dosa", qty: 2, price: 150, customizations: "Extra ghee" },
      { name: "Curd Rice", qty: 1, price: 90, customizations: null },
      { name: "Rasam", qty: 2, price: 60, customizations: "Extra pepper" },
      { name: "Payasam", qty: 2, price: 120, customizations: null },
      { name: "Filter Coffee", qty: 3, price: 90, customizations: null },
    ],
    paymentStatus: "PENDING",
  },
  {
    id: 4,
    tableNo: 5,
    itemsCount: 3,
    total: 420,
    timeSinceOrder: "35 min",
    server: "Ravi",
    items: [
      { name: "Pongal", qty: 2, price: 140, customizations: "More cashews" },
      { name: "Uttapam", qty: 1, price: 110, customizations: "Extra onion" },
      { name: "Badam Milk", qty: 2, price: 100, customizations: null },
    ],
    paymentStatus: "PAID",
  },
  {
    id: 5,
    tableNo: 9,
    itemsCount: 2,
    total: 280,
    timeSinceOrder: "15 min",
    server: "Priya",
    items: [
      { name: "Rava Dosa", qty: 1, price: 130, customizations: "Without onion" },
      { name: "Mysore Pak", qty: 2, price: 80, customizations: null },
      { name: "Tea", qty: 2, price: 60, customizations: null },
    ],
    paymentStatus: "MANUAL CONFIRMED",
  },
]

type TableBill = (typeof mockTableBills)[0]

function getPaymentBadgeStyles(status: string) {
  switch (status) {
    case "PAID":
      return "bg-primary/10 text-primary border-primary/20"
    case "MANUAL CONFIRMED":
      return "bg-amber-100 text-amber-700 border-amber-200"
    default:
      return "bg-muted text-muted-foreground"
  }
}

export default function BillingDashboard() {
  const [selectedTable, setSelectedTable] = useState<TableBill | null>(null)
  const [discount, setDiscount] = useState<string>("0")
  const [showQR, setShowQR] = useState(false)

  const calculateBill = (table: TableBill) => {
    const subtotal = table.items.reduce((sum, item) => sum + item.price * item.qty, 0)
    const gst = subtotal * 0.05
    const discountAmount = parseFloat(discount) || 0
    const total = subtotal + gst - discountAmount
    return { subtotal, gst, discountAmount, total }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Left Panel - Table List */}
      <div className="w-3/5 border-r border-border overflow-auto">
        <div className="p-6 border-b border-border bg-card">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Billing Dashboard</h1>
              <p className="text-sm text-muted-foreground">Cashier View</p>
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-semibold text-muted-foreground mb-4 uppercase tracking-wide">
            Active Tables with Open Bills
          </h2>
          <div className="space-y-3">
            {mockTableBills.map((table) => (
              <Card
                key={table.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedTable?.id === table.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => {
                  setSelectedTable(table)
                  setDiscount("0")
                  setShowQR(false)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 bg-primary/10 rounded-lg flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">T{table.tableNo}</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-card-foreground">
                            Table {table.tableNo}
                          </span>
                          <Badge
                            variant="outline"
                            className={getPaymentBadgeStyles(table.paymentStatus)}
                          >
                            {table.paymentStatus}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {table.itemsCount} items &bull; Server: {table.server}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                          <Clock className="h-3 w-3" />
                          {table.timeSinceOrder}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-card-foreground flex items-center">
                        <IndianRupee className="h-4 w-4" />
                        {table.total}
                      </p>
                      {table.paymentStatus === "PENDING" && (
                        <Button
                          size="sm"
                          className="mt-2"
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTable(table)
                            setDiscount("0")
                            setShowQR(false)
                          }}
                        >
                          Generate Bill
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Bill Detail */}
      <div className="w-2/5 bg-card overflow-auto">
        {selectedTable ? (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-card-foreground">
                  Table {selectedTable.tableNo} Bill
                </h2>
                <p className="text-sm text-muted-foreground">Server: {selectedTable.server}</p>
              </div>
              <Badge
                variant="outline"
                className={getPaymentBadgeStyles(selectedTable.paymentStatus)}
              >
                {selectedTable.paymentStatus}
              </Badge>
            </div>

            {/* Itemized List */}
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium">Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedTable.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-card-foreground">{item.name}</p>
                        {item.customizations && (
                          <p className="text-xs text-muted-foreground">{item.customizations}</p>
                        )}
                        <p className="text-xs text-muted-foreground">Qty: {item.qty}</p>
                      </div>
                      <p className="font-medium text-card-foreground flex items-center">
                        <IndianRupee className="h-3 w-3" />
                        {item.price * item.qty}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Bill Summary */}
            <Card className="mb-6">
              <CardContent className="p-4">
                {(() => {
                  const { subtotal, gst, discountAmount, total } = calculateBill(selectedTable)
                  return (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span className="text-card-foreground flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {subtotal.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">GST (5%)</span>
                        <span className="text-card-foreground flex items-center">
                          <IndianRupee className="h-3 w-3" />
                          {gst.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm items-center gap-4">
                        <Label htmlFor="discount" className="text-muted-foreground">
                          Discount
                        </Label>
                        <div className="flex items-center gap-2">
                          <IndianRupee className="h-3 w-3 text-muted-foreground" />
                          <Input
                            id="discount"
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-24 h-8 text-right"
                            disabled={selectedTable.paymentStatus !== "PENDING"}
                          />
                        </div>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-card-foreground">Total</span>
                        <span className="text-primary flex items-center">
                          <IndianRupee className="h-4 w-4" />
                          {total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )
                })()}
              </CardContent>
            </Card>

            {/* QR Code Display */}
            {showQR && (
              <Card className="mb-6 bg-muted/30">
                <CardContent className="p-6 text-center">
                  <div className="inline-flex items-center justify-center w-40 h-40 bg-card border-2 border-dashed border-border rounded-lg mb-3">
                    <QrCode className="h-24 w-24 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-card-foreground">Scan to Pay via UPI</p>
                  <p className="text-xs text-muted-foreground">sambarflow@upi</p>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            {selectedTable.paymentStatus === "PENDING" && (
              <div className="space-y-3">
                <Button
                  className="w-full gap-2"
                  size="lg"
                  onClick={() => setShowQR(!showQR)}
                >
                  <QrCode className="h-5 w-5" />
                  {showQR ? "Hide QR Code" : "Pay via UPI"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full gap-2 border-amber-300 text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                  size="lg"
                >
                  <Hand className="h-5 w-5" />
                  Manual Confirm (Offline)
                </Button>
              </div>
            )}

            {selectedTable.paymentStatus === "PAID" && (
              <div className="text-center p-6 bg-primary/5 rounded-lg">
                <Check className="h-12 w-12 text-primary mx-auto mb-2" />
                <p className="font-semibold text-primary">Payment Completed</p>
                <p className="text-sm text-muted-foreground">via UPI</p>
              </div>
            )}

            {selectedTable.paymentStatus === "MANUAL CONFIRMED" && (
              <div className="text-center p-6 bg-amber-50 rounded-lg">
                <CreditCard className="h-12 w-12 text-amber-600 mx-auto mb-2" />
                <p className="font-semibold text-amber-700">Manually Confirmed</p>
                <p className="text-sm text-amber-600">Cash / Card payment received</p>
              </div>
            )}
          </div>
        ) : (
          <div className="h-full flex items-center justify-center p-6">
            <div className="text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="font-medium text-card-foreground">Select a table</p>
              <p className="text-sm text-muted-foreground">
                Click on a table card to view and manage its bill
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Receipt(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
      <path d="M12 17.5v-11" />
    </svg>
  )
}
