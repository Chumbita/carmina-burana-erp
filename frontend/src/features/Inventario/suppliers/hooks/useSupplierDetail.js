import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/shared/notifications/useNotification'
import { cleanSupplier } from './useSuppliersPage'
import { supplierService } from '../services/supplierService'

export function useSupplierDetail(supplierId) {
  const notify = useNotification()
  const navigate = useNavigate()
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [auditRefreshKey, setAuditRefreshKey] = useState(0)

  const loadSupplier = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setSupplier(await supplierService.getById(supplierId))
    } catch (err) {
      setError(err)
      notify.error(err.response?.data?.detail || 'Error al cargar proveedor')
    } finally {
      setLoading(false)
    }
  }, [notify, supplierId])

  useEffect(() => {
    loadSupplier()
  }, [loadSupplier])

  async function saveSupplier(data) {
    try {
      setSaving(true)
      const updated = await supplierService.update(supplierId, cleanSupplier(data))
      setSupplier(updated)
      setAuditRefreshKey((current) => current + 1)
      notify.success('Proveedor actualizado correctamente')
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Error al guardar proveedor')
    } finally {
      setSaving(false)
    }
  }

  async function deleteSupplier() {
    try {
      setSaving(true)
      await supplierService.delete(supplierId)
      notify.success('Proveedor eliminado correctamente')
      navigate('/inventario/proveedores')
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Error al eliminar proveedor')
    } finally {
      setSaving(false)
    }
  }

  return {
    auditRefreshKey,
    deleteSupplier,
    error,
    loading,
    saving,
    supplier,
    saveSupplier,
  }
}
