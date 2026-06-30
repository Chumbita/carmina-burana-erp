import { useState } from 'react'
import { Controller } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Field, FieldLabel } from '@/components/ui/Field'
import { Card } from '@/components/ui/Card'
import { Spinner } from '@/components/ui/Spinner'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select'
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
 * ItemCombobox — selector de item con búsqueda tipo combobox.
 */
function ItemCombobox({ value, onChange, items = [], placeholder = 'Seleccionar…' }) {
  const [open, setOpen] = useState(false)
  const selected = items.find((i) => i.id === value)

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
            {selected ? selected.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-1 size-3.5 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar…" />
          <CommandList>
            <CommandEmpty>Sin resultados.</CommandEmpty>
            <CommandGroup>
              {items.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.name}
                  onSelect={() => {
                    onChange(item.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 size-4 shrink-0',
                      value === item.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate">{item.name}</span>
                    {item.type && (
                      <span className="text-xs text-muted-foreground truncate">
                        {item.type}
                      </span>
                    )}
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
 * BomForm — formulario de registro de fórmula (BOM).
 */
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
    uoms,
    uomsLoading,
    handleAddLine,
    handleRemoveLine,
    handleFormSubmit,
    handleSubmit,
  } = formHook

  const currentLoading = isSubmitting

  return (
    <div className="flex flex-col gap-5">
      {/* Error */}
      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {typeof error === 'string' ? error : error?.message ?? 'Error desconocido'}
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-5">

        <Card>
          <div className="p-5 flex flex-col gap-4">
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Datos de la fórmula
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Controller
                name="parent_item_id"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name} className="text-sm">
                      Producto padre <span className="text-destructive">*</span>
                    </FieldLabel>
                    <ItemCombobox
                      value={field.value}
                      onChange={(id) => field.onChange(id)}
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
        <Card>
          <div className="p-5 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Componentes
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
              >
                <Plus data-icon="inline-start" />
                Agregar
              </Button>
            </div>

            {/* Header de columnas — oculto en mobile */}
            <div className="hidden sm:grid sm:grid-cols-[auto_2fr_1fr_1fr_auto] gap-2 px-2">
              {['Nro', 'Componente', 'Cantidad', 'Unidad', ''].map((h) => (
                <span key={h} className="text-xs font-medium text-muted-foreground">
                  {h}
                </span>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className={cn(
                    'rounded-md border border-border bg-muted/20 px-3 py-2.5',
                    'flex flex-col gap-2',
                    'sm:grid sm:grid-cols-[auto_2fr_1fr_1fr_auto] sm:items-center sm:gap-2'
                  )}
                >
                  {/* Nro */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground sm:hidden">Nro</span>
                    <span className="hidden sm:flex size-8 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground">
                      {index + 1}
                    </span>
                  </div>

                  {/* Componente */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground sm:hidden">Componente *</span>
                    <Controller
                      name={`lines.${index}.component_item_id`}
                      control={control}
                      render={({ field: itemField, fieldState }) => (
                        <>
                          <ItemCombobox
                            value={itemField.value}
                            onChange={(id) => itemField.onChange(id)}
                            items={items}
                            placeholder="Seleccionar…"
                          />
                          {fieldState.invalid && (
                            <p className="text-destructive text-xs mt-0.5">{fieldState.error?.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  {/* Cantidad */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground sm:hidden">Cantidad *</span>
                    <Controller
                      name={`lines.${index}.quantity`}
                      control={control}
                      render={({ field: qtyField, fieldState }) => (
                        <>
                          <Input
                            type="number"
                            step="0.01"
                            min="0.01"
                            placeholder="0.00"
                            className="h-9 text-sm"
                            value={qtyField.value ?? ''}
                            onChange={(e) => qtyField.onChange(e.target.valueAsNumber)}
                          />
                          {fieldState.invalid && (
                            <p className="text-destructive text-xs mt-0.5">{fieldState.error?.message}</p>
                          )}
                        </>
                      )}
                    />
                  </div>

                  {/* Unidad */}
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground sm:hidden">Unidad</span>
                    <Controller
                      name={`lines.${index}.uom`}
                      control={control}
                      render={({ field: uomField }) => (
                        <Select
                          value={uomField.value ? String(uomField.value) : ''}
                          onValueChange={(val) => uomField.onChange(Number(val))}
                          disabled={uomsLoading}
                        >
                          <SelectTrigger className="h-9 text-sm">
                            <SelectValue
                              placeholder={uomsLoading ? 'Cargando…' : 'Opcional'}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Unidades</SelectLabel>
                              {uoms.map((uom) => (
                                <SelectItem key={uom.id} value={String(uom.id)}>
                                  {uom.symbol} — {uom.name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Eliminar */}
                  <div className="flex items-center justify-between sm:justify-center gap-2">
                    {fields.length > 1 ? (
                      <button
                        type="button"
                        onClick={() => handleRemoveLine(index)}
                        className="rounded p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors pointer"
                        aria-label="Eliminar componente"
                      >
                        <Trash2 className="size-4.5" />
                      </button>
                    ) : (
                      <span className="size-6" />
                    )}
                  </div>
                </div>
              ))}
            </div>
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
              onClick={onCancel}
              disabled={currentLoading}
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              size="sm"
              disabled={!isDirty || !isValid || currentLoading}
            >
              {currentLoading ? (
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
