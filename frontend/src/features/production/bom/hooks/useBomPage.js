import { useCallback, useEffect, useRef, useState } from "react"
import { bomService } from "../services/bomService"
import { useNotification } from "@/components/shared/notifications/useNotification"

const PAGE_SIZE = 20

export function useBomPage() {
  const notify = useNotification()

  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")

  const [openModal, setOpenModal] = useState(false)
  const tableRef = useRef(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchBoms = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await bomService.getAll({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedSearch || undefined,
        sortBy: "name",
        sortOrder: "asc",
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
  }, [page, debouncedSearch])

  useEffect(() => {
    fetchBoms()
  }, [fetchBoms, refreshKey])

  const refresh = useCallback(() => {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }, [])

  const changePage = useCallback((next) => setPage(next), [])

  async function handleCreateBom(data) {
    try {
      await bomService.create(data)
      refresh()
      notify.success("Fórmula creada exitosamente")
      setOpenModal(false)
    } catch (error) {
      const msg = error?.response?.data?.detail || error?.message || "Error al crear la fórmula"
      notify.error(msg)
      throw error
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
    setSearch,
    changePage,
    refresh,
    openModal,
    setOpenModal,
    handleCreateBom,
    tableRef,
  }
}
