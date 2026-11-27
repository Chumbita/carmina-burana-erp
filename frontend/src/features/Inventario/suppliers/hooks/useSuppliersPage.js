import { useCallback, useEffect, useState } from 'react'

import { useNotification } from '@/components/shared/notifications/useNotification'
import { cleanSupplier } from '../dto/supplier.dto'
import { supplierService } from '@/lib/api/supplierService'

const PAGE_SIZE = 20
const DEFAULT_STATUS = 'ACTIVE'

export function useSuppliersPage() {
  const notify = useNotification()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS)
  const [page, setPage] = useState(1)
  const [totalItems, setTotalItems] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [refreshKey, setRefreshKey] = useState(0)
  const [openForm, setOpenForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 350)
    return () => clearTimeout(t)
  }, [search])

  const fetchSuppliers = useCallback(async () => {
    try {
      setLoading(true)
      const res = await supplierService.getAll({
        page,
        pageSize: PAGE_SIZE,
        q: debouncedSearch || undefined,
        status: statusFilter,
      })
      setData(res.data || [])
      setTotalItems(res.pagination?.total_items ?? 0)
      setTotalPages(res.pagination?.total_pages ?? 0)
    } catch (error) {
      notify.error(error.response?.data?.detail || 'Error al cargar proveedores')
      setData([])
    } finally {
      setLoading(false)
    }
  }, [page, debouncedSearch, statusFilter, notify])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers, refreshKey])

  const changePage = useCallback((next) => setPage(next), [])

  const changeSearch = useCallback((value) => {
    setSearch(value)
    setPage(1)
  }, [])

  const changeStatus = useCallback((value) => {
    setStatusFilter(value)
    setPage(1)
  }, [])

  const clearFilters = useCallback(() => {
    setSearch('')
    setStatusFilter(DEFAULT_STATUS)
    setPage(1)
  }, [])

  const refresh = useCallback(() => {
    setPage(1)
    setRefreshKey((k) => k + 1)
  }, [])

  const hasActiveFilters = Boolean(search.trim() || statusFilter !== DEFAULT_STATUS)
  const hasRecords = hasActiveFilters ? true : totalItems > 0 || data.length > 0

  function startCreate() {
    setEditingSupplier(null)
    setOpenForm(true)
  }

  async function saveSupplier(formData) {
    try {
      setSaving(true)
      const payload = cleanSupplier(formData)
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, payload)
        notify.success('Proveedor actualizado correctamente')
      } else {
        await supplierService.create(payload)
        notify.success('Proveedor creado correctamente')
      }
      setOpenForm(false)
      refresh()
    } catch (error) {
      notify.error(error.response?.data?.detail || 'Error al guardar proveedor')
    } finally {
      setSaving(false)
    }
  }

  return {
    data,
    editingSupplier,
    hasActiveFilters,
    hasRecords,
    loading,
    openForm,
    page,
    pageSize: PAGE_SIZE,
    saving,
    search,
    statusFilter,
    totalItems,
    totalPages,
    changePage,
    changeSearch,
    changeStatus,
    clearFilters,
    refresh,
    saveSupplier,
    setOpenForm,
    startCreate,
  }
}
