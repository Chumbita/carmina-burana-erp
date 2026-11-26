import { useState, useEffect } from "react"
import { supplyService } from "../services/supplyService"
import { packagingSupplyService } from "../services/packagingSupplyService"
import { mapItemOptionsToSupplies } from "../dto/supply.dto"

export function useSupplies() {
  const [supplies, setSupplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function getSupplies() {
    try {
      setLoading(true)
      const options = await supplyService.getOptions()
      setSupplies(mapItemOptionsToSupplies(options))
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

  async function createPackagingSupply(packagingSupplyData) {
    try {
      const newPackagingSupply = await packagingSupplyService.create(packagingSupplyData)
      await getSupplies()
      return newPackagingSupply
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
      const result = await supplyService.delete(id)
      await getSupplies()
      return result
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
    createPackagingSupply,
    updateSupply,
    deleteSupply,
  }
}
