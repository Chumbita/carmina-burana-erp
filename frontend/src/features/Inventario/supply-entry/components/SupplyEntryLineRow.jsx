import { Controller, useWatch } from 'react-hook-form'
import { Trash2 } from 'lucide-react'

import { DecimalInput } from '@/components/shared/DecimalInput'
import { Input } from '@/components/ui/Input'
import { InputGroup, InputGroupAddon, InputGroupText } from '@/components/ui/InputGroup'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils/formatters'

import { SupplyCombobox } from './SupplyCombobox'

/**
 * Fila de artículo del formulario de ingreso: insumo, cantidad, costo,
 * vencimiento y lote. Presentación pura sobre react-hook-form.
 */
export function SupplyEntryLineRow({
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
  const supplyId = useWatch({ control, name: `items.${index}.supplyId` })
  const selectedSupply = availableSupplies.find((s) => s.id === supplyId)
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
            <InputGroup>
              <DecimalInput
                {...qtyField}
                data-slot="input-group-control"
                aria-invalid={fieldState.invalid || isQtyInvalid ? 'true' : undefined}
                placeholder="0,00"
                className={cn(
                  'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent h-9 text-sm'
                )}
              />
              <InputGroupAddon align="inline-end">
                <InputGroupText>
                  {selectedSupply?.base_uom_symbol ?? ''}
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
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
            <InputGroup>
              <InputGroupAddon>
                <InputGroupText>$</InputGroupText>
              </InputGroupAddon>
              <DecimalInput
                {...costField}
                data-slot="input-group-control"
                aria-invalid={fieldState.invalid || isCostInvalid ? 'true' : undefined}
                placeholder="0,00"
                className={cn(
                  'flex-1 rounded-none border-0 bg-transparent shadow-none focus-visible:ring-0 dark:bg-transparent h-9 text-sm'
                )}
              />
            </InputGroup>
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
