import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Field, FieldLabel } from '@/components/ui/Field'
import { formatSupplyEntryDateTime } from '../constants/supplyEntry.constants'
import { SupplierCombobox } from './SupplierCombobox'

/**
 * Cabecera del formulario de ingreso: proveedor, fecha de recepción,
 * comprobante y observaciones. Presentación pura.
 */
export function SupplyEntryHeaderFields({
  errors,
  register,
  setValue,
  watchedSupplierId,
  watchedEntryDate,
  supplierOptions,
  suppliersLoading,
  onCreateSupplierClick,
}) {
  return (
    <Card className='py-0'>
      <div className="p-6 flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Información de la recepción
          </p>
          <p className='text-xs text-muted-foreground mt-0.5'>
            Ingrese la información general del proveedor y del comprobante comercial para registrar la recepción del pedido en el sistema
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field data-invalid={errors.supplierId ? true : false}>
            <FieldLabel className="text-xs">
              Proveedor <span className="text-destructive">*</span>
            </FieldLabel>
            <SupplierCombobox
              value={watchedSupplierId}
              onChange={(id) => setValue('supplierId', id, { shouldDirty: true, shouldValidate: true })}
              suppliers={supplierOptions}
              loading={suppliersLoading}
              onCreateClick={onCreateSupplierClick}
              invalid={errors.supplierId ? true : false}
            />
          </Field>

          <Field data-invalid={errors.entryDate ? true : false}>
            <FieldLabel htmlFor="entryDate" className="text-xs">
              Fecha de recepción <span className="text-destructive">*</span>
            </FieldLabel>
            <input type="hidden" {...register('entryDate')} />
            <Input
              id="entryDate"
              type="text"
              className="h-9 text-sm"
              value={formatSupplyEntryDateTime(watchedEntryDate)}
              onChange={(event) =>
                setValue('entryDate', event.target.value, {
                  shouldDirty: true,
                  shouldValidate: true,
                })
              }
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="invoiceNumber" className="text-xs">
              N° de factura / Remito
            </FieldLabel>
            <Input
              id="invoiceNumber"
              placeholder="Opcional"
              {...register('invoiceNumber')}
            />
          </Field>

          <Field>
            <FieldLabel htmlFor="description" className="text-xs">
              Observaciones / Notas
            </FieldLabel>
            <Input
              id="description"
              placeholder="Nota general"
              {...register('description')}
            />
          </Field>
        </div>
      </div>
    </Card>
  )
}
