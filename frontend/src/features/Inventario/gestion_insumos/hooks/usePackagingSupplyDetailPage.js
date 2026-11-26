import { useParams } from "react-router-dom"
import { usePackagingSupply } from "./usePackagingSupply"
import { useSupplies } from "./useSupplies"

/**
 * Datos de la vista de detalle de un envase.
 */
export function usePackagingSupplyDetailPage() {
  const { supplyId } = useParams()
  const { packagingSupply, loading, error, updatePackagingSupply, deleteSupply, refetch } =
    usePackagingSupply(supplyId)
  const { supplies } = useSupplies()

  return {
    supplyId,
    packagingSupply,
    loading,
    error,
    updatePackagingSupply,
    deleteSupply,
    refetch,
    availableSupplies: supplies,
  }
}
