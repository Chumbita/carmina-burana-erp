import { useState, useEffect } from "react"
import { transactionService } from "@/services/transactionService"

const PAGE_SIZE = 10

export function useTransactions(itemId) {
  const [transactions, setTransactions] = useState([])
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!itemId) return

    async function load() {
      setLoading(true)
      setError(null)
      try {
        const data = await transactionService.getByItemId(itemId, page, PAGE_SIZE)
        setTransactions(data.data)
        setTotalItems(data.pagination.total_items)
        setTotalPages(data.pagination.total_pages)
      } catch (err) {
        console.error("Error al cargar transacciones:", err.response?.data || err.message)
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [itemId, page, refreshKey])

  function refetch() {
    setPage(1)
    setRefreshKey((key) => key + 1)
  }

  return { transactions, loading, error, page, pageSize: PAGE_SIZE, totalItems, totalPages, changePage: setPage, refetch }
}
