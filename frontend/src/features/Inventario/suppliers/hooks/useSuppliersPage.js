import { useEffect, useMemo, useState } from 'react'

import { useNotification } from '@/components/shared/notifications/useNotification'
import { supplierService } from '../services/supplierService'

export const emptySupplier = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

export function cleanSupplier(data) {
  return {
    name: data.name.trim(),
    email: data.email.trim() || null,
    phone: data.phone.trim() || null,
    address: data.address.trim() || null,
  }
}

export function useSuppliersPage() {
  const notify = useNotification()
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ACTIVE')
  const [openForm, setOpenForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState(null)

  async function loadSuppliers() {
    try {
      setLoading(true)
      setSuppliers(await supplierService.getAll())
    } catch (error) {
      notify.error(error.response?.data?.detail || 'Error al cargar proveedores')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSuppliers()
  }, [])

  const filteredSuppliers = useMemo(() => {
    const term = search.trim().toLowerCase()
    return suppliers
      .filter((supplier) => {
        const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter
        const matchesSearch = !term || [supplier.name, supplier.email, supplier.phone]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(term))
        return matchesStatus && matchesSearch
      })
      .sort((a, b) => a.id - b.id)
  }, [search, statusFilter, suppliers])

  function startCreate() {
    setEditingSupplier(null)
    setOpenForm(true)
  }

  async function saveSupplier(data) {
    try {
      setSaving(true)
      const payload = cleanSupplier(data)
      if (editingSupplier) {
        await supplierService.update(editingSupplier.id, payload)
        notify.success('Proveedor actualizado correctamente')
      } else {
        await supplierService.create(payload)
        notify.success('Proveedor creado correctamente')
      }
      setOpenForm(false)
      await loadSuppliers()
    } catch (error) {
      notify.error(error.response?.data?.detail || 'Error al guardar proveedor')
    } finally {
      setSaving(false)
    }
  }

  return {
    emptySupplier,
    editingSupplier,
    filteredSuppliers,
    loading,
    openForm,
    saving,
    search,
    statusFilter,
    saveSupplier,
    setOpenForm,
    setSearch,
    setStatusFilter,
    startCreate,
  }
}
