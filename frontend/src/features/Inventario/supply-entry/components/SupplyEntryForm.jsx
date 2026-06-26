import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/Field'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/Popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/Command'

import { Plus, Trash2, Package, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * SupplyCombobox — selector de insumo con búsqueda tipo combobox.
 */
function SupplyCombobox({ value, onChange, supplies = [] }) {
  const [open, setOpen] = useState(false)
  const selected = supplies.find((s) => s.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            !selected && 'text-muted-foreground'
          )}
        >
          <span className="truncate">
            {selected ? selected.name : 'Seleccionar…'}
          </span>
          <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar insumo…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {supplies.map((supply) => (
                <CommandItem
                  key={supply.id}
                  value={supply.name}
                  onSelect={() => {
                    onChange(supply.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4 shrink-0',
                      value === supply.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{supply.name}</span>
                    <span className="text-xs text-muted-foreground truncate">
                      {[supply.brand_name, supply.supply_category, supply.base_uom_symbol]
                        .filter(Boolean)
                        .join(' · ')}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * SupplyEntryForm — formulario de registro de abastecimiento.
 */
export function SupplyEntryForm({
  formHook,
  availableSupplies = [],
  layout = 'page',
  onCancel,
  isSubmitting = false,
}) {
  const {
    register,
    fields,
    watchedItems,
    totalCost,
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

  return (
    <div className="flex flex-col gap-5">
      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">

        {/* ── Cabecera ─────────────────────────────────────────── */}
        <Card>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Datos del abastecimiento
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field>
                <FieldLabel htmlFor="supplier" className="text-xs">
                  Proveedor <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="supplier"
                  placeholder="Nombre del proveedor"
                  {...register('supplier')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="entryDate" className="text-xs">
                  Fecha de ingreso <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  id="entryDate"
                  type="date"
                  {...register('entryDate')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="invoiceNumber" className="text-xs">
                  N° de factura
                </FieldLabel>
                <Input
                  id="invoiceNumber"
                  placeholder="Opcional"
                  {...register('invoiceNumber')}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="description" className="text-xs">
                  Descripción
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

        {/* ── Artículos — tabla compacta ────────────────────────── */}
        <Card>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Artículos
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
              >
                <Plus data-icon="inline-start" />
                Agregar
              </Button>
            </div>

            {/* Header de columnas — oculto en mobile */}
            <div className="hidden sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] gap-2 px-2">
              {['Insumo', 'Cantidad', 'Costo unit.', 'Vencimiento *', 'N° lote', ''].map((h) => (
                <span key={h} className="text-xs font-medium text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {fields.map((field, index) => {
                const subtotal =
                  (watchedItems[index]?.quantity ?? 0) *
                  (watchedItems[index]?.unitCost ?? 0)

                return (
                  <div
                    key={field.id}
                    className={cn(
                      'rounded-md border border-border bg-muted/20 px-3 py-2.5',
                      // mobile: stack vertical; desktop: una sola fila
                      'flex flex-col gap-2',
                      'sm:grid sm:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] sm:items-center sm:gap-2'
                    )}
                  >
                    {/* Insumo */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground sm:hidden">Insumo *</span>
                      <SupplyCombobox
                        value={watchedItems[index]?.supplyId ?? 0}
                        onChange={(id) =>
                          setValue(`items.${index}.supplyId`, id, { shouldValidate: true })
                        }
                        supplies={availableSupplies}
                      />
                    </div>

                    {/* Cantidad */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground sm:hidden">Cantidad *</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="h-9 text-sm"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Costo unitario */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground sm:hidden">Costo unit. *</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0.01"
                        placeholder="0.00"
                        className="h-9 text-sm"
                        {...register(`items.${index}.unitCost`, { valueAsNumber: true })}
                      />
                    </div>

                    {/* Vencimiento */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground sm:hidden">Vencimiento *</span>
                      <Input
                        type="date"
                        className="h-9 text-sm"
                        {...register(`items.${index}.expirationDate`)}
                      />
                    </div>

                    {/* N° lote */}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground sm:hidden">N° lote</span>
                      <Input
                        placeholder="Opcional"
                        className="h-9 text-sm"
                        {...register(`items.${index}.batchNumber`)}
                      />
                    </div>

                    {/* Eliminar + subtotal */}
                    <div className="flex items-center justify-between sm:justify-center gap-2">
                      {subtotal > 0 && (
                        <span className="text-xs text-muted-foreground sm:hidden">
                          ${subtotal.toFixed(2)}
                        </span>
                      )}
                      {fields.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                          aria-label="Eliminar artículo"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      ) : (
                        <span className="size-6" /> /* placeholder para alinear grid */
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        {/* ── Footer: total + acciones ──────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-sm text-muted-foreground">Total:</span>
            <span className="text-lg font-bold">${totalCost.toFixed(2)}</span>
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
                onClick={handleReset}
                disabled={currentLoading}
              >
                Limpiar
              </Button>
            )}

            <Button
              type="submit"
              size="sm"
              disabled={!isDirty || !isValid || currentLoading}
            >
              {currentLoading ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Registrando…
                </>
              ) : (
                <>
                  <Package data-icon="inline-start" />
                  Registrar abastecimiento
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
