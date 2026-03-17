import { useState, useEffect, useCallback } from "react"
import { auditLogService } from "../services/auditLogService"

export function useEntityAuditLogs(entityType, entityId) {
  const [auditLogs, setAuditLogs] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchAuditLogs = useCallback(async () => {
    if (!entityType || !entityId) return

    setIsLoading(true)
    setError(null)

    try {
      const data = await auditLogService.getByEntity(entityType, entityId)
      setAuditLogs(data)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }, [entityType, entityId])

  useEffect(() => {
    fetchAuditLogs()
  }, [fetchAuditLogs])

  return { auditLogs, isLoading, error, refetch: fetchAuditLogs }
}
