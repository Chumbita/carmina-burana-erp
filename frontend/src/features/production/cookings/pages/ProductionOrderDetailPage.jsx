import { useState } from "react";
import { useParams } from "react-router-dom";
import { BeerIcon, Play, Trash2, X } from "lucide-react";
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Field, FieldLabel } from "@/components/ui/Field";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/InputGroup";
import { useProductionOrder } from "../hooks/useProductionOrder";
import { productionService } from "../services/productionService";
import { ExecuteProductionModal } from "../components/ExecuteProductionModal";
import { CancelProductionModal } from "../components/CancelProductionModal";
import { DiscardProductionModal } from "../components/DiscardProductionModal";
import { formatDate, formatDateTime, formatDecimal, formatCurrency } from "@/lib/utils/formatters"

const statusConfig = {
  PLANNED: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Planeada" },
  DONE: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completada" },
  CANCELLED: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelada" },
  DISCARDED: { className: "bg-slate-100 text-slate-500 border-slate-200", label: "Descartada" },
};

const DESCRIPTION_CLAMP_LENGTH = 35;

/**
 * Descripción del sidebar en la misma línea que el resto de la información,
 * con un espacio entre el título y el texto. Cuando es larga se recorta a
 * 2 líneas y permite expandir/colapsar con "Ver más / Ver menos".
 */
function DescriptionSection({ description }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > DESCRIPTION_CLAMP_LENGTH;

  return (
    <div className="space-y-0.5">
      <div className="flex justify-between gap-3 text-sm">
        <span className="shrink-0 text-gray-500">Descripción</span>
        <span
          className={`font-medium text-right break-words ${
            isLong && !expanded ? "line-clamp-2" : ""
          }`}
        >
          {description}
        </span>
      </div>
      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="cursor-pointer text-xs text-primary underline-offset-2 hover:underline"
        >
          {expanded ? "Ver menos" : "Ver más"}
        </button>
      )}
    </div>
  );
}

export default function ProductionOrderDetailPage() {
  const { orderId } = useParams()
  const { order, loading, error, refetch } = useProductionOrder(orderId)

  const [executeOpen, setExecuteOpen] = useState(false)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [discardOpen, setDiscardOpen] = useState(false)

  // Valores de los campos editables (solo UI, sin guardado por ahora).
  // Se sincronizan con la orden durante el render (patrón de ajuste de estado).
  const [syncedOrder, setSyncedOrder] = useState(null)
  const [qtyValue, setQtyValue] = useState("")
  const [dateValue, setDateValue] = useState("")

  if (order !== syncedOrder) {
    setSyncedOrder(order)
    if (order) {
      setQtyValue(order.planned_quantity != null ? String(Number(order.planned_quantity)) : "")
      setDateValue(order.schedule_date ? String(order.schedule_date).split("T")[0] : "")
    } else {
      setQtyValue("")
      setDateValue("")
    }
  }

  const isPlanned = order?.status === "PLANNED"
  const isDone = order?.status === "DONE"
  const status = statusConfig[order?.status] || { className: "bg-gray-100 text-gray-800", label: order?.status }

  const initialQuantity =
    syncedOrder?.planned_quantity != null ? String(Number(syncedOrder.planned_quantity)) : ""
  const initialDate = syncedOrder?.schedule_date
    ? String(syncedOrder.schedule_date).split("T")[0]
    : ""

  const hasChanges = qtyValue !== initialQuantity || dateValue !== initialDate

  const costValue =
    order?.unit_cost > 0 ? `${formatCurrency(order.unit_cost)}/${order.base_uom_symbol ?? ""}` : "-"

  async function handleExecute(target, payload) {
    await productionService.execute(target.id, payload)
    await refetch({ silent: true })
  }

  async function handleCancel(id) {
    await productionService.cancel(id)
    await refetch({ silent: true })
  }

  async function handleDiscard(id, description) {
    await productionService.discard(id, description)
    await refetch({ silent: true })
  }

  const ingredientColumns = [
    { header: "Nro", accessor: "id", render: (_value, _row, index) => index + 1 },
    { header: "Insumo", accessor: "component_item_name" },
    {
      header: "Cantidad requerida",
      accessor: "required_quantity",
      render: (value, row) => (
        <span className="font-medium">
          {formatDecimal(value)} {row.uom_symbol}
        </span>
      ),
    },
  ]

  const movementColumns = [
    { header: "Nro", accessor: "id", render: (_value, _row, index) => index + 1 },
    { header: "Insumo", accessor: "item_name" },
    { header: "Lote", accessor: "lot_code" },
    {
      header: "Cantidad",
      accessor: "quantity",
      render: (value, row) => (
        <span className="font-medium">
          {formatDecimal(value)} {row.uom_symbol}
        </span>
      ),
    },
  ]

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={order?.item_name} />

      <EntityDetailPage.Sidebar
        icon={<BeerIcon className="h-10 w-10 text-gray-400" />}
      >
        <EntityDetailPage.Sidebar.Row
          label="Estado"
          value={
            <Badge className={`font-medium shadow-none ${status.className}`}>
              {status.label}
            </Badge>
          }
        />
        <EntityDetailPage.Sidebar.Row label="Receta" value={`v${order?.bom_version ?? "-"}`} />
        <EntityDetailPage.Sidebar.Row
          label="Cantidad planificada"
          value={`${formatDecimal(order?.planned_quantity)} ${order?.base_uom_symbol ?? ""}`}
        />
        {!isPlanned && (
          <EntityDetailPage.Sidebar.Row
            label="Cantidad producida"
            value={`${formatDecimal(order?.produced_quantity)} ${order?.base_uom_symbol ?? ""}`}
          />
        )}
        {isPlanned && order?.ingredients?.length > 0 && (
          <EntityDetailPage.Sidebar.Row label="Insumos comprometidos" value={order.ingredients.length} />
        )}
        <EntityDetailPage.Sidebar.Row label="Programada" value={formatDate(order?.schedule_date)} />
        {order?.completed_at && (
          <EntityDetailPage.Sidebar.Row label="Finalización" value={formatDateTime(order.completed_at)} />
        )}
        <EntityDetailPage.Sidebar.Row label="Costo estimado" value={costValue} />
        {order?.description && <DescriptionSection description={order.description} />}
      </EntityDetailPage.Sidebar>

      <EntityDetailPage.Content>
        {isPlanned ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Insumos comprometidos</h2>
              <div className="flex items-center gap-2">
                <Button size="sm" className="gap-1.5" onClick={() => setExecuteOpen(true)}>
                  <Play className="h-3.5 w-3.5 fill-current" /> Ejecutar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => setCancelOpen(true)}
                >
                  <X className="h-3.5 w-3.5" /> Cancelar
                </Button>
              </div>
            </div>

            {order?.ingredients?.length ? (
              <DataTable columns={ingredientColumns} data={order.ingredients} />
            ) : (
              <p className="text-sm text-gray-500">
                No se encontró una receta activa para calcular los insumos de esta producción.
              </p>
            )}

            <div className="space-y-4 pt-2">
              <h2 className="text-lg font-semibold">Editar planificación</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label htmlFor="planned-quantity" className="text-xs font-medium text-neutral-600">
                    Cantidad planificada
                  </label>
                  <InputGroup className="border-neutral-300 hover:border-neutral-400">
                    <InputGroupInput
                      id="planned-quantity"
                      type="number"
                      min="0"
                      step="any"
                      className="text-xs"
                      value={qtyValue}
                      onChange={(e) => setQtyValue(e.target.value)}
                    />
                    <InputGroupAddon
                      align="inline-end"
                      className="pl-3 pr-3 text-xs text-neutral-400 font-medium border-l border-neutral-200"
                    >
                      {order?.base_uom_symbol}
                    </InputGroupAddon>
                  </InputGroup>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="schedule-date" className="text-xs font-medium text-neutral-600">
                    Fecha programada
                  </label>
                  <Input
                    id="schedule-date"
                    type="date"
                    className="h-9 text-xs px-3"
                    value={dateValue}
                    onChange={(e) => setDateValue(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button size="sm" className="cursor-pointer" disabled={!hasChanges}>
                  Guardar cambios
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">Insumos consumidos</h2>
                {isDone && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDiscardOpen(true)}
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Descartar
                  </Button>
                )}
              </div>
              {order?.consumptions?.length ? (
                <DataTable columns={movementColumns} data={order.consumptions} />
              ) : (
                <p className="text-sm text-gray-500">
                  La orden no registra consumo de insumos.
                </p>
              )}
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Producto obtenido</h2>
              {order?.outputs?.length ? (
                <DataTable columns={movementColumns} data={order.outputs} />
              ) : (
                <p className="text-sm text-gray-500">
                  La orden no registra producción obtenida.
                </p>
              )}
            </div>
          </div>
        )}
      </EntityDetailPage.Content>

      <ExecuteProductionModal
        open={executeOpen}
        order={order}
        onExecute={handleExecute}
        onClose={() => setExecuteOpen(false)}
      />

      <CancelProductionModal
        open={cancelOpen}
        order={order}
        onCancel={handleCancel}
        onClose={() => setCancelOpen(false)}
      />

      <DiscardProductionModal
        open={discardOpen}
        order={order}
        onDiscard={handleDiscard}
        onClose={() => setDiscardOpen(false)}
      />
    </EntityDetailPage>
  )
}
