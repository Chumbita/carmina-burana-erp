import { useEffect, useState } from "react"
import { getInsumos, createInsumo } from "../services/insumos.service"
import { InsumosTable } from "../components/InsumosTable"
import { NewInsumoModal } from "../components/NewInsumoModal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/Separator"
import { RefreshCcw, Plus, X } from "lucide-react"

export default function InsumosPage() {
  const [insumos, setInsumos] = useState([])
  const [openNewInsumo, setOpenNewInsumo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("todas")

  // Categorías disponibles, hasta conectar con backend.
  const categorias = [
    { value: "todas", label: "Categorías..." },
    { value: "Lúpulo", label: "Lúpulo" },
    { value: "Malta", label: "Malta" },
    { value: "Envases", label: "Envases" },
  ]

  useEffect(() => {
    getInsumos().then(data => {
      setInsumos(data)
      setLoading(false)
      console.log(data)
    })
  }, [])

  //crear insumo    
  function handleCreateInsumo(data) {
    createInsumo(data).then((nuevoInsumo) => {
      setInsumos(prev => [...prev, nuevoInsumo])
    })
  }

  //manejar loading
  if (loading) {
    return <p>Cargando insumos...</p>
  }

  //filtros
  const insumosFiltrados = insumos.filter(insumo => {
    const searchLower = search.trim().toLowerCase()
    
    // Filtro de búsqueda (nombre o marca)
    const matchesSearch = 
      insumo.nombre?.toLowerCase().includes(searchLower) ||
      insumo.marca?.toLowerCase().includes(searchLower)
    
    // Filtro de categoría
    const matchesCategoria = 
      categoriaFilter === "todas" || 
      insumo.categoria === categoriaFilter
    
    return matchesSearch && matchesCategoria
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        <div className="flex gap-3 flex-1">
          <Input
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm"
          />
          
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter} >
            <SelectTrigger className="w-50 cursor-s-resize">
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

          {/* Botón para limpiar filtros (opcional) */}
          {(search || categoriaFilter !== "todas") && (
            <Button 
              variant="outline" 
              size="icon"
              className="cursor-pointer"
              onClick={() => {
                setSearch("")
                setCategoriaFilter("todas")
              }}
              title="Limpiar filtros"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Button className="cursor-pointer" onClick={() => setOpenNewInsumo(true)}>
          <Plus />Agregar insumo 
        </Button>
      </header>

      <NewInsumoModal
        open={openNewInsumo}
        onClose={() => setOpenNewInsumo(false)}
        onSubmit={handleCreateInsumo}
      />

      {/* Mostrar mensaje si no hay resultados después de filtrar */}
      {insumosFiltrados.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          {search || categoriaFilter !== "todas" 
            ? "No se encontraron insumos" 
            : "No hay insumos registrados"}
        </p>
      ) : (
        <InsumosTable insumos={insumosFiltrados} />
      )}
    </div>
  )
}