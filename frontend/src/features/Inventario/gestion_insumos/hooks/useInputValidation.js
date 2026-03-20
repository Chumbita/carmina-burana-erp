import { useCallback } from 'react'
import { useInputs } from './useInputs'

export function useInputValidation() {
  const { inputs } = useInputs()

  const validateUniqueName = useCallback((name, excludeId = null) => {
    if (!name || !name.trim()) return true // Dejar que zod maneje vacíos
    
    const normalizedName = name.trim().toLowerCase()
    
    // Verificar si ya existe un insumo con este nombre
    const existingInput = inputs.find(input => {
      if (excludeId && input.id === excludeId) return false // Excluir en edición
      return input.name.toLowerCase() === normalizedName
    })
    
    return !existingInput
  }, [inputs])

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
