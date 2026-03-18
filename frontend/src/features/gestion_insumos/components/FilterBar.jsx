import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"

export function FilterBar({ 
  search, categoryFilter, stockFilter, sortBy, sortOrder,
  categories, stockStatuses, 
  onSearchChange, onCategoryChange, onStockChange, onSortByChange, onSortOrderChange 
}) {
  const handleSortToggle = (field) => {
    if (sortBy === field) {
      // Si ya está ordenando por este campo, cambiar el orden
      onSortOrderChange(sortOrder === "asc" ? "desc" : "asc")
    } else {
      // Si es un campo diferente, establecerlo y orden ascendente
      onSortByChange(field)
      onSortOrderChange("asc")
    }
  }

  const getSortIcon = (field) => {
    if (sortBy !== field) return <ArrowUpDown className="h-4 w-4" />
    return sortOrder === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
  }
  return (
    <div className="flex gap-3 flex-1">
      <Input
        placeholder="Buscar por nombre o marca..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm border-none bg-neutral-100 focus-visible:outline-none focus-visible:ring-2"
      />

      <Select value={categoryFilter} onValueChange={onCategoryChange}>
        <SelectTrigger className="w-50 cursor-pointer bg-neutral-100 border-none text-muted-foreground">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          {categories.map(cat => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={stockFilter} onValueChange={onStockChange}>
        <SelectTrigger className="w-50 cursor-pointer bg-neutral-100 border-none text-muted-foreground">
          <SelectValue placeholder="Estado stock" />
        </SelectTrigger>
        <SelectContent>
          {stockStatuses.map(status => (
            <SelectItem key={status.value} value={status.value}>
              {status.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer bg-neutral-100 border-none"
        onClick={() => handleSortToggle("name")}
        title={`Ordenar por nombre (${sortBy === "name" ? (sortOrder === "asc" ? "ascendente" : "descendente") : "clic para ordenar"})`}
      >
        Nombre {getSortIcon("name")}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer bg-neutral-100 border-none"
        onClick={() => handleSortToggle("stock")}
        title={`Ordenar por stock (${sortBy === "stock" ? (sortOrder === "asc" ? "ascendente" : "descendente") : "clic para ordenar"})`}
      >
        Stock {getSortIcon("stock")}
      </Button>

      {(search || categoryFilter !== "all" || stockFilter !== "all") && (
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={() => {
            onSearchChange("")
            onCategoryChange("all")
            onStockChange("all")
          }}
          title="Limpiar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}