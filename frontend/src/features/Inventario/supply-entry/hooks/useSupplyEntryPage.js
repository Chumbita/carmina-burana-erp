import { useState, useCallback, useEffect } from 'react'
import { ITEMS_PER_PAGE } from '../constants/supplyEntry.constants'
import { supplyEntryService } from '../services/supplyEntryService'
import { buildSupplyEntryPayload } from '../dto/supplyEntry.dto'
import { useNotification } from '@/components/shared/notifications/useNotification'

export function useSupplyEntryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  const notify = useNotification()

  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [hasEntries, setHasEntries] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(timer)
  }, [search])

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await supplyEntryService.getAll({
        page,
        pageSize: ITEMS_PER_PAGE,
        supplierId: supplierFilter !== 'all' ? Number(supplierFilter) : undefined,
        dateFrom,
        dateTo,
        q: debouncedSearch,
      })
      setData(response.data || [])
      const total = response.pagination?.total_items ?? 0
      setTotalItems(total)
      setTotalPages(response.pagination?.total_pages ?? 0)
      if (!debouncedSearch && !dateFrom && !dateTo && supplierFilter === 'all') {
        setHasEntries(total > 0)
      } else if (total > 0) {
        setHasEntries(true)
      }
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, dateFrom, dateTo, supplierFilter])

  useEffect(() => {
    fetchEntries()
  }, [fetchEntries, refreshKey])

  const refresh = useCallback(() => {
    setPage(1)
    setRefreshKey(key => key + 1)
  }, [])

  const changePage = useCallback(newPage => {
    setPage(newPage)
  }, [])

  const handleCreateSupplyEntry = useCallback(async (formData) => {
    try {
      const createdEntry = await supplyEntryService.create(buildSupplyEntryPayload(formData))

      notify.success(`Abastecimiento ${createdEntry.document_number} registrado correctamente`)
      setOpenModal(false)
      refresh()
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Error al registrar el abastecimiento')
    }
  }, [notify, refresh])

  const handleViewDetail = useCallback((entryId) => {
    setSelectedEntryId(entryId)
    setShowDetail(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
    setSelectedEntryId(null)
  }, [])

  return {
    data,
    loading,
    error,
    search,
    dateFrom,
    dateTo,
    supplierFilter,
    page,
    totalItems,
    totalPages,
    hasEntries,
    openModal,
    selectedEntryId,
    showDetail,
    setSearch,
    setDateFrom,
    setDateTo,
    setSupplierFilter,
    setOpenModal,
    changePage,
    refresh,
    handleCreateSupplyEntry,
    handleViewDetail,
    handleCloseDetail,
  }
}
