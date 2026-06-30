import { useState, useCallback, useMemo, useEffect } from 'react'
import { ITEMS_PER_PAGE } from '../constants/supplyEntry.constants'
import { supplierService } from '../services/supplierService'
import { supplyEntryService } from '../services/supplyEntryService'
import { useNotification } from '@/components/shared/notifications/useNotification'

async function resolveSupplierId(name) {
  const supplierName = name.trim()

  try {
    const supplier = await supplierService.getByName(supplierName)
    return supplier.id
  } catch (err) {
    if (err.response?.status !== 404) {
      throw err
    }

    const supplier = await supplierService.create({ name: supplierName })
    return supplier.id
  }
}

export function useSupplyEntryPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  const [openModal, setOpenModal] = useState(false)
  const [selectedEntryId, setSelectedEntryId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)

  const notify = useNotification()

  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [sortBy, setSortBy] = useState('entry_date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await supplyEntryService.getAll()
      setData(response.data || [])
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [])

  const suppliers = useMemo(() => {
    return [...new Set(data.map(entry => entry.supplier?.name).filter(Boolean))].sort()
  }, [data])

  const filteredData = useMemo(() => {
    let filtered = data.filter(entry => {
      if (search) {
        const searchLower = search.toLowerCase()
        const documentNumber = entry.document_number?.toLowerCase() || ''
        const supplierName = entry.supplier?.name?.toLowerCase() || ''

        if (!documentNumber.includes(searchLower) && !supplierName.includes(searchLower)) {
          return false
        }
      }

      if (dateFrom && new Date(entry.entry_date) < new Date(dateFrom)) {
        return false
      }

      if (dateTo && new Date(entry.entry_date) > new Date(`${dateTo}T23:59:59`)) {
        return false
      }

      if (supplierFilter !== 'all' && entry.supplier?.name !== supplierFilter) {
        return false
      }

      return true
    })

    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === 'entry_date' || sortBy === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (sortBy === 'total_cost') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      }

      return sortOrder === 'asc'
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1
    })

    const totalCount = filtered.length
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const items = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE)

    return {
      items,
      totalCount,
      totalPages,
      currentPage
    }
  }, [data, search, dateFrom, dateTo, supplierFilter, sortBy, sortOrder, currentPage])

  const handleCreateSupplyEntry = useCallback(async (formData) => {
    try {
      const supplierId = await resolveSupplierId(formData.supplier)

      const submissionData = {
        supplier_id: supplierId,
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
      await loadData()
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Error al registrar el abastecimiento')
    }
  }, [loadData, notify])

  const handleViewDetail = useCallback((entryId) => {
    setSelectedEntryId(entryId)
    setShowDetail(true)
  }, [])

  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
    setSelectedEntryId(null)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    filteredData,
    loading,
    error,
    search,
    dateFrom,
    dateTo,
    supplierFilter,
    sortBy,
    sortOrder,
    suppliers,
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    openModal,
    selectedEntryId,
    showDetail,
    setSearch,
    setDateFrom,
    setDateTo,
    setSupplierFilter,
    setSortBy,
    setSortOrder,
    setCurrentPage,
    setOpenModal,
    handleCreateSupplyEntry,
    handleViewDetail,
    handleCloseDetail,
    loadData,
  }
}
