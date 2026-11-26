import { useParams } from "react-router-dom"
import { useSupply } from "./useSupply"
import { useSupplies } from "./useSupplies"

/**
 * Datos de la vista de detalle de un insumo de producción.
 */
export function useSupplyDetailPage() {
  const { supplyId } = useParams()
  const { supply, loading, error, refetch } = useSupply(supplyId)
  const { supplies } = useSupplies()

  return {
    supplyId,
    supply,
    loading,
    error,
    refetch,
    availableSupplies: supplies,
  }
}
