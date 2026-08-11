import { useState, useCallback, useEffect } from 'react'
import { ITEMS_PER_PAGE } from '../constants/supplyEntry.constants'
import { supplyEntryService } from '../services/supplyEntryService'
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
      setTotalItems(response.pagination?.total_items ?? 0)
      setTotalPages(response.pagination?.total_pages ?? 0)
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
      const submissionData = {
        supplier_id: formData.supplierId,
        document_number: formData.invoiceNumber || undefined,
        entry_date: new Date(formData.entryDate).toISOString(),
        description: formData.description || undefined,
        lines: formData.items.map(item => ({
          item_id: item.supplyId,
          quantity: item.quantity,
          unit_cost: item.unitCost,
          expiration_date: new Date(item.expirationDate).toISOString(),
          lot_code: item.batchNumber || undefined,
          comment: item.comment || undefined,
        }))
      }

      const createdEntry = await supplyEntryService.create(submissionData)

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
