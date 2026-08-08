import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useNotification } from '@/components/shared/notifications/useNotification'
import { cleanBrand } from './useBrandsPage'
import { brandService } from '../services/brandService'

export function useBrandDetail(brandId) {
  const navigate = useNavigate()
  const notify = useNotification()
  const [brand, setBrand] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [auditRefreshKey, setAuditRefreshKey] = useState(0)

  const loadBrand = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      setBrand(await brandService.getById(brandId))
    } catch (err) {
      setError(err)
      notify.error(err.response?.data?.detail || 'Error al cargar marca')
    } finally {
      setLoading(false)
    }
  }, [brandId, notify])

  useEffect(() => {
    loadBrand()
  }, [loadBrand])

  async function saveBrand(data) {
    try {
      setSaving(true)
      const updated = await brandService.update(brandId, cleanBrand(data))
      setBrand(updated)
      setAuditRefreshKey((current) => current + 1)
      notify.success('Marca actualizada correctamente')
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Error al guardar marca')
    } finally {
      setSaving(false)
    }
  }

  async function deleteBrand() {
    try {
      setSaving(true)
      await brandService.delete(brandId)
      notify.success('Marca eliminada correctamente')
      navigate('/inventario/marcas')
    } catch (err) {
      notify.error(err.response?.data?.detail || 'Error al eliminar marca')
    } finally {
      setSaving(false)
    }
  }

  return {
    auditRefreshKey,
    brand,
    deleteBrand,
    error,
    loading,
    saveBrand,
    saving,
  }
}
