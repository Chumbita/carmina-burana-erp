import { useNotification } from "@/components/shared/notifications/useNotification"
import { supplyService } from "../services/supplyService"
import { packagingSupplyService } from "../services/packagingSupplyService"
import { buildPackagingSupplyPayload, buildSupplyPayload } from "../dto/supply.dto"

/**
 * Alta de insumos/envases desde la grilla.
 * Traduce el formulario a payload y delega el refresco al consumidor.
 */
export function useCreateSupply({ onCreated, onHighlight } = {}) {
  const notify = useNotification()

  async function createItem(formData) {
    const isPackaging = formData.item_type === "PACKAGING_SUPPLY"

    try {
      const created = isPackaging
        ? await packagingSupplyService.create(buildPackagingSupplyPayload(formData))
        : await supplyService.create(buildSupplyPayload(formData))

      if (onCreated) onCreated(created)

      notify.success(
        `${isPackaging ? "Envase" : "Insumo"} "${created.name}" creado exitosamente`,
        { onClick: () => onHighlight?.(created.id) }
      )
    } catch (error) {
      notify.error(`Error al crear el insumo: ${error.message || "Error desconocido"}`)
    }
  }

  return { createItem }
}
