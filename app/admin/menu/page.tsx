"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Upload,
  AlertTriangle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

type Ingredient = { name: string; allergen: boolean }
type CustomizationOption = { name: string; price: number }
type CustomizationGroup = { group: string; options: CustomizationOption[] }

type Dish = {
  id: string
  name: string
  category: string
  price: number
  veg: boolean
  available: boolean
  description: string
  ingredients: Ingredient[]
  customizations: CustomizationGroup[]
}

export default function MenuManagementPage() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [menuCategories, setMenuCategories] = useState<string[]>([])
  const [menuLoading, setMenuLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [editingDish, setEditingDish] = useState<Dish | null>(null)
  const [isAddingNew, setIsAddingNew] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "Tiffin",
    price: "",
    description: "",
    veg: true,
    ingredients: [] as Ingredient[],
    customizations: [] as CustomizationGroup[],
  })
  const [newIngredient, setNewIngredient] = useState("")
  const [newGroupName, setNewGroupName] = useState("")
  const [newOptionName, setNewOptionName] = useState("")
  const [newOptionPrice, setNewOptionPrice] = useState("")
  const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null)

  const defaultCategory = menuCategories[0] ?? "Tiffin"

  const fetchMenu = async () => {
    try {
      setMenuLoading(true)
      const res = await fetch("/api/menu", { cache: "no-store" })
      if (!res.ok) {
        toast.error("Failed to fetch menu")
        return
      }

      const data = (await res.json()) as Array<{
        name: string
        items: Array<{
          id: string
          name: string
          price: number
          veg: boolean
          description: string
          ingredients?: string[]
        }>
      }>

      const nextCategories = data.map((c) => c.name)
      const nextDefaultCategory = nextCategories[0] ?? "Tiffin"
      setMenuCategories(nextCategories)

      const nextDishes: Dish[] = data.flatMap((cat) =>
        cat.items.map((item) => ({
          id: item.id,
          name: item.name,
          category: cat.name,
          price: item.price,
          veg: item.veg,
          available: true,
          description: item.description ?? "",
          ingredients: (item.ingredients ?? []).map((i) => ({ name: i, allergen: false })),
          customizations: [],
        }))
      )

      setDishes(nextDishes)

      // If the currently selected form category is no longer valid, reset it.
      setFormData((prev) => ({
        ...prev,
        category: nextCategories.includes(prev.category) ? prev.category : nextDefaultCategory,
      }))
    } catch {
      toast.error("Failed to fetch menu")
    } finally {
      setMenuLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filteredDishes =
    selectedCategory === "All"
      ? dishes
      : dishes.filter((d) => d.category === selectedCategory)

  const resetForm = () => {
    setFormData({
      name: "",
      category: defaultCategory,
      price: "",
      description: "",
      veg: true,
      ingredients: [],
      customizations: [],
    })
    setNewIngredient("")
    setNewGroupName("")
    setNewOptionName("")
    setNewOptionPrice("")
    setSelectedGroupIndex(null)
  }

  const openEditSheet = (dish: Dish) => {
    setEditingDish(dish)
    setIsAddingNew(false)
    setFormData({
      name: dish.name,
      category: dish.category,
      price: dish.price.toString(),
      description: dish.description,
      veg: dish.veg,
      ingredients: [...dish.ingredients],
      customizations: dish.customizations.map((c) => ({
        group: c.group,
        options: [...c.options],
      })),
    })
  }

  const openAddSheet = () => {
    setEditingDish(null)
    setIsAddingNew(true)
    resetForm()
  }

  const handleAddIngredient = () => {
    if (newIngredient.trim()) {
      setFormData({
        ...formData,
        ingredients: [...formData.ingredients, { name: newIngredient.trim(), allergen: false }],
      })
      setNewIngredient("")
    }
  }

  const handleRemoveIngredient = (index: number) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    })
  }

  const toggleAllergen = (index: number) => {
    const updated = [...formData.ingredients]
    updated[index].allergen = !updated[index].allergen
    setFormData({ ...formData, ingredients: updated })
  }

  const handleAddCustomizationGroup = () => {
    if (newGroupName.trim()) {
      setFormData({
        ...formData,
        customizations: [...formData.customizations, { group: newGroupName.trim(), options: [] }],
      })
      setNewGroupName("")
    }
  }

  const handleRemoveCustomizationGroup = (index: number) => {
    setFormData({
      ...formData,
      customizations: formData.customizations.filter((_, i) => i !== index),
    })
  }

  const handleAddOption = (groupIndex: number) => {
    if (newOptionName.trim()) {
      const updated = [...formData.customizations]
      updated[groupIndex].options.push({
        name: newOptionName.trim(),
        price: parseFloat(newOptionPrice) || 0,
      })
      setFormData({ ...formData, customizations: updated })
      setNewOptionName("")
      setNewOptionPrice("")
    }
  }

  const handleRemoveOption = (groupIndex: number, optionIndex: number) => {
    const updated = [...formData.customizations]
    updated[groupIndex].options = updated[groupIndex].options.filter((_, i) => i !== optionIndex)
    setFormData({ ...formData, customizations: updated })
  }

  const handleSave = async () => {
    const name = formData.name.trim()
    const description = formData.description
    const category = formData.category
    const priceNum = parseFloat(formData.price)

    if (!name) {
      toast.error("Dish name is required")
      return
    }
    if (!category) {
      toast.error("Category is required")
      return
    }
    if (!Number.isFinite(priceNum) || priceNum < 0) {
      toast.error("Invalid price")
      return
    }

    const payload = {
      name,
      category,
      price: priceNum,
      veg: formData.veg,
      description: description || null,
    }

    try {
      if (isAddingNew) {
        const res = await fetch("/api/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          toast.error("Failed to add dish")
          return
        }
        toast.success("Dish added")
      } else if (editingDish) {
        const res = await fetch(`/api/menu/items/${editingDish.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          toast.error("Failed to update dish")
          return
        }
        toast.success("Dish updated")
      }

      await fetchMenu()
      resetForm()
      setEditingDish(null)
      setIsAddingNew(false)
    } catch {
      toast.error("Network error")
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/menu/items/${id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Failed to delete dish")
        return
      }
      toast.success("Dish deleted")
      await fetchMenu()
    } catch {
      toast.error("Network error")
    }
  }

  if (menuLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading menu...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-bold text-card-foreground">Menu Management</h1>
              <p className="text-sm text-muted-foreground">Manage dishes and customizations</p>
            </div>
          </div>
          <Sheet
            open={isAddingNew || editingDish !== null}
            onOpenChange={(open) => {
              if (!open) {
                setIsAddingNew(false)
                setEditingDish(null)
                resetForm()
              }
            }}
          >
            <SheetTrigger asChild>
              <Button className="gap-2" onClick={openAddSheet}>
                <Plus className="h-4 w-4" />
                Add Dish
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg">
              <SheetHeader>
                <SheetTitle>{isAddingNew ? "Add New Dish" : "Edit Dish"}</SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Dish Name</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Enter dish name"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Select
                          value={formData.category}
                          onValueChange={(value) => setFormData({ ...formData, category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                          {menuCategories.map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="price">Price (₹)</Label>
                        <Input
                          id="price"
                          type="number"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Brief description of the dish"
                        rows={2}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <Switch
                        id="veg"
                        checked={formData.veg}
                        onCheckedChange={(checked) => setFormData({ ...formData, veg: checked })}
                      />
                      <Label htmlFor="veg" className="flex items-center gap-2">
                        <span
                          className={`h-3 w-3 rounded-sm ${
                            formData.veg ? "bg-emerald-500" : "bg-red-500"
                          }`}
                        />
                        {formData.veg ? "Vegetarian" : "Non-Vegetarian"}
                      </Label>
                    </div>
                  </div>

                  <Separator />

                  {/* Image Upload Placeholder */}
                  <div>
                    <Label>Dish Image</Label>
                    <div className="mt-2 border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer">
                      <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Click to upload image</p>
                      <p className="text-xs text-muted-foreground">PNG, JPG up to 2MB</p>
                    </div>
                  </div>

                  <Separator />

                  {/* Ingredients */}
                  <div>
                    <Label>Ingredients</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Type ingredient and press Enter. Check to mark as allergen.
                    </p>
                    <div className="flex gap-2 mb-3">
                      <Input
                        value={newIngredient}
                        onChange={(e) => setNewIngredient(e.target.value)}
                        placeholder="Add ingredient"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault()
                            handleAddIngredient()
                          }
                        }}
                      />
                      <Button type="button" variant="outline" onClick={handleAddIngredient}>
                        Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.ingredients.map((ing, idx) => (
                        <Badge
                          key={idx}
                          variant={ing.allergen ? "destructive" : "secondary"}
                          className="gap-2 pr-1"
                        >
                          <Checkbox
                            checked={ing.allergen}
                            onCheckedChange={() => toggleAllergen(idx)}
                            className="h-3 w-3"
                          />
                          {ing.name}
                          {ing.allergen && <AlertTriangle className="h-3 w-3" />}
                          <button
                            onClick={() => handleRemoveIngredient(idx)}
                            className="ml-1 hover:bg-foreground/10 rounded p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Customization Groups */}
                  <div>
                    <Label>Customization Groups</Label>
                    <p className="text-xs text-muted-foreground mb-3">
                      Add groups like &quot;Extras&quot; or &quot;Spice Level&quot; with options.
                    </p>
                    <div className="flex gap-2 mb-4">
                      <Input
                        value={newGroupName}
                        onChange={(e) => setNewGroupName(e.target.value)}
                        placeholder="Group name (e.g., Extras)"
                      />
                      <Button type="button" variant="outline" onClick={handleAddCustomizationGroup}>
                        Add Group
                      </Button>
                    </div>

                    <div className="space-y-4">
                      {formData.customizations.map((group, groupIdx) => (
                        <Card key={groupIdx}>
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-card-foreground">{group.group}</h4>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveCustomizationGroup(groupIdx)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            {/* Options */}
                            <div className="space-y-2 mb-3">
                              {group.options.map((opt, optIdx) => (
                                <div
                                  key={optIdx}
                                  className="flex items-center justify-between bg-muted/50 rounded px-3 py-2"
                                >
                                  <span className="text-sm">{opt.name}</span>
                                  <div className="flex items-center gap-2">
                                    {opt.price > 0 && (
                                      <span className="text-sm text-muted-foreground">
                                        +₹{opt.price}
                                      </span>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-6 w-6"
                                      onClick={() => handleRemoveOption(groupIdx, optIdx)}
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Add Option */}
                            {selectedGroupIndex === groupIdx ? (
                              <div className="flex gap-2">
                                <Input
                                  value={newOptionName}
                                  onChange={(e) => setNewOptionName(e.target.value)}
                                  placeholder="Option name"
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  value={newOptionPrice}
                                  onChange={(e) => setNewOptionPrice(e.target.value)}
                                  placeholder="Price"
                                  className="w-20"
                                />
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    handleAddOption(groupIdx)
                                    setSelectedGroupIndex(null)
                                  }}
                                >
                                  Add
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full"
                                onClick={() => setSelectedGroupIndex(groupIdx)}
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Option
                              </Button>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>
              <SheetFooter className="mt-6">
                <SheetClose asChild>
                  <Button variant="outline">Cancel</Button>
                </SheetClose>
                <Button onClick={handleSave}>Save Dish</Button>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pb-4 flex gap-2 overflow-x-auto">
          <Button
            variant={selectedCategory === "All" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("All")}
          >
            All
          </Button>
          {menuCategories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </Button>
          ))}
        </div>
      </header>

      {/* Table */}
      <main className="p-6">
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="w-24">Type</TableHead>
                <TableHead className="w-24">Available</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDishes.map((dish) => (
                <TableRow key={dish.id}>
                  <TableCell>
                    <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center">
                      <span className="text-lg opacity-30">🍽️</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium text-card-foreground">{dish.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{dish.category}</Badge>
                  </TableCell>
                  <TableCell>₹{dish.price}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center gap-1.5 text-sm ${
                        dish.veg ? "text-emerald-600" : "text-red-600"
                      }`}
                    >
                      <span
                        className={`h-2.5 w-2.5 rounded-sm ${
                          dish.veg ? "bg-emerald-500" : "bg-red-500"
                        }`}
                      />
                      {dish.veg ? "Veg" : "Non-Veg"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={dish.available}
                      disabled
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => openEditSheet(dish)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Dish</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete &quot;{dish.name}&quot;? This action cannot
                              be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(dish.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>
    </div>
  )
}
