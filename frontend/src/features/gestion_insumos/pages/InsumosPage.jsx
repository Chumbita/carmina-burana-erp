import { useEffect, useState, useRef } from "react"
import { inputService } from "../services/inputService"
import { InsumosTable } from "../components/InsumosTable"
import { NewInsumoModal } from "../components/NewInsumoModal"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/Separator"
import { RefreshCcw, Plus, X } from "lucide-react"
import { AlertIndicatorSuccess, AlertIndicatorDestructive } from "../components/Notifications"



export default function InsumosPage() {
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

  useEffect(() => {
    loadInsumos()
  }, [])

  // OBTENER Y CARGAR INSUMOS 
  async function loadInsumos() {
    try {
      const data = await inputService.getAll()
      console.log(data)
      setInsumos(data)
     
    } catch (error) {
      console.error("Error al cargar insumos:", error)
    } finally {
      setLoading(false)
    }
  }

  // CREAR INUSMO  
  async function handleCreateInsumo(insumoData) {
    try {
      const nuevoInsumo = await inputService.create(insumoData)
      
      // Actualizar el estado local con el nuevo insumo
      setInsumos(prev => [...prev, nuevoInsumo])
      
      // Guardar el ID del insumo creado
      setLastCreatedInsumoId(nuevoInsumo.id)
      
      // Cerrar el modal
      setOpenNewInsumo(false)
      
      // Mostrar notificación de éxito
      setNotification({
        type: 'success',
        message: `Insumo "${nuevoInsumo.nombre}" creado exitosamente`
      })
      
    } catch (error) {
      console.error("Error al crear insumo:", error)
      
      // Mostrar notificación de error
      setNotification({
        type: 'error',
        message: error.message || 'Error al crear el insumo. Inténtalo de nuevo.'
      })
      
      throw error
    }
  }

  // Función para navegar al insumo creado
  function handleNotificationClick() {
    if (lastCreatedInsumoId && tableRef.current) {
      // Buscar la fila del insumo creado
      const insumoRow = tableRef.current.querySelector(`[data-insumo-id="${lastCreatedInsumoId}"]`)
      
      if (insumoRow) {
        // Hacer scroll suave a la fila
        insumoRow.scrollIntoView({ behavior: 'smooth', block: 'center' })
        
        // Agregar efecto de highlight temporal
        insumoRow.classList.add('bg-green-100', 'dark:bg-green-900')
        setTimeout(() => {
          insumoRow.classList.remove('bg-green-100', 'dark:bg-green-900')
        }, 2000)
      }
    }
    
    // Cerrar la notificación
    setNotification(null)
  }

  // Función para cerrar notificación
  function handleCloseNotification() {
    setNotification(null)
  }

  // Manejar loading
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Cargando insumos...</p>
      </div>
    )
  }

  // Filtros
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

      <NewInsumoModal
        open={openNewInsumo}
        onClose={() => setOpenNewInsumo(false)}
        onSubmit={handleCreateInsumo}
      />

      {/* Mostrar mensaje si no hay resultados */}
      {insumosFiltrados.length === 0 ? (
        <p className="text-center py-8 text-gray-500">
          {search || categoriaFilter !== "todas" 
            ? "No se encontraron insumos" 
            : "No hay insumos registrados"}
        </p>
      ) : (
        <div ref={tableRef}>
          <InsumosTable insumos={insumosFiltrados} />
        </div>
      )}
    </div>
  )
}
