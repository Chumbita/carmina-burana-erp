import { useState, useEffect } from "react"
import { supplyService } from "../services/supplyService"
import { packagingSupplyService } from "../services/packagingSupplyService"

function mapItemOptionToSupply(option) {
  return {
    id: option.item_id,
    name: option.name,
    brand_name: option.brand,
    base_uom_symbol: option.uom_symbol,
    // compat: los validadores solo usan id/name; el combobox de abastecimiento
    // pierde supply_category (muestra "marca · unidad")
    item_type: option.item_type,
  }
}

export function useSupplies() {
  const [supplies, setSupplies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  async function getSupplies() {
    try {
      setLoading(true)
      const data = await supplyService.getOptions()
      const filtered = data
        .filter((o) => o.item_type === "supply" || o.item_type === "packaging_supply")
        .map(mapItemOptionToSupply)
      setSupplies(filtered)
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
