import { useState } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, BeerIcon, Play, Trash2, X } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  InputGroup,
  InputGroupInput,
  InputGroupAddon,
} from "@/components/ui/InputGroup";
import { useProductionOrder } from "../hooks/useProductionOrder";
import { productionService } from "../services/productionService";
import { useNotification } from "@/components/shared/notifications/useNotification";
import { ExecuteProductionModal } from "../components/ExecuteProductionModal";
import { CancelProductionModal } from "../components/CancelProductionModal";
import { DiscardProductionModal } from "../components/DiscardProductionModal";
import { StockInsufficientBanner } from "../components/StockInsufficientBanner";
import { formatDate, formatDateTime, formatDecimal, formatCurrency } from "@/lib/utils/formatters"

const statusConfig = {
  PLANNED: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Planeada" },
  DONE: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completada" },
  CANCELLED: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelada" },
  DISCARDED: { className: "bg-slate-100 text-slate-500 border-slate-200", label: "Descartada" },
};

const DESCRIPTION_CLAMP_LENGTH = 35;

function Divider() {
  return <div className="border-t border-neutral-200 dark:border-gray-800" />;
}

/** Fila de información del sidebar: título a la izquierda, dato a la derecha. */
function InfoRow({ label, value }) {
  return (
    <div className="flex justify-between gap-3 text-sm">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="font-medium text-right break-words">{value}</span>
    </div>
  );
}

/**
 * Descripción del sidebar, debajo del título. Cuando el texto es muy largo
 * se recorta a 2 líneas y permite expandir/colapsar con "Ver más / Ver menos".
 */
function DescriptionSection({ description }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = description.length > DESCRIPTION_CLAMP_LENGTH;

  return (
    <div className="space-y-1">
      <span className="block text-sm text-gray-500">Descripción</span>
      <p
        className={`text-sm font-medium break-words ${
          isLong && !expanded ? "line-clamp-2" : ""
        }`}
      >
        {description}
      </p>
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
  const [savingEdit, setSavingEdit] = useState(false)
  const [missingIngredients, setMissingIngredients] = useState(null)
  const notify = useNotification()

  if (order !== syncedOrder) {
    setSyncedOrder(order)
    setMissingIngredients(null)
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
    order?.unit_cost > 0 ? `${formatCurrency(order.unit_cost)}/${order?.base_uom_symbol ?? ""}` : "-"

  const totalCostValue = (() => {
    if (!order?.unit_cost || order.unit_cost <= 0) return "-"
    const qty = isPlanned ? Number(order.planned_quantity) : Number(order.produced_quantity)
    if (!qty || qty <= 0) return "-"
    return formatCurrency(Number(order.unit_cost) * qty)
  })()

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

  async function handleSave() {
    const quantity = Number(qtyValue)
    if (!qtyValue || Number.isNaN(quantity) || quantity <= 0) {
      notify.error("La cantidad debe ser un número mayor a 0.")
      return
    }
    if (!dateValue) {
      notify.error("La fecha programada es requerida.")
      return
    }

    setSavingEdit(true)
    try {
      await productionService.update(order.id, {
        planned_quantity: quantity,
        schedule_date: dateValue,
      })
      await refetch({ silent: true })
      notify.success("Orden actualizada correctamente.")
    } catch (err) {
      const detail = err.response?.data?.detail
      if (detail?.missing && Array.isArray(detail.missing)) {
        setMissingIngredients({ message: detail.message, missing: detail.missing })
      } else {
        const msg = typeof detail === "string"
          ? detail
          : detail?.message || "Error al actualizar la orden."
        notify.error(msg)
      }
    } finally {
      setSavingEdit(false)
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner />
      </div>
    )
  }

  if (error) {
    return <p>Ocurrió un error al cargar.</p>
  }

  return (
    <div className="grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)] lg:grid-cols-[300px_1fr] gap-6 h-full">
      {/* Encabezado: nombre + acciones a la misma altura */}
      <header className="lg:col-span-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="cursor-pointer"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-semibold tracking-tight">{order?.item_name}</h1>
        </div>

        <div className="flex items-center gap-2">
          {isPlanned && (
            <>
              <Button size="sm" className="gap-1.5 cursor-pointer" onClick={() => setExecuteOpen(true)}>
                <Play className="h-3.5 w-3.5 fill-current" /> Ejecutar
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 cursor-pointer border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setCancelOpen(true)}
              >
                <X className="h-3.5 w-3.5" /> Cancelar
              </Button>
            </>
          )}
          {isDone && (
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 cursor-pointer border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={() => setDiscardOpen(true)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Descartar
            </Button>
          )}
        </div>
      </header>

      {/* Sidebar en card */}
      <aside className="bg-white rounded-lg border shadow-sm p-4 self-start flex flex-col gap-3">
        <div className="aspect-square bg-gray-100 rounded-md flex items-center justify-center">
          <BeerIcon className="h-10 w-10 text-gray-400" />
        </div>

        <InfoRow
          label="Estado"
          value={
            <Badge className={`font-medium shadow-none ${status.className}`}>
              {status.label}
            </Badge>
          }
        />

        <Divider />

        <div className="space-y-2">
          <InfoRow label="Receta" value={`v${order?.bom_version ?? "-"}`} />
          <InfoRow
            label="Cantidad planificada"
            value={`${formatDecimal(order?.planned_quantity)} ${order?.base_uom_symbol ?? ""}`}
          />
          {!isPlanned && (
            <InfoRow
              label="Cantidad producida"
              value={`${formatDecimal(order?.produced_quantity)} ${order?.base_uom_symbol ?? ""}`}
            />
          )}
          {isPlanned && order?.ingredients?.length > 0 && (
            <InfoRow label="Insumos comprometidos" value={order.ingredients.length} />
          )}
          <InfoRow label="Programada" value={formatDate(order?.schedule_date)} />
          {order?.completed_at && (
            <InfoRow label="Finalización" value={formatDateTime(order.completed_at)} />
          )}
          <InfoRow label="Costo estimado" value={costValue} />
          <InfoRow label="Costo total estimado" value={totalCostValue} />
        </div>

        {order?.description && (
          <>
            <Divider />
            <DescriptionSection description={order.description} />
          </>
        )}
      </aside>

      {/* Contenido en cards separadas */}
      <main className="min-h-0 overflow-y-auto">
        {isPlanned ? (
          <div className="space-y-6">
            <section className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
              <h2 className="text-lg font-semibold">Insumos comprometidos</h2>
              {order?.ingredients?.length ? (
                <DataTable columns={ingredientColumns} data={order.ingredients} />
              ) : (
                <p className="text-sm text-gray-500">
                  No se encontró una receta activa para calcular los insumos de esta producción.
                </p>
              )}
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
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
                      onChange={(e) => { setQtyValue(e.target.value); setMissingIngredients(null) }}
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
                    onChange={(e) => { setDateValue(e.target.value); setMissingIngredients(null) }}
                  />
                </div>
              </div>

              <StockInsufficientBanner
                message={missingIngredients?.message}
                missing={missingIngredients?.missing}
                onDismiss={() => setMissingIngredients(null)}
              />

              <div className="flex justify-end">
                <Button
                  size="sm"
                  className="cursor-pointer"
                  disabled={!hasChanges || savingEdit || missingIngredients}
                  onClick={handleSave}
                >
                  Guardar cambios
                </Button>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <section className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
              <h2 className="text-lg font-semibold">Insumos consumidos</h2>
              {order?.consumptions?.length ? (
                <DataTable columns={movementColumns} data={order.consumptions} />
              ) : (
                <p className="text-sm text-gray-500">
                  La orden no registra consumo de insumos.
                </p>
              )}
            </section>

            <section className="bg-white rounded-lg border shadow-sm p-4 space-y-4">
              <h2 className="text-lg font-semibold">Producto obtenido</h2>
              {order?.outputs?.length ? (
                <DataTable columns={movementColumns} data={order.outputs} />
              ) : (
                <p className="text-sm text-gray-500">
                  La orden no registra producción obtenida.
                </p>
              )}
            </section>
          </div>
        )}
      </main>

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
    </div>
  )
}
