import { useState, useEffect } from "react"
import { supplyService } from "../services/supplyService"

export function useSupplies() {
  const [supplies, setSupplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function getSupplies() {
    try {
      const data = await supplyService.getAll()
      setSupplies(data)
    } catch (err) {
      setError(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    getSupplies()
  }, [])

  async function createSupply(supplyData) {
    try {
      const newSupply = await supplyService.create(supplyData)
      await getSupplies()
      return newSupply
    } catch (err) {
      setError(err)
      throw err
    }
  }

  async function updateSupply(id, data) {
    try {
      const updated = await supplyService.patch(id, data)
      await getSupplies()
      return updated
    } catch (err) {
      setError(err)
      throw err
    }
  }

  async function deleteSupply(id) {
    try {
      await supplyService.delete(id)
      await getSupplies()
    } catch (err) {
      setError(err)
      throw err
    }
  }

  return {
    supplies,
    loading,
    error,
    getSupplies,
    createSupply,
    updateSupply,
    deleteSupply,
  }
}
