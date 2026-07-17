import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Field, FieldLabel } from '@/components/ui/Field'
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

function ItemCombobox({ value, onChange, onSelect, items = [], placeholder = 'Seleccionar…' }) {
  const [open, setOpen] = useState(false)
  const selected = items.find((i) => i.item_id === value)

  function handleSelect(item) {
    onChange(item.item_id)
    if (onSelect) onSelect(item)
    setOpen(false)
  }

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
          <span className="truncate text-left">
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.item_id}
                  value={`${item.name} ${item.brand} ${item.item_type} ${item.uom_symbol}`}
                  onSelect={() => handleSelect(item)}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4 shrink-0',
                      value === item.item_id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <span className="flex flex-col">
                    <span className="font-semibold text-base text-foreground">{item.name}</span>
                    <span className="text-sm text-muted-foreground">{item.brand} - {item.item_type} - {item.uom_symbol}</span>
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

export function BomForm({
  formHook,
  onCancel,
  isSubmitting = false,
}) {
  const {
    control,
    fields,
    isDirty,
    isValid,
    error,
    items,
    itemsLoading,
    handleAddLine,
    handleRemoveLine,
    handleFormSubmit,
    handleSubmit,
    setValue,
  } = formHook

  const watchedParentItemId = useWatch({ control, name: 'parent_item_id' })
  const parentItemSelected = items.find((i) => i.item_id === watchedParentItemId)

  return (
    <div className="flex flex-col gap-5">
      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">

        <Card className="py-0">
          <div className="p-6 flex flex-col gap-4">
            <div>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Datos de la fórmula
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Seleccioná el producto final e indicá la cantidad base de referencia para esta fórmula.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-[3fr_2fr_2fr] gap-3">
              <Controller
                name="parent_item_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Producto<span className="text-destructive">*</span>
                    </FieldLabel>
                    <ItemCombobox
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
                      onSelect={(item) => setValue('uom_id', item.uom_id, { shouldValidate: true })}
                      items={items}
                      placeholder={itemsLoading ? 'Cargando productos…' : 'Seleccionar producto…'}
                    />
                    {fieldState.invalid && (
                      <p className="text-destructive text-sm mt-1">{fieldState.error?.message}</p>
                    )}
                  </Field>
                )}
              />

              <Controller
                name="quantity"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Cantidad a producir <span className="text-destructive">*</span>
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder=""
                      className="h-9 text-sm"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.valueAsNumber)}
                    />
                  </Field>
                )}
              />

              <Field>
                <FieldLabel className="text-sm">
                  Unidad de medida <span className="text-destructive">*</span>
                </FieldLabel>
                <Input
                  readOnly
                  className="h-9 text-sm bg-muted cursor-not-allowed"
                  value={parentItemSelected ? `${parentItemSelected.uom_symbol}` : ''}
                />
              </Field>

              <Controller
                name="valid_from"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Vigente desde
                    </FieldLabel>
                    <Input
                      {...field}
                      id={field.name}
                      type="datetime-local"
                      className="h-9 text-sm"
                    />
                  </Field>
                )}
              />
            </div>
          </div>
        </Card>

        {/* ── Componentes — tabla compacta ──────────────────────── */}
        <Card className="py-0">
          <div className="p-6 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Componentes
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Cada componente define qué insumo se necesita y en qué proporción respecto a la cantidad base.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="cursor-pointer"
              >
                <Plus data-icon="inline-start " />
                Agregar
              </Button>
            </div>

            <div className="-mx-5 overflow-x-auto px-5">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-10">Nro</th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground">Componente</th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-32">Cantidad</th>
                    <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-28">Unidad</th>
                    <th className="pb-2 pt-1 text-left text-xs font-medium text-muted-foreground  w-10">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <BomLineRow
                      key={field.id}
                      index={index}
                      control={control}
                      items={items}
                      onRemove={handleRemoveLine}
                      setValue={setValue}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {fields.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                No hay componentes agregados. Hacé clic en "Agregar" para comenzar.
              </p>
            )}
          </div>
        </Card>

        {/* ── Footer: resumen + acciones ────────────────────────── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-muted-foreground">
              {fields.length} componente{fields.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="flex gap-2 justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!isDirty || !isValid || isSubmitting}
              className="cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Spinner data-icon="inline-start" />
                  Guardando…
                </>
              ) : (
                <>
                  <Package data-icon="inline-start" />
                  Guardar fórmula
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}

/**
 * BomLineRow — fila de componente con auto-asignación de UOM.
 */
function BomLineRow({ index, control, items, onRemove, setValue }) {
  const componentItem = useWatch({ control, name: `lines.${index}.component_item_id` })
  const quantity = useWatch({ control, name: `lines.${index}.quantity` })
  const selectedItem = items.find((i) => i.item_id === componentItem)
  const isQtyInvalid = quantity == null || quantity === '' || quantity <= 0

  return (
    <tr className="border-b border-border last:border-0 group">
      {/* Nro */}
      <td className="py-2.5 pr-3 align-top">
        <span className="hidden sm:inline-flex size-9 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
          {index + 1}
        </span>
        <span className="text-xs text-muted-foreground sm:hidden">{index + 1}.</span>
      </td>

      {/* Componente */}
      <td className="py-2.5 pr-3 align-top">
        <span className="text-xs text-muted-foreground sm:hidden block mb-1">Componente *</span>
        <Controller
          name={`lines.${index}.component_item_id`}
          control={control}
          render={({ field: itemField, fieldState }) => (
            <>
              <ItemCombobox
                value={itemField.value}
                onChange={(id) => itemField.onChange(id)}
                onSelect={(item) => {
                  setValue(`lines.${index}.uom`, item.uom_id, { shouldValidate: true })
                }}
                items={items}
                placeholder="Seleccionar…"
              />
              {fieldState.invalid && (
                <p className="text-destructive text-xs mt-1">{fieldState.error?.message}</p>
              )}
            </>
          )}
        />
      </td>

      {/* Cantidad */}
      <td className="py-2.5 pr-3 align-top">
        <span className={cn('text-xs sm:hidden block mb-1', isQtyInvalid ? 'text-destructive' : 'text-muted-foreground')}>Cantidad *</span>
        <Controller
          name={`lines.${index}.quantity`}
          control={control}
          render={({ field: qtyField, fieldState }) => (
            <>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                aria-invalid={fieldState.invalid || isQtyInvalid ? 'true' : undefined}
                placeholder=""
                className={cn(
                  'h-9 text-sm',
                  (fieldState.invalid || isQtyInvalid) && 'text-destructive ring-destructive/20 ring-1 border-destructive'
                )}
                value={qtyField.value ?? ''}
                onChange={(e) => qtyField.onChange(e.target.valueAsNumber)}
              />
            </>
          )}
        />
      </td>

      {/* Unidad — auto-asignada y bloqueada */}
      <td className="py-2.5 pr-3 align-top">
        <span className="text-xs text-muted-foreground sm:hidden block mb-1">Unidad</span>
        {selectedItem ? (
          <Input
            readOnly
            className="h-9 text-sm bg-muted cursor-not-allowed select-none"
            value={`${selectedItem.uom_symbol}`}
          />
        ) : (
          <Input
            readOnly
            className="h-9 text-sm bg-muted"
          />
        )}
      </td>

      {/* Eliminar */}
      <td className="py-2.5 align-top">
        <div className="flex items-center justify-center">
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors cursor-pointer"
              aria-label="Eliminar componente"
            >
              <Trash2 className="size-4" />
            </button>
        </div>
      </td>
    </tr>
  )
}
