import { useState } from "react"
import { useNotification } from "@/components/shared/notifications/useNotification"
import { supplyService } from "../services/supplyService"

export function useAdjustLot({ onSuccess } = {}) {
  const notify = useNotification()
  const [saving, setSaving] = useState(false)

  async function adjustLot(itemId, lotId, { new_quantity, reason }) {
    try {
      setSaving(true)
      const result = await supplyService.adjustLot(itemId, lotId, {
        new_quantity,
        reason,
      })
      notify.success("Stock ajustado correctamente")
      if (onSuccess) onSuccess(result)
      return result
    } catch (error) {
      notify.error(error.response?.data?.detail || "Error al ajustar stock")
      throw error
    } finally {
      setSaving(false)
    }
  }

  return { adjustLot, saving }
}
