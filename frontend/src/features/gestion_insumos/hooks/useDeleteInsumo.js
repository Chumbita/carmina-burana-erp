import { useState } from "react"
// import { inputService } from "@/services/inputService"

export function useDeleteInsumo(onSuccess, onError) {
  const [isDeleting, setIsDeleting] = useState(false)

  const deleteInsumo = async (id) => {
    setIsDeleting(true)
    try {
      // await inputService.delete(id)
      
      onSuccess?.()
      return true
    } catch (error) {
      onError?.(error)
      return false
    } finally {
      setIsDeleting(false)
    }
  }

  return {
    deleteInsumo,
    isDeleting
  }
}