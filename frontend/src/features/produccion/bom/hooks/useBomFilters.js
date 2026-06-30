import { useState, useCallback } from 'react'

const ITEMS_PER_PAGE = 20

export function useBomFilters() {
  const [search, setSearch] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const resetPage = useCallback(() => {
    setCurrentPage(1)
  }, [])

  const handleSearchChange = useCallback((value) => {
    setSearch(value)
    resetPage()
  }, [resetPage])

  const filteredBoms = useCallback((boms) => {
    let result = [...boms]

    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (bom) =>
          String(bom.id).includes(term) ||
          (bom.parent_item_name && bom.parent_item_name.toLowerCase().includes(term))
      )
    }

    const totalCount = result.length
    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)
    const safePage = Math.min(currentPage, Math.max(totalPages, 1))
    const start = (safePage - 1) * ITEMS_PER_PAGE
    const items = result.slice(start, start + ITEMS_PER_PAGE)

    return { items, totalCount, totalPages, currentPage: safePage }
  }, [search, currentPage])

  const clearFilters = useCallback(() => {
    setSearch('')
    setCurrentPage(1)
  }, [])

  const hasActiveFilters = search.trim() !== ''

  return {
    search,
    currentPage,
    hasActiveFilters,
    handleSearchChange,
    setCurrentPage,
    clearFilters,
    filteredBoms,
  }
}
