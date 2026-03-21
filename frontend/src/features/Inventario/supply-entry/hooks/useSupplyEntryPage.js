import { useState, useCallback, useMemo, useEffect } from 'react'
import { ITEMS_PER_PAGE, FILTER_DEFAULTS } from '../constants/supplyEntry.constants'
import { inputEntryService } from '../services/inputEntryService'

// Mock data - replace with actual API calls
const mockSupplyEntries = [
  {
    id: '1',
    receptionId: 'REC-20250319-001',
    date: '2025-03-19',
    supplier: 'Maltería Nacional',
    totalQuantity: 5,
    totalCost: 2500.00,
    status: 'active',
    itemCount: 3
  },
  {
    id: '2', 
    receptionId: 'REC-20250318-002',
    date: '2025-03-18',
    supplier: 'Hop Supply Co.',
    totalQuantity: 2,
    totalCost: 850.50,
    status: 'active',
    itemCount: 2
  },
  {
    id: '3',
    receptionId: 'REC-20250317-003',
    date: '2025-03-17',
    supplier: 'Yeast Labs',
    totalQuantity: 1,
    totalCost: 450.00,
    status: 'annulled',
    itemCount: 1
  }
]

export function useSupplyEntryPage() {
  // Loading and error states
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [data, setData] = useState([])
  
  // Modal state
  const [openModal, setOpenModal] = useState(false)
  
  // Detail view state
  const [selectedEntryId, setSelectedEntryId] = useState(null)
  const [showDetail, setShowDetail] = useState(false)
  
  // Notification state
  const [notification, setNotification] = useState(null)
  
  // Filters state
  const [search, setSearch] = useState('')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [sortOrder, setSortOrder] = useState('desc')
  const [currentPage, setCurrentPage] = useState(1)

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      const filters = {
        entry_date_from: dateFrom || undefined,
        entry_date_to: dateTo || undefined,
        supplier: supplierFilter !== 'all' ? supplierFilter : undefined,
        page: currentPage,
        limit: ITEMS_PER_PAGE
      }
      
      const response = await inputEntryService.getAll(filters)
      // El backend devuelve {items: [], total_count: ..., current_page: ..., total_pages: ...}
      setData(response.items || [])
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
      setData([])
    } finally {
      setLoading(false)
    }
  }, []) // Eliminamos dependencias para evitar bucles infinitos

  // Get unique suppliers for filter
  const suppliers = useMemo(() => {
    return [...new Set(data.map(entry => entry.supplier))].sort()
  }, [data])

  // Filter and sort entries
  const filteredData = useMemo(() => {
    let filtered = data.filter(entry => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        if (!entry.reception_number?.toLowerCase().includes(searchLower) && 
            !entry.supplier.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'entry_date' || sortBy === 'created_at') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (sortBy === 'total_cost') {
        aValue = parseFloat(aValue)
        bValue = parseFloat(bValue)
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    // Pagination
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
  }, [data, search, sortBy, sortOrder, currentPage])

  // Handle create supply entry
  const handleCreateSupplyEntry = useCallback(async (formData) => {
    try {
      const submissionData = {
        entry_date: new Date(formData.entryDate).toISOString().split('T')[0],
        supplier: formData.supplier,
        total_cost: formData.totalCost,
        description: formData.description || undefined,
        reception_number: formData.receptionId,
        items: formData.items.map(item => ({
          id_input: item.inputId,
          amount: item.quantity,
          unit_cost: item.unitCost,
          expire_date: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : undefined,
          comment: item.comment || undefined,
        }))
      }
      
      await inputEntryService.create(submissionData)
      
      setNotification({
        type: 'success',
        message: `Abastecimiento ${formData.receptionId} registrado correctamente`
      })
      
      setOpenModal(false)
      loadData() // Reload data
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.detail || 'Error al registrar el abastecimiento'
      })
    }
  }, [loadData])

  // Handle view detail
  const handleViewDetail = useCallback((entryId) => {
    setSelectedEntryId(entryId)
    setShowDetail(true)
  }, [])

  // Handle close detail
  const handleCloseDetail = useCallback(() => {
    setShowDetail(false)
    setSelectedEntryId(null)
  }, [])

  // Clear notification
  const clearNotification = useCallback(() => {
    setNotification(null)
  }, [])

  // Load data on mount and when filters change
  useEffect(() => {
    loadData()
  }, [])

  // Reload when filters change
  useEffect(() => {
    loadData()
  }, [dateFrom, dateTo, supplierFilter, currentPage])

  return {
    // Data
    filteredData,
    loading,
    error,
    
    // Filters
    search,
    dateFrom,
    dateTo,
    supplierFilter,
    sortBy,
    sortOrder,
    suppliers,
    
    // Pagination
    currentPage,
    itemsPerPage: ITEMS_PER_PAGE,
    
    // Modal
    openModal,
    
    // Detail view
    selectedEntryId,
    showDetail,
    
    // Notification
    notification,
    
    // Actions
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
    clearNotification,
    loadData,
  }
}
