import { useEffect, useState, useRef } from "react"
import { inputService } from "../services/inputService"
import { InputsTable } from "../components/InputsTable"
import { NewInputModal } from "../components/NewInputModal"
import { AlertIndicatorSuccess, AlertIndicatorDestructive } from "../components/Notifications"

//componentes shadcn
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select"
import { Separator } from "@/components/ui/Separator"
import { Spinner } from "@/components/ui/Spinner"

//iconos
import { RefreshCcw, Plus, X } from "lucide-react"


export default function InputsPage() {
  const [insumos, setInsumos] = useState([])
  const [openNewInsumo, setOpenNewInsumo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoriaFilter, setCategoriaFilter] = useState("todas")

  // Estado para notificaciones
  const [notification, setNotification] = useState(null)
  const [lastCreatedInsumoId, setLastCreatedInsumoId] = useState(null)

  // Ref para la tabla
  const tableRef = useRef(null)

  // Categorías disponibles, hardcodeadas por ahora
  const categorias = [
    { value: "todas", label: "Categorías..." },
    { value: "Lúpulo", label: "Lúpulo" },
    { value: "Malta", label: "Malta" },
    { value: "Envases", label: "Envases" },
  ]

  // OBTENER Y CARGAR INSUMOS 
  async function loadInsumos() {
    try {
      const data = await inputService.getAll()
      setInsumos(data)
    } catch (error) {

    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadInsumos()
  }, [])

  // CREAR INUSMO (esta funcion es enviada como prop al modal) 
  async function handleCreateInsumo(insumoData) {
    try {
      const nuevoInsumo = await inputService.create(insumoData)
      setInsumos(prev => [...prev, nuevoInsumo])
      setLastCreatedInsumoId(nuevoInsumo.id)
      setOpenNewInsumo(false)
      setNotification({
        type: 'success',
        message: `Insumo "${nuevoInsumo.name}" creado exitosamente`
      })

    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Error al crear el insumo. Inténtalo de nuevo.'
      })

      throw error
    }
  }

  // navegar al insumo creado
  function handleNotificationClick() {
    if (lastCreatedInsumoId && tableRef.current) {
      const insumoRow = tableRef.current.querySelector(`[data-insumo-id="${lastCreatedInsumoId}"]`)

      if (insumoRow) {
        insumoRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
        insumoRow.classList.add('bg-green-100', 'dark:bg-green-900')
        setTimeout(() => {
          insumoRow.classList.remove('bg-green-100', 'dark:bg-green-900')
        }, 2000)
      }
    }
    setNotification(null)
  }

  //eliminar insumo (render)
  const handleDeleteSuccess = (id) => {
    setInsumos(prev => prev.filter(i => i.id !== id))
  }


  // cerrar notificación
  function handleCloseNotification() {
    setNotification(null)
  }

  // loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  // Filtros
  const insumosFiltrados = insumos.filter(insumo => {
    const searchLower = search.trim().toLowerCase()

    // Filtro de búsqueda (nombre o marca)
    const matchesSearch =
      insumo.name?.toLowerCase().includes(searchLower) ||
      insumo.brand?.toLowerCase().includes(searchLower)

    // Filtro de categoría
    const matchesCategoria =
      categoriaFilter === "todas" ||
      insumo.category === categoriaFilter

    return matchesSearch && matchesCategoria
  })

  return (
    <div className="space-y-4">
      {/* Notificaciones */}
      {notification?.type === 'success' && (
        <AlertIndicatorSuccess
          message={notification.message}
          onClose={handleCloseNotification}
          onClick={handleNotificationClick}
          duration={6000}
        />
      )}

      {notification?.type === 'error' && (
        <AlertIndicatorDestructive
          message={notification.message}
          onClose={handleCloseNotification}
          duration={6000}
        />
      )}

      {/* Header */}
      <header className="flex items-center justify-between gap-4">
        {/* Filtros */}
        <div className="flex gap-3 flex-1">
          <Input
            placeholder="Buscar por nombre o marca..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="max-w-sm border-none bg-neutral-100 
            focus-visible:outline-none focus-visible:ring-2"
          />

          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
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

          {/* Botón para limpiar filtros */}
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

        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpenNewInsumo(true)}
        >
          <Plus />Agregar insumo
        </Button>
      </header>

      <NewInputModal
        open={openNewInsumo}
        onClose={() => setOpenNewInsumo(false)}
        onSubmit={handleCreateInsumo}
      />

      {/* Mostrar mensaje si no hay resultados, sino tabla */}
      {insumosFiltrados.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          {search || categoriaFilter !== "todas"
            ? "No se encontraron insumos"
            : "No hay insumos registrados"}
        </p>
      ) : (
        <div ref={tableRef}>
          <InputsTable 
            insumos={insumosFiltrados} 
            onDeleteSuccess={handleDeleteSuccess}
          />
        </div>
      )}
    </div>
  )
}
