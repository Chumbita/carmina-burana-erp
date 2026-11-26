import { Save } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
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
import { useSupplierForm } from '../hooks/useSupplierForm'

function SubmitLabel({ saving, submitLabel }) {
  if (saving) {
    return (
      <>
        <Spinner data-icon="inline-start" />
        Guardando…
      </>
    )
  }

  return (
    <>
      <Save data-icon="inline-start" />
      {submitLabel}
    </>
  )
}

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
  const isModal = layout === 'modal'
  const { error, form, setField, submit } = useSupplierForm({
    supplier,
    emptySupplier,
    open,
    onSubmit,
  })

  const formContent = (
    <form
      className={isModal ? 'space-y-4' : 'grid grid-cols-1 gap-4 md:grid-cols-4'}
      onSubmit={submit}
    >
      <Field className="md:col-span-2">
        <FieldLabel htmlFor="supplierName">
          Nombre <span className="text-red-500 -ml-1">*</span>
        </FieldLabel>
        <Input
          id="supplierName"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          value={form.name}
          onChange={(event) => setField('name', event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="supplierEmail">Email</FieldLabel>
        <Input
          id="supplierEmail"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          type="email"
          value={form.email || ''}
          onChange={(event) => setField('email', event.target.value)}
        />
      </Field>

      <Field>
        <FieldLabel htmlFor="supplierPhone">Teléfono</FieldLabel>
        <Input
          id="supplierPhone"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          inputMode="numeric"
          value={form.phone || ''}
          onChange={(event) => setField('phone', event.target.value)}
        />
      </Field>

      <Field className="md:col-span-4">
        <FieldLabel htmlFor="supplierAddress">Dirección</FieldLabel>
        <Textarea
          id="supplierAddress"
          className={isModal ? undefined : 'bg-neutral-100 border-none'}
          value={form.address || ''}
          onChange={(event) => setField('address', event.target.value)}
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
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="cursor-pointer" disabled={saving}>
              <SubmitLabel saving={saving} submitLabel={submitLabel} />
            </Button>
          </DialogFooter>
        ) : (
          <div className="flex gap-2 justify-end">
            {showDeleteButton && (
              <Button
                type="button"
                size="sm"
                className="bg-red-100 text-red-600 hover:bg-red-200 cursor-pointer"
                onClick={onDelete}
                disabled={saving}
              >
                Eliminar proveedor
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" className="cursor-pointer" disabled={saving}>
              <SubmitLabel saving={saving} submitLabel={submitLabel} />
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
