import { useState } from 'react'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Field, FieldLabel } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'

const EMPTY_FORM = {
  name: '',
  email: '',
  phone: '',
  address: '',
}

/**
 * Alta rápida de proveedor desde el formulario de ingreso de insumos.
 * Presentación + estado local del formulario; la persistencia la resuelve
 * el callback `onCreate` del contenedor.
 */
export function CreateSupplierDialog({ open, onOpenChange, onCreate }) {
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  function updateField(field, value) {
    setFormData((current) => ({ ...current, [field]: value }))
  }

  async function handleCreate() {
    const name = formData.name.trim()
    if (!name) {
      setError('El nombre del proveedor es requerido')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const supplier = await onCreate({
        name,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        address: formData.address.trim() || undefined,
      })
      setFormData(EMPTY_FORM)
      onOpenChange(false)
      return supplier
    } catch (err) {
      setError(err.response?.data?.detail || 'No se pudo crear el proveedor')
      return null
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nuevo proveedor</DialogTitle>
        </DialogHeader>

        <div className="grid gap-3">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <Field>
            <FieldLabel htmlFor="newSupplierName" className="text-xs">
              Nombre <span className="text-destructive">*</span>
            </FieldLabel>
            <Input
              id="newSupplierName"
              value={formData.name}
              onChange={(event) => updateField('name', event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="newSupplierEmail" className="text-xs">
              Email
            </FieldLabel>
            <Input
              id="newSupplierEmail"
              value={formData.email}
              onChange={(event) => updateField('email', event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="newSupplierPhone" className="text-xs">
              Teléfono
            </FieldLabel>
            <Input
              id="newSupplierPhone"
              value={formData.phone}
              onChange={(event) => updateField('phone', event.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="newSupplierAddress" className="text-xs">
              Dirección
            </FieldLabel>
            <Input
              id="newSupplierAddress"
              value={formData.address}
              onChange={(event) => updateField('address', event.target.value)}
            />
          </Field>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button type="button" onClick={handleCreate} disabled={loading}>
            {loading ? 'Creando...' : 'Crear proveedor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
