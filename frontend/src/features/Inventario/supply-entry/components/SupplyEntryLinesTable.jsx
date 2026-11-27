import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Plus } from 'lucide-react'

import { SupplyEntryLineRow } from './SupplyEntryLineRow'

/**
 * Tabla de artículos del ingreso. Presentación pura: recibe el estado del
 * field array y delega cada fila en SupplyEntryLineRow.
 */
export function SupplyEntryLinesTable({
  fields,
  control,
  register,
  setValue,
  watchedItems,
  errors,
  availableSupplies,
  onAddItem,
  onRemoveItem,
}) {
  return (
    <Card className="py-0">
      <div className="p-6 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Detalle de insumos recibidos
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Añada los insumos ingresados
              sus cantidades, costos y datos de trazabilidad (lote y vencimiento) para actualizar el inventario
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onAddItem}
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
                <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-32">Costo unitario <span className="text-destructive"> *</span></th>
                <th className="pb-2 pt-1 pr-3 text-left text-xs font-medium text-muted-foreground w-36">Fecha de vencimiento </th>
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
                  onRemove={onRemoveItem}
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
  )
}
