import { useCallback, useEffect, useRef, useState } from "react"
import { supplyService } from "../services/supplyService"
import { packagingSupplyService } from "../services/packagingSupplyService"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { useLocationNotification } from "./useLocationNotification"
import { SUPPLY_CATEGORIES, PACKAGING_TYPES } from "../schemas/supply.schema"

const PAGE_SIZE = 25

export function useSuppliesPage() {
  const notify = useNotification()
  useLocationNotification(notify)

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [itemTypeFilter, setItemTypeFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [sortOrder, setSortOrder] = useState("asc")

  const [openModal, setOpenModal] = useState(false)
  const tableRef = useRef(null)

  // debounce búsqueda
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchSupplies = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await supplyService.getAll({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedSearch || undefined,
        category: categoryFilter !== "all" ? categoryFilter : undefined,
        itemType: itemTypeFilter !== "all" ? itemTypeFilter : undefined,
        stockStatus: stockFilter !== "all" ? stockFilter : undefined,
        sortBy,
        sortOrder,
      })
      setData(res.data || [])
      setTotalItems(res.pagination?.total_items ?? 0)
      setTotalPages(res.pagination?.total_pages ?? 0)
    } catch (err) {
      setError(err)
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, categoryFilter, itemTypeFilter, stockFilter, sortBy, sortOrder])

  // fetch principal + refreshKey para forzar recarga post-create
  useEffect(() => {
    fetchSupplies()
  }, [fetchSupplies, refreshKey])

  const refresh = useCallback(() => {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }, [])

  const changePage = useCallback((next) => setPage(next), [])

  // opciones de filtros (ya no derivadas de la data)
  const categories = [
    { value: "all", label: "Categorías..." },
    ...[...SUPPLY_CATEGORIES, ...PACKAGING_TYPES].map((c) => ({ value: c, label: c })),
  ]
  const itemTypes = [
    { value: "all", label: "Tipo..." },
    { value: "SUPPLY", label: "Producción" },
    { value: "PACKAGING_SUPPLY", label: "Envase" },
  ]
  const stockStatuses = [
    { value: "all", label: "Estado de stock..." },
    { value: "critico", label: "Crítico" },
    { value: "bajo", label: "Bajo" },
    { value: "optimo", label: "Normal" },
  ]

  // create helpers con refetch server-side
  async function createSupply(payload) {
    const res = await supplyService.create(payload)
    refresh()
    return res
  }
  async function createPackagingSupply(payload) {
    const res = await packagingSupplyService.create(payload)
    refresh()
    return res
  }

  async function handleCreateSupply(formData) {
    try {
      if (formData.item_type === "PACKAGING_SUPPLY") {
        const payload = {
          name: formData.name,
          brand_id: formData.brand_id,
          base_uom_id: formData.base_uom_id,
          min_stock_level: formData.min_stock_level ?? 0,
          packaging_type: formData.packaging_type,
          material: formData.material,
          capacity_ml: formData.capacity_ml || null,
        }
        const created = await createPackagingSupply(payload)
        setOpenModal(false)
        notify.success(`Envase "${created.name}" creado exitosamente`, {
          onClick: () => handleNotificationClick(created.id),
        })
        return
      }
      const payload = {
        name: formData.name,
        brand_id: formData.brand_id,
        base_uom_id: formData.base_uom_id,
        min_stock_level: formData.min_stock_level ?? 0,
        supply_category: formData.supply_category,
      }
      const created = await createSupply(payload)
      setOpenModal(false)
      notify.success(`Insumo "${created.name}" creado exitosamente`, {
        onClick: () => handleNotificationClick(created.id),
      })
    } catch (err) {
      notify.error(`Error al crear el insumo: ${err.message || "Error desconocido"}`)
    }
  }

  function handleNotificationClick(id) {
    if (id && tableRef.current) {
      const row = tableRef.current.querySelector(`[data-insumo-id="${id}"]`)
      if (row) {
        row.scrollIntoView({ behavior: "smooth", block: "center" })
        row.classList.add("bg-green-100", "dark:bg-green-900")
        setTimeout(() => row.classList.remove("bg-green-100", "dark:bg-green-900"), 2000)
      }
    }
  }

  return {
    data,
    loading,
    error,
    page,
    totalItems,
    totalPages,
    pageSize: PAGE_SIZE,
    search,
    categoryFilter,
    itemTypeFilter,
    stockFilter,
    sortBy,
    sortOrder,
    categories,
    itemTypes,
    stockStatuses,
    setSearch,
    setCategoryFilter,
    setItemTypeFilter,
    setStockFilter,
    setSortBy,
    setSortOrder,
    changePage,
    refresh,
    openModal,
    setOpenModal,
    handleCreateSupply,
    tableRef,
  }
}
