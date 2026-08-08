import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
import { Field, FieldError, FieldLabel } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/TextArea'

export function SupplierForm({
  open,
  onOpenChange,
  supplier,
  emptySupplier,
  saving,
  onSubmit,
  layout = 'modal',
  submitLabel = 'Guardar',
  showDeleteButton = false,
  onDelete,
}) {
  const [form, setForm] = useState(emptySupplier)
  const [error, setError] = useState('')
  const isModal = layout === 'modal'

  useEffect(() => {
    setForm(supplier || emptySupplier)
    setError('')
  }, [emptySupplier, supplier, open])

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }))
  }

  function submit(event) {
    event.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre es obligatorio')
      return
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setError('El email no es válido')
      return
    }
    if (form.phone.trim() && !/^\d+$/.test(form.phone.trim())) {
      setError('El teléfono solo puede contener números')
      return
    }
    onSubmit(form)
  }

  const formContent = (
    <form className={isModal ? 'space-y-4' : 'grid grid-cols-1 gap-4 md:grid-cols-4'} onSubmit={submit}>
      <Field className="md:col-span-2">
        <FieldLabel htmlFor="supplierName">
          Nombre <span className="text-red-500 -ml-1">*</span>
        </FieldLabel>
        <Input
          id="supplierName"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          value={form.name}
          onChange={(event) => updateField('name', event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="supplierEmail">Email</FieldLabel>
        <Input
          id="supplierEmail"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          type="email"
          value={form.email || ''}
          onChange={(event) => updateField('email', event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="supplierPhone">Teléfono</FieldLabel>
        <Input
          id="supplierPhone"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          inputMode="numeric"
          value={form.phone || ''}
          onChange={(event) => updateField('phone', event.target.value)}
        />
      </Field>

      <Field className="md:col-span-4">
        <FieldLabel htmlFor="supplierAddress">Dirección</FieldLabel>
        <Textarea
          id="supplierAddress"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          value={form.address || ''}
          onChange={(event) => updateField('address', event.target.value)}
        />
      </Field>

      {error && (
        <div className="md:col-span-4">
          <FieldError errors={[{ message: error }]} />
        </div>
      )}

      <div className={isModal ? undefined : 'md:col-span-4 flex justify-end'}>
        {isModal ? (
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : submitLabel}
            </Button>
          </DialogFooter>
        ) : (
          <div className="flex gap-2">
            {showDeleteButton && (
              <Button
                type="button"
                className="bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                onClick={onDelete}
                disabled={saving}
              >
                Eliminar proveedor
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving ? 'Guardando...' : submitLabel}
            </Button>
          </div>
        )}
      </div>
    </form>
  )

  if (!isModal) {
    return formContent
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? 'Editar proveedor' : 'Nuevo proveedor'}</DialogTitle>
          <DialogDescription>
            {supplier ? 'Actualizá los datos del proveedor.' : 'Cargá los datos básicos del proveedor.'}
          </DialogDescription>
        </DialogHeader>

        {formContent}
      </DialogContent>
    </Dialog>
  )
}
