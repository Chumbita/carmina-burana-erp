import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Button } from "@/components/ui/Button"
import { X } from "lucide-react"

export function FilterBar({ search, categoriaFilter, categorias, onSearchChange, onCategoriaChange }) {
  return (
    <div className="flex gap-3 flex-1">
      <Input
        placeholder="Buscar por nombre o marca..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="max-w-sm border-none bg-neutral-100 focus-visible:outline-none focus-visible:ring-2"
      />

      <Select value={categoriaFilter} onValueChange={onCategoriaChange}>
        <SelectTrigger className="w-50 cursor-pointer bg-neutral-100 border-none text-muted-foreground">
          <SelectValue placeholder="Categoría" />
        </SelectTrigger>
        <SelectContent>
          {categorias.map(cat => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {(search || categoriaFilter !== "todas") && (
        <Button
          variant="outline"
          size="icon"
          className="cursor-pointer"
          onClick={() => {
            onSearchChange("")
            onCategoriaChange("todas")
          }}
          title="Limpiar filtros"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )
}