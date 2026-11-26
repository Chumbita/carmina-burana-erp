import { useState } from "react"

import { BrandForm } from "@/features/Inventario/brands"
import { brandService } from "@/lib/api/brandService"
import { useNotification } from "@/components/shared/notifications/useNotification"

/**
 * Diálogo de alta rápida de marca usado por los formularios de insumos.
 * Al crear, notifica y delega el nuevo registro al consumidor.
 */
export function BrandQuickCreateDialog({ open, onOpenChange, onCreated }) {
  const [saving, setSaving] = useState(false)
  const notify = useNotification()

  async function handleSubmit(data) {
    try {
      setSaving(true)
      const newBrand = await brandService.create({ name: data.name.trim() })
      onCreated(newBrand)
      notify.success("Marca creada correctamente")
      onOpenChange(false)
    } catch (error) {
      notify.error(error.response?.data?.detail || "Error al crear marca")
    } finally {
      setSaving(false)
    }
  }

  return (
    <BrandForm
      open={open}
      onOpenChange={onOpenChange}
      brand={{ name: "" }}
      emptyBrand={{ name: "" }}
      saving={saving}
      submitLabel="Crear marca"
      onSubmit={handleSubmit}
    />
  )
}
