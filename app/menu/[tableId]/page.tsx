"use client"

import { useState, useEffect } from "react"
import { use } from "react"
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  X,
  ChevronRight,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

type MenuItem = {
  id: string
  name: string
  price: number
  veg: boolean
  description: string
  ingredients: string[]
}

type MenuData = Array<{
  name: string
  items: MenuItem[]
}>

type CartItem = {
  id: string
  name: string
  price: number
  qty: number
  spiceLevel: string
  extras: string[]
  extrasCost: number
  itemId: string
}

const customizationOptions = {
  extras: [
    { id: "extra-chutney", label: "Extra Chutney", price: 20 },
    { id: "extra-sambar", label: "Extra Sambar", price: 25 },
    { id: "ghee", label: "Add Ghee", price: 30 },
  ],
  spiceLevel: [
    { id: "mild", label: "Mild" },
    { id: "medium", label: "Medium" },
    { id: "spicy", label: "Spicy" },
  ],
}

export default function CustomerMenuPage({
  params,
}: {
  params: Promise<{ tableId: string }>
}) {
  const { tableId } = use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [menuData, setMenuData] = useState<MenuData>([])
  const [allItems, setAllItems] = useState<MenuItem[]>([])
  const [menuCategories, setMenuCategories] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [quantity, setQuantity] = useState(1)
  const [spiceLevel, setSpiceLevel] = useState("medium")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [placingOrder, setPlacingOrder] = useState(false)

  useEffect(() => {
    fetchMenu()
  }, [])

  const fetchMenu = async () => {
    try {
      const res = await fetch('/api/menu')
      if (res.ok) {
        const data: MenuData = await res.json()
        setMenuData(data)
        const categories = ['All', ...data.map(cat => cat.name)]
        setMenuCategories(categories)
        const items = data.flatMap(cat => cat.items)
        setAllItems(items)
      }
    } catch (error) {
      toast.error('Failed to fetch menu')
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = allItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || 
      menuData.find(cat => cat.name === selectedCategory)?.items.some(i => i.id === item.id)
    return matchesSearch && matchesCategory
  })

  const addToCart = () => {
    if (!selectedItem) return

    const extrasCost = selectedExtras.reduce((sum, extraId) => {
      const extra = customizationOptions.extras.find((e) => e.id === extraId)
      return sum + (extra?.price || 0)
    }, 0)

    const newItem: CartItem = {
      id: selectedItem.id,
      name: selectedItem.name,
      itemId: selectedItem.id,
      price: selectedItem.price,
      qty: quantity,
      spiceLevel,
      extras: selectedExtras,
      extrasCost,
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item.itemId === newItem.itemId &&
        item.spiceLevel === newItem.spiceLevel &&
        JSON.stringify(item.extras.sort()) === JSON.stringify(newItem.extras.sort())
    )

    if (existingIndex > -1) {
      const updatedCart = [...cart]
      updatedCart[existingIndex].qty += quantity
      setCart(updatedCart)
    } else {
      setCart([...cart, newItem])
    }

    // Reset
    setSelectedItem(null)
    setQuantity(1)
    setSpiceLevel("medium")
    setSelectedExtras([])
  }

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const updateCartQty = (index: number, delta: number) => {
    const updatedCart = [...cart]
    updatedCart[index].qty += delta
    if (updatedCart[index].qty <= 0) {
      updatedCart.splice(index, 1)
    }
    setCart(updatedCart)
  }

  const placeOrder = async () => {
    if (cart.length === 0) return

    setPlacingOrder(true)
    try {
      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableId: parseInt(tableId),
          items: cart.map(item => ({
            itemId: item.itemId,
            qty: item.qty,
            price: item.price,
            spiceLevel: item.spiceLevel,
            extras: item.extras,
            extrasCost: item.extrasCost
          }))
        })
      })

      if (res.ok) {
        toast.success('Order placed successfully!')
        setCart([])
      } else {
        toast.error('Failed to place order')
      }
    } catch (error) {
      toast.error('Network error')
    } finally {
      setPlacingOrder(false)
    }
  }

  const cartTotal = cart.reduce((sum, item) => sum + (item.price + item.extrasCost) * item.qty, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const gst = cartTotal * 0.05
  const grandTotal = cartTotal + gst

  if (loading) {
    return (
      <div className="min-h-screen bg-background max-w-[430px] mx-auto flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background max-w-[430px] mx-auto relative">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-20 px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-bold text-card-foreground">Sambar Flow</h1>
            <p className="text-sm text-muted-foreground">Table {tableId}</p>
          </div>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
            Dine In
          </Badge>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search dishes..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Category Tabs */}
      <div className="sticky top-[108px] z-10 bg-background border-b border-border">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2 px-4 py-3">
            {menuCategories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Menu Grid */}
      <main className="p-4 pb-24">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No items found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => (
              <Sheet key={item.id} onOpenChange={(open) => {
                if (open) {
                  setSelectedItem(item)
                  setQuantity(1)
                  setSpiceLevel("medium")
                  setSelectedExtras([])
                }
              }}>
                <SheetTrigger asChild>
                  <Card className="cursor-pointer hover:shadow-md transition-shadow overflow-hidden">
                    <div className="h-24 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <span className="text-3xl opacity-30">🍽️</span>
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-1 mb-1">
                        <h3 className="font-medium text-sm text-card-foreground leading-tight">
                          {item.name}
                        </h3>
                        <span
                          className={`h-3 w-3 rounded-sm flex-shrink-0 mt-0.5 ${
                            item.veg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">₹{item.price}</span>
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl max-w-[430px] mx-auto">
                  <SheetHeader>
                    <SheetTitle className="text-left">{item.name}</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-6 overflow-auto max-h-[calc(85vh-180px)]">
                    {/* Description */}
                    <div>
                      <p className="text-muted-foreground">{item.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`h-3 w-3 rounded-sm ${
                            item.veg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.veg ? "Vegetarian" : "Non-Vegetarian"}
                        </span>
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h4 className="font-medium mb-2">Ingredients</h4>
                      <div className="flex flex-wrap gap-2">
                        {item.ingredients.map((ing) => (
                          <Badge key={ing} variant="secondary">
                            {ing}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Spice Level */}
                    <div>
                      <h4 className="font-medium mb-3">Spice Level</h4>
                      <RadioGroup value={spiceLevel} onValueChange={setSpiceLevel} className="flex gap-4">
                        {customizationOptions.spiceLevel.map((level) => (
                          <div key={level.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={level.id} id={level.id} />
                            <Label htmlFor={level.id}>{level.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Extras */}
                    <div>
                      <h4 className="font-medium mb-3">Extras</h4>
                      <div className="space-y-3">
                        {customizationOptions.extras.map((extra) => (
                          <div key={extra.id} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id={extra.id}
                                checked={selectedExtras.includes(extra.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedExtras([...selectedExtras, extra.id])
                                  } else {
                                    setSelectedExtras(selectedExtras.filter((e) => e !== extra.id))
                                  }
                                }}
                              />
                              <Label htmlFor={extra.id}>{extra.label}</Label>
                            </div>
                            <span className="text-sm text-muted-foreground">+₹{extra.price}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quantity */}
                    <div>
                      <h4 className="font-medium mb-3">Quantity</h4>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-lg font-semibold w-8 text-center">{quantity}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(quantity + 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
                    <SheetClose asChild>
                      <Button className="w-full" size="lg" onClick={addToCart}>
                        Add {quantity} to Cart - ₹
                        {(item.price +
                          selectedExtras.reduce((sum, extraId) => {
                            const extra = customizationOptions.extras.find((e) => e.id === extraId)
                            return sum + (extra?.price || 0)
                          }, 0)) *
                          quantity}
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </div>
        )}
      </main>

      {/* Floating Cart Button */}
      {cartItemCount > 0 && (
        <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
          <SheetTrigger asChild>
            <Button
              className="fixed bottom-6 left-1/2 -translate-x-1/2 gap-3 px-6 shadow-lg max-w-[400px] w-[calc(100%-32px)]"
              size="lg"
            >
              <ShoppingCart className="h-5 w-5" />
              <span>
                {cartItemCount} {cartItemCount === 1 ? "item" : "items"}
              </span>
              <span className="ml-auto font-semibold">₹{cartTotal.toFixed(0)}</span>
              <ChevronRight className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl max-w-[430px] mx-auto">
            <SheetHeader>
              <SheetTitle>Your Cart</SheetTitle>
            </SheetHeader>
            <ScrollArea className="mt-4 h-[calc(85vh-240px)]">
              <div className="space-y-4 pr-4">
                {cart.map((item, idx) => (
                  <Card key={idx}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-card-foreground">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">
                            Spice: {item.spiceLevel}
                            {item.extras.length > 0 && (
                              <span>
                                {" "}&bull;{" "}
                                {item.extras
                                  .map((e) => customizationOptions.extras.find((x) => x.id === e)?.label)
                                  .filter(Boolean)
                                  .join(", ")}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground"
                          onClick={() => removeFromCart(idx)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartQty(idx, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-6 text-center font-medium">{item.qty}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateCartQty(idx, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-semibold text-card-foreground">
                          ₹{((item.price + item.extrasCost) * item.qty).toFixed(0)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Bill Summary */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-card border-t border-border">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">GST (5%)</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span className="text-primary">₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full" size="lg" onClick={placeOrder} disabled={placingOrder || cart.length === 0}>
                {placingOrder ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Place Order
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}

