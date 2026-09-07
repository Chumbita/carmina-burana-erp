import { useCallback, useEffect, useState } from "react"
import { productionService } from "../services/productionService"

const PAGE_SIZE = 20
const DATE_DEBOUNCE_MS = 300

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

export function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const day = String(d.getDate()).padStart(2, "0")
  return `${y}-${m}-${day}`
}

export function useProductionHistoryPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)

  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [dateField, setDateField] = useState("")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState(todayStr)
  const [sortBy, setSortBy] = useState("production_date")
  const [sortOrder, setSortOrder] = useState("desc")

  // Debounce para search
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const debouncedDateFrom = useDebounce(dateFrom, DATE_DEBOUNCE_MS)

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await productionService.getHistory({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedSearch || undefined,
        status: statusFilter !== "ALL" ? statusFilter : undefined,
        dateField: debouncedDateFrom ? dateField : undefined,
        dateFrom: debouncedDateFrom || undefined,
        dateTo: debouncedDateFrom ? (dateTo || undefined) : undefined,
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- dateTo se excluye a propósito: solo dateFrom dispara fetch
  }, [page, debouncedSearch, statusFilter, dateField, debouncedDateFrom, sortBy, sortOrder])

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory, refreshKey])

  const refresh = useCallback(() => {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }, [])

  const changePage = useCallback((next) => setPage(next), [])

  const handleDateFieldChange = useCallback((v) => {
    setDateField(v)
    setPage(1)
  }, [])

  async function discardProduction(orderId, discardData) {
    const updated = await productionService.discard(orderId, discardData)
    refresh()
    return updated
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
    statusFilter,
    dateField,
    dateFrom,
    dateTo,
    sortBy,
    sortOrder,
    setSearch,
    setStatusFilter,
    handleDateFieldChange,
    setDateFrom,
    setDateTo,
    setSortBy,
    setSortOrder,
    changePage,
    refresh,
    discardProduction,
  }
}
