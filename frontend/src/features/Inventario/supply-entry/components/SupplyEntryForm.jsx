import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { DecimalInput } from '@/components/shared/DecimalInput'
import { formatCurrency } from '@/lib/utils/formatters'
import { Field, FieldLabel } from '@/components/ui/Field'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/Dialog'
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
import { formatSupplyEntryDateTime } from '../constants/supplyEntry.constants'

function SupplierCombobox({ value, onChange, suppliers = [], loading = false, onCreateClick, invalid = false }) {
  const [open, setOpen] = useState(false)
  const selected = suppliers.find((supplier) => supplier.id === value)

  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-invalid={invalid}
            disabled={loading}
            className={cn(
              'flex h-9 min-w-0 flex-1 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
              'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
              'disabled:cursor-not-allowed disabled:opacity-50',
              !selected && 'text-muted-foreground',
              invalid && 'border-destructive focus:ring-destructive/30'
            )}
          >
            <span className="truncate">
              {selected ? selected.name : loading ? 'Cargando proveedores...' : 'Seleccionar proveedor'}
            </span>
            <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar proveedor..." />
            <CommandList>
              <CommandEmpty>Sin resultados.</CommandEmpty>
              <CommandGroup>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.id}
                    value={supplier.name}
                    onSelect={() => {
                      onChange(supplier.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 size-4 shrink-0',
                        value === supplier.id ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate text-sm font-medium">{supplier.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        onClick={onCreateClick}
        disabled={loading}
        aria-label="Crear proveedor"
      >
        <Plus />
      </Button>
    </div>
  )
}

function CreateSupplierDialog({ open, onOpenChange, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })
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
      setFormData({ name: '', email: '', phone: '', address: '' })
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

/**
 * SupplyCombobox — selector de insumo con búsqueda tipo combobox.
 */
function SupplyCombobox({ value, onChange, supplies = [], invalid = false }) {
  const [open, setOpen] = useState(false)
  const selected = supplies.find((s) => s.id === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-invalid={invalid}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs',
            'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
            !selected && 'text-muted-foreground',
            invalid && 'border-destructive focus:ring-destructive/30'
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

        {/* ── Cabecera ─────────────────────────────────────────── */}
        <Card>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Datos del abastecimiento
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field data-invalid={errors.supplierId ? true : false}>
                <FieldLabel className="text-xs">
                  Proveedor <span className="text-destructive">*</span>
                </FieldLabel>
                <SupplierCombobox
                  value={formHook.watchedSupplierId}
                  onChange={(id) => setValue('supplierId', id, { shouldDirty: true, shouldValidate: true })}
                  suppliers={supplierOptions}
                  loading={suppliersLoading}
                  onCreateClick={() => setOpenCreateSupplier(true)}
                  invalid={errors.supplierId ? true : false}
                />
              </Field>

              <Field data-invalid={errors.entryDate ? true : false}>
                <FieldLabel htmlFor="entryDate" className="text-xs">
                  Fecha de ingreso <span className="text-destructive">*</span>
                </FieldLabel>
                <input type="hidden" {...register('entryDate')} />
                <Input
                  id="entryDate"
                  type="text"
                  className="h-9 text-sm"
                  value={formatSupplyEntryDateTime(formHook.watchedEntryDate)}
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
        <Card className="py-0">
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Artículos
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cada artículo registra qué insumo ingresa, en qué cantidad y a qué costo unitario.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="cursor-pointer"
              >
                <Plus data-icon="inline-start" />
                Agregar
              </Button>
            </div>

            <div className="-mx-5 overflow-x-auto px-5">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-10">Nro</th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground">Insumo <span className="text-destructive"> *</span></th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-32">Cantidad <span className="text-destructive"> *</span></th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-32">Costo unit. <span className="text-destructive"> *</span></th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-36">Vencimiento</th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-32">N° lote</th>
                    <th className="pb-2 pt-1 text-left text-xs font-medium text-muted-foreground w-10">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <SupplyEntryLineRow
                      key={field.id}
                      index={index}
                      control={control}
                      register={register}
                      setValue={setValue}
                      watchedItems={watchedItems}
                      availableSupplies={availableSupplies}
                      itemErrors={errors.items?.[index]}
                      canRemove={fields.length > 1}
                      onRemove={handleRemoveItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No hay artículos agregados. Hacé clic en "Agregar" para comenzar.
              </p>
            )}
          </div>
        </Card>

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

      <CreateSupplierDialog
        open={openCreateSupplier}
        onOpenChange={setOpenCreateSupplier}
        onCreate={handleCreateSupplier}
      />
    </div>
  )
}

/**
 * SupplyEntryLineRow — fila de artículo con subtotal en mobile.
 */
function SupplyEntryLineRow({
  index,
  control,
  register,
  setValue,
  watchedItems,
  availableSupplies,
  itemErrors,
  canRemove,
  onRemove,
}) {
  const quantity = useWatch({ control, name: `items.${index}.quantity` })
  const unitCost = useWatch({ control, name: `items.${index}.unitCost` })
  const isQtyInvalid = quantity == null || quantity === '' || quantity <= 0
  const isCostInvalid = unitCost == null || unitCost === '' || unitCost <= 0

  const subtotal =
    (Number(watchedItems[index]?.quantity ?? 0) || 0) *
    (Number(watchedItems[index]?.unitCost ?? 0) || 0)

  return (
    <tr className="border-b border-border last:border-0 group">
      {/* Nro */}
      <td className="py-2.5 pr-3 align-top">
        <span className="hidden sm:inline-flex size-9 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
        <span className="text-xs text-muted-foreground sm:hidden">{index + 1}.</span>
      </td>

      {/* Insumo */}
      <td className="py-2.5 pr-3 align-top">
        <span className={`text-xs sm:hidden block mb-1 ${itemErrors?.supplyId ? 'text-destructive' : 'text-muted-foreground'}`}>Insumo *</span>
        <SupplyCombobox
          value={watchedItems[index]?.supplyId ?? 0}
          onChange={(id) => setValue(`items.${index}.supplyId`, id, { shouldValidate: true })}
          supplies={availableSupplies}
          invalid={itemErrors?.supplyId ? true : false}
        />
      </td>

      {/* Cantidad */}
      <td className="py-2.5 pr-3 align-top">
        <span className={cn('text-xs sm:hidden block mb-1', isQtyInvalid ? 'text-destructive' : 'text-muted-foreground')}>Cantidad *</span>
        <Controller
          name={`items.${index}.quantity`}
          control={control}
          render={({ field: qtyField, fieldState }) => (
            <DecimalInput
              {...qtyField}
              aria-invalid={fieldState.invalid || isQtyInvalid ? 'true' : undefined}
              placeholder="0.00"
              className={cn(
                'h-9 text-sm',
                (fieldState.invalid || isQtyInvalid) && 'text-destructive ring-destructive/20 ring-1 border-destructive'
              )}
            />
          )}
        />
      </td>

      {/* Costo unitario */}
      <td className="py-2.5 pr-3 align-top">
        <span className={cn('text-xs sm:hidden block mb-1', isCostInvalid ? 'text-destructive' : 'text-muted-foreground')}>Costo unit. *</span>
        <Controller
          name={`items.${index}.unitCost`}
          control={control}
          render={({ field: costField, fieldState }) => (
            <DecimalInput
              {...costField}
              aria-invalid={fieldState.invalid || isCostInvalid ? 'true' : undefined}
              placeholder="0.00"
              className={cn(
                'h-9 text-sm',
                (fieldState.invalid || isCostInvalid) && 'text-destructive ring-destructive/20 ring-1 border-destructive'
              )}
            />
          )}
        />
      </td>

      {/* Vencimiento */}
      <td className="py-2.5 pr-3 align-top">
        <span className={cn('text-xs sm:hidden block mb-1', itemErrors?.expirationDate ? 'text-destructive' : 'text-muted-foreground')}>Vencimiento *</span>
        <Input
          type="date"
          className={cn(
            'h-9 text-sm',
            itemErrors?.expirationDate && 'text-destructive ring-destructive/20 ring-1 border-destructive'
          )}
          aria-invalid={itemErrors?.expirationDate ? 'true' : undefined}
          {...register(`items.${index}.expirationDate`)}
        />
      </td>

      {/* N° lote */}
      <td className="py-2.5 pr-3 align-top">
        <span className="text-xs text-muted-foreground sm:hidden block mb-1">N° lote</span>
        <Input
          placeholder="Opcional"
          className="h-9 text-sm"
          {...register(`items.${index}.batchNumber`)}
        />
      </td>

      {/* Acción */}
      <td className="py-2.5 align-top">
        <div className="flex items-center justify-center gap-1">
          {subtotal > 0 && (
            <span className="text-xs text-muted-foreground sm:hidden">
              {formatCurrency(subtotal)}
            </span>
          )}
          {canRemove ? (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              aria-label="Eliminar artículo"
            >
              <Trash2 className="size-4" />
            </button>
          ) : (
            <span className="size-6" /> /* placeholder para alinear */
          )}
        </div>
      </td>
    </tr>
  )
}
