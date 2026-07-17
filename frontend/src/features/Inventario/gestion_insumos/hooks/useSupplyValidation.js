import { useCallback } from 'react'
import { useSupplies } from './useSupplies'

export function useSupplyValidation() {
  const { supplies } = useSupplies()

  const validateUniqueName = useCallback((name, excludeId = null) => {
    if (!name || !name.trim()) return true // Dejar que zod maneje vacíos
    
    const normalizedName = name.trim().toLowerCase()
    
    // Verificar si ya existe un insumo con este nombre
    const existingSupply = supplies.find(supply => {
      if (excludeId && supply.id === excludeId) return false // Excluir en edición
      return supply.name.toLowerCase() === normalizedName
    })
    
    return !existingSupply
  }, [supplies])

  const getNameError = useCallback((name, excludeId = null) => {
    if (!validateUniqueName(name, excludeId)) {
      return "Ya existe un insumo con este nombre"
    }
    return null
  }, [validateUniqueName])

  return {
    validateUniqueName,
    getNameError
  }
}
