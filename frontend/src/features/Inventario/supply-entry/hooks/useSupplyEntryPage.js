import { useState, useCallback, useMemo } from 'react'
import { ITEMS_PER_PAGE, FILTER_DEFAULTS } from '../constants/supplyEntry.constants'

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
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (err) {
      setError(err.message || 'Error al cargar los datos')
    } finally {
      setLoading(false)
    }
  }, [])

  // Get unique suppliers for filter
  const suppliers = useMemo(() => {
    return [...new Set(mockSupplyEntries.map(entry => entry.supplier))].sort()
  }, [])

  // Filter and sort entries
  const filteredData = useMemo(() => {
    let filtered = mockSupplyEntries.filter(entry => {
      // Search filter
      if (search) {
        const searchLower = search.toLowerCase()
        if (!entry.receptionId.toLowerCase().includes(searchLower) && 
            !entry.supplier.toLowerCase().includes(searchLower)) {
          return false
        }
      }
      
      // Date filters
      if (dateFrom && entry.date < dateFrom) return false
      if (dateTo && entry.date > dateTo) return false
      
      // Supplier filter
      if (supplierFilter !== 'all' && entry.supplier !== supplierFilter) return false
      
      return true
    })

    // Sort
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]
      
      if (sortBy === 'date') {
        aValue = new Date(aValue).getTime()
        bValue = new Date(bValue).getTime()
      } else if (sortBy === 'totalCost') {
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
  }, [search, dateFrom, dateTo, supplierFilter, sortBy, sortOrder, currentPage])

  // Handle create supply entry
  const handleCreateSupplyEntry = useCallback(async (data) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setNotification({
        type: 'success',
        message: `Abastecimiento ${data.receptionId} registrado correctamente`
      })
      
      setOpenModal(false)
      loadData() // Reload data
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Error al registrar el abastecimiento'
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

  // Initialize
  useState(() => {
    loadData()
  })

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
