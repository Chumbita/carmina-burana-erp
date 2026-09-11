import { useCallback, useEffect, useMemo, useState } from 'react'

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

const PAGE_SIZE = 20

export function useBrandsPage() {
  const notify = useNotification()
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [openForm, setOpenForm] = useState(false)
  const [page, setPage] = useState(1)

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

  const totalItems = filteredBrands.length
  const totalPages = Math.ceil(totalItems / PAGE_SIZE)

  const paginatedBrands = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredBrands.slice(start, start + PAGE_SIZE)
  }, [filteredBrands, page])

  const changePage = useCallback((next) => setPage(next), [])

  useEffect(() => {
    setPage(1)
  }, [search])

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
    filteredBrands: paginatedBrands,
    hasBrands: brands.length > 0,
    loading,
    openForm,
    saving,
    search,
    page,
    pageSize: PAGE_SIZE,
    totalItems,
    totalPages,
    changePage,
    saveBrand,
    setOpenForm,
    setSearch,
    startCreate: () => setOpenForm(true),
  }
}
