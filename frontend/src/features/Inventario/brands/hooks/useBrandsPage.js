import { useEffect, useMemo, useState } from 'react'

import { useNotification } from '@/components/shared/notifications/useNotification'
import { brandService } from '../services/brandService'

export const emptyBrand = {
  name: '',
}

export function cleanBrand(data) {
  return {
    name: data.name.trim(),
  }
}

export function useBrandsPage() {
  const notify = useNotification()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [openForm, setOpenForm] = useState(false)

  async function loadBrands() {
    try {
      setLoading(true)
      setBrands(await brandService.getAll())
    } catch (error) {
      notify.error(error.response?.data?.detail || 'Error al cargar marcas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBrands()
  }, [])

  const filteredBrands = useMemo(() => {
    const term = search.trim().toLowerCase()
    return brands
      .filter((brand) => {
        const matchesSearch = !term || brand.name.toLowerCase().includes(term)
        return matchesSearch
      })
      .sort((a, b) => a.id - b.id)
  }, [brands, search])

  async function saveBrand(data) {
    try {
      setSaving(true)
      await brandService.create(cleanBrand(data))
      notify.success('Marca creada correctamente')
      setOpenForm(false)
      await loadBrands()
    } catch (error) {
      notify.error(error.response?.data?.detail || 'Error al guardar marca')
    } finally {
      setSaving(false)
    }
  }

  return {
    emptyBrand,
    filteredBrands,
    loading,
    openForm,
    saving,
    search,
    saveBrand,
    setOpenForm,
    setSearch,
    startCreate: () => setOpenForm(true),
  }
}
