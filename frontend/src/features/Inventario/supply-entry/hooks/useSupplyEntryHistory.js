import { useState, useCallback, useMemo, useEffect } from 'react'

import { ITEMS_PER_PAGE, FILTER_DEFAULTS } from '../constants/supplyEntry.constants'

/**
 * Custom hook for managing supply entry history logic
 * @param {Array} supplyEntries - List of supply entries
 */
export function useSupplyEntryHistory(supplyEntries = []) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  
  // Filters
  const [filters, setFilters] = useState(FILTER_DEFAULTS)

  // Load history data
  const loadHistory = useCallback(async () => {
    try {
      setLoading(true)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      // Data is already provided as prop
    } catch (err) {
      setError(err.message || 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }, [])

  // Update filters
  const updateFilter = useCallback((key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(FILTER_DEFAULTS)
  }, [])

  // Filter entries based on current filters
  const filteredEntries = useMemo(() => {
    return supplyEntries.filter(entry => {
      const { dateFrom, dateTo, selectedSupplier, searchTerm } = filters
      
      if (dateFrom && entry.date < dateFrom) return false
      if (dateTo && entry.date > dateTo) return false
      if (selectedSupplier && selectedSupplier !== 'all' && entry.supplier !== selectedSupplier) return false
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        return entry.receptionId.toLowerCase().includes(searchLower) ||
               entry.supplier.toLowerCase().includes(searchLower)
      }
      return true
    })
  }, [supplyEntries, filters])

  // Get unique suppliers for filter dropdown
  const uniqueSuppliers = useMemo(() => {
    return [...new Set(supplyEntries.map(entry => entry.supplier))].sort()
  }, [supplyEntries])

  // Pagination
  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedEntries = filteredEntries.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [filters])

  // Initialize
  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return {
    // State
    loading,
    error,
    currentPage,
    filters,
    
    // Computed values
    filteredEntries,
    paginatedEntries,
    totalPages,
    uniqueSuppliers,
    
    // Actions
    setCurrentPage,
    updateFilter,
    clearFilters,
    loadHistory,
  }
}