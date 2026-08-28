import { useState, useEffect, useCallback } from "react"
import { supplyService } from "../services/supplyService"

const PAGE_SIZE = 5

export function useLots(itemId, statusFilter) {
  const [lots, setLots] = useState([])
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const refresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  useEffect(() => {
    if (!itemId) return

    async function load() {
      setLoading(true)
      try {
        const data = await supplyService.getLots(itemId, statusFilter, page)
        setLots(data.data)
        setTotalItems(data.pagination.total_items)
        setTotalPages(data.pagination.total_pages)
        setError(null)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [itemId, statusFilter, page, refreshKey])

  return { lots, loading, error, page, pageSize: PAGE_SIZE, totalItems, totalPages, changePage: setPage, refresh }
}
