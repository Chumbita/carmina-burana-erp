import { useState, useEffect } from "react"
import { auditLogService } from "../services/auditLogService"

const PAGE_SIZE = 10

export function useEntityAuditLogs(entityType, entityId) {
  const [auditLogs, setAuditLogs] = useState([])
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    if (!entityType || !entityId) return

    async function load() {
      setIsLoading(true)
      setError(null)
      try {
        const data = await auditLogService.getByEntity(entityType, entityId, page, PAGE_SIZE)
        setAuditLogs(data.data)
        setTotalItems(data.pagination.total_items)
        setTotalPages(data.pagination.total_pages)
      } catch (err) {
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [entityType, entityId, page, refreshKey])

  function refetch() {
    setPage(1)
    setRefreshKey((key) => key + 1)
  }

  return { auditLogs, isLoading, error, page, pageSize: PAGE_SIZE, totalItems, totalPages, changePage: setPage, refetch }
}
