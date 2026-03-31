"use client"

import { useState } from "react"
import { use } from "react"
import {
  Search,
  Plus,
  Minus,
  ShoppingCart,
  X,
  ChevronRight,
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

// Mock data for menu items
const menuCategories = ["All", "Tiffin", "Rice", "Starters", "Beverages"]

const menuItems = [
  { id: 1, name: "Masala Dosa", price: 120, category: "Tiffin", veg: true, description: "Crispy rice crepe with spiced potato filling", ingredients: ["Rice batter", "Potato", "Onion", "Spices"] },
  { id: 2, name: "Idli Sambar", price: 80, category: "Tiffin", veg: true, description: "Steamed rice cakes with lentil stew", ingredients: ["Rice", "Urad dal", "Sambar"] },
  { id: 3, name: "Medu Vada", price: 60, category: "Tiffin", veg: true, description: "Crispy fried lentil doughnuts", ingredients: ["Urad dal", "Curry leaves", "Spices"] },
  { id: 4, name: "Uttapam", price: 100, category: "Tiffin", veg: true, description: "Thick rice pancake with vegetable toppings", ingredients: ["Rice batter", "Onion", "Tomato", "Capsicum"] },
  { id: 5, name: "Rava Dosa", price: 130, category: "Tiffin", veg: true, description: "Crispy semolina crepe", ingredients: ["Semolina", "Rice flour", "Spices"] },
  { id: 6, name: "Pongal", price: 90, category: "Tiffin", veg: true, description: "Comfort food of rice and lentils with ghee", ingredients: ["Rice", "Moong dal", "Ghee", "Pepper"] },
  { id: 7, name: "Curd Rice", price: 90, category: "Rice", veg: true, description: "Cool and creamy yogurt rice", ingredients: ["Rice", "Curd", "Mustard", "Curry leaves"] },
  { id: 8, name: "Sambar Rice", price: 110, category: "Rice", veg: true, description: "Rice mixed with flavorful sambar", ingredients: ["Rice", "Sambar", "Vegetables"] },
  { id: 9, name: "Lemon Rice", price: 100, category: "Rice", veg: true, description: "Tangy rice with lemon and peanuts", ingredients: ["Rice", "Lemon", "Peanuts", "Turmeric"] },
  { id: 10, name: "Chicken 65", price: 220, category: "Starters", veg: false, description: "Spicy deep-fried chicken", ingredients: ["Chicken", "Spices", "Curry leaves"] },
  { id: 11, name: "Gobi Manchurian", price: 150, category: "Starters", veg: true, description: "Indo-Chinese cauliflower dish", ingredients: ["Cauliflower", "Soy sauce", "Ginger", "Garlic"] },
  { id: 12, name: "Paneer Pakora", price: 160, category: "Starters", veg: true, description: "Crispy fried cottage cheese fritters", ingredients: ["Paneer", "Gram flour", "Spices"] },
  { id: 13, name: "Filter Coffee", price: 40, category: "Beverages", veg: true, description: "Traditional South Indian coffee", ingredients: ["Coffee", "Milk", "Sugar"] },
  { id: 14, name: "Masala Tea", price: 30, category: "Beverages", veg: true, description: "Spiced Indian tea", ingredients: ["Tea", "Milk", "Ginger", "Cardamom"] },
  { id: 15, name: "Badam Milk", price: 60, category: "Beverages", veg: true, description: "Almond-flavored milk drink", ingredients: ["Milk", "Almonds", "Saffron", "Sugar"] },
  { id: 16, name: "Fresh Lime Soda", price: 50, category: "Beverages", veg: true, description: "Refreshing lime drink", ingredients: ["Lime", "Soda", "Sugar/Salt"] },
]

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

type CartItem = {
  id: number
  name: string
  price: number
  qty: number
  spiceLevel: string
  extras: string[]
  extrasCost: number
}

export default function CustomerMenuPage({
  params,
}: {
  params: Promise<{ tableId: string }>
}) {
  const { tableId } = use(params)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedItem, setSelectedItem] = useState<(typeof menuItems)[0] | null>(null)
  const [cart, setCart] = useState<CartItem[]>([])
  const [quantity, setQuantity] = useState(1)
  const [spiceLevel, setSpiceLevel] = useState("medium")
  const [selectedExtras, setSelectedExtras] = useState<string[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  const filteredItems = menuItems.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
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
      price: selectedItem.price,
      qty: quantity,
      spiceLevel,
      extras: selectedExtras,
      extrasCost,
    }

    const existingIndex = cart.findIndex(
      (item) =>
        item.id === newItem.id &&
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

  const cartTotal = cart.reduce((sum, item) => sum + (item.price + item.extrasCost) * item.qty, 0)
  const cartItemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const gst = cartTotal * 0.05
  const grandTotal = cartTotal + gst

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
                      Add to Cart - ₹
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
              <span className="ml-auto font-semibold">₹{cartTotal}</span>
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
                                {" "}
                                &bull;{" "}
                                {item.extras
                                  .map((e) => customizationOptions.extras.find((x) => x.id === e)?.label)
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
                          ₹{(item.price + item.extrasCost) * item.qty}
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
              <Button className="w-full" size="lg">
                Place Order
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  )
}
