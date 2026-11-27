import { useState } from 'react'
import { Save } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { formatCurrency } from '@/lib/utils/formatters'

import { CreateSupplierDialog } from './CreateSupplierDialog'
import { SupplyEntryHeaderFields } from './SupplyEntryHeaderFields'
import { SupplyEntryLinesTable } from './SupplyEntryLinesTable'

/**
 * Contenedor del formulario de ingreso de insumos.
 * El estado de react-hook-form lo provee `useSupplyEntryForm`; este componente
 * solo compone la cabecera, la tabla de artículos y el footer de acciones.
 */
export function SupplyEntryForm({
  formHook,
  availableSupplies = [],
  supplierOptions = [],
  suppliersLoading = false,
  onCreateSupplier,
  layout = 'page',
  onCancel,
  isSubmitting = false,
}) {
  const [openCreateSupplier, setOpenCreateSupplier] = useState(false)
  const {
    register,
    control,
    fields,
    watchedItems,
    watchedSupplierId,
    watchedEntryDate,
    totalCost,
    errors,
    loading,
    error,
    isDirty,
    isValid,
    handleAddItem,
    handleRemoveItem,
    handleFormSubmit,
    handleReset,
    handleSubmit,
    setValue,
  } = formHook

  const currentLoading = layout === 'modal' ? isSubmitting : loading

  async function handleCreateSupplier(data) {
    const supplier = await onCreateSupplier(data)
    setValue('supplierId', supplier.id, { shouldDirty: true, shouldValidate: true })
    return supplier
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">
        <SupplyEntryHeaderFields
          errors={errors}
          register={register}
          setValue={setValue}
          watchedSupplierId={watchedSupplierId}
          watchedEntryDate={watchedEntryDate}
          supplierOptions={supplierOptions}
          suppliersLoading={suppliersLoading}
          onCreateSupplierClick={() => setOpenCreateSupplier(true)}
        />

        <SupplyEntryLinesTable
          fields={fields}
          control={control}
          register={register}
          setValue={setValue}
          watchedItems={watchedItems}
          errors={errors}
          availableSupplies={availableSupplies}
          onAddItem={handleAddItem}
          onRemoveItem={handleRemoveItem}
        />

        {/* ── Footer: total + acciones ──────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-lg font-bold">{formatCurrency(totalCost)}</span>
            <span className="text-xs text-muted-foreground">
              · {fields.length} artículo{fields.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex gap-2 justify-end">
            {layout === 'modal' ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={onCancel}
                disabled={currentLoading}
              >
                Cancelar
              </Button>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={handleReset}
                disabled={currentLoading}
              >
                Limpiar
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              className="cursor-pointer"
              disabled={!isDirty || !isValid || currentLoading}
            >
              {currentLoading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Registrando…
                </>
              ) : (
                <>
                  <Save data-icon="inline-start"/>
                  Confirmar ingreso
                </>
              )}
            </Button>
          </div>
        </div>
      </form>

      <CreateSupplierDialog
        open={openCreateSupplier}
        onOpenChange={setOpenCreateSupplier}
        onCreate={handleCreateSupplier}
      />
    </div>
  )
}
