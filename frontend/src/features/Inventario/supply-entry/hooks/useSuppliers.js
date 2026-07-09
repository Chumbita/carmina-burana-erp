import { useEffect, useState } from 'react'

import { supplierService } from '../services/supplierService'

export function useSuppliers() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function getSuppliers() {
    try {
      setLoading(true)
      setError(null)
      const data = await supplierService.getOptions()
      setSuppliers(data)
      return data
    } catch (err) {
      setError(err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  async function createSupplier(data) {
    try {
      const supplier = await supplierService.create(data)
      await getSuppliers()
      return supplier
    } catch (err) {
      setError(err)
      throw err
    }
  }

  useEffect(() => {
    getSuppliers().catch(() => {})
  }, [])

  return {
    suppliers,
    loading,
    error,
    getSuppliers,
    createSupplier,
  }
}
