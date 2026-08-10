import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/TextArea";
import { DataTable } from "@/components/shared/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Trash2, AlertTriangle } from "lucide-react";
import { useNotification } from "@/components/shared/notifications/useNotification";

const statusConfig = {
  PLANNED: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Planeada" },
  DONE: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completada" },
  CANCELLED: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelada" },
  DISCARDED: { className: "bg-slate-100 text-slate-500 border-slate-200", label: "Descartada" },
};

export function ProductionHistoryTable({ productions, onDiscard }) {
  const navigate = useNavigate();
  const notify = useNotification();

  // Estado para la confirmación de descarte de la orden
  const [discardTarget, setDiscardTarget] = useState(null);
  const [discardDescription, setDiscardDescription] = useState("");
  const [discardSubmitting, setDiscardSubmitting] = useState(false);

  const handleRowClick = (row) => {
    navigate(`/produccion/cocciones/${row.id}`);
  };

  const executeDiscard = async () => {
    if (!discardTarget) return;
    setDiscardSubmitting(true);
    try {
      await onDiscard(discardTarget, discardDescription);
      notify.success(`Orden Nro ${discardTarget.row_number} descartada.`);
      setDiscardTarget(null);
      setDiscardDescription("");
    } catch (err) {
      const errorData = err.response?.data?.detail;
      notify.error(
        typeof errorData === "string"
          ? errorData
          : errorData?.message || "Ocurrió un error al descartar la orden."
      );
    } finally {
      setDiscardSubmitting(false);
    }
  };

  const columns = [
    { header: "Nro", accessor: "row_number" },
    { header: "Producto", accessor: "item_name" },
    { header: "Receta", accessor: "bom_version", render: (value) => `v${value}` },
    {
      header: "Cantidad",
      accessor: "produced_quantity",
      render: (value, row) => `${value} ${row.base_uom_symbol || ""}`,
    },
    { header: "Fecha programada", accessor: "schedule_date", render: (value) => (value ? value : "Sin fecha") },
    {
      header: "Estado",
      accessor: "status",
      render: (value, row) => {
        const config = statusConfig[value] || { className: "bg-gray-100 text-gray-800", label: value };
        return (
          <div className="flex items-center gap-2">
            <Badge className={`font-medium shadow-none ${config.className}`}>{config.label}</Badge>
            {row.status === "DONE" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="h-7 w-7 text-slate-500 hover:text-slate-900"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDiscardTarget(row);
                      setDiscardDescription("");
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Descartar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      },
    },
  ];

  const formattedProductions =
    productions?.map((production, index) => ({
      ...production,
      row_number: index + 1,
    })) || [];

  return (
    <>
      <DataTable
        columns={columns}
        data={formattedProductions}
        onRowClick={handleRowClick}
        emptyMessage="No hay cocciones en el historial."
      />

      {/* CONFIRMACIÓN DESCARTE */}
      {discardTarget && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in"
          onClick={() => setDiscardTarget(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 p-6 rounded-lg max-w-sm w-full space-y-4 shadow-xl border border-slate-200 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" /> ¿Descartar Orden?
            </h3>
            <p className="text-sm text-slate-500">
              La orden Nro {discardTarget.row_number} ({discardTarget.item_name}) pasará a estado
              DISCARDED y el lote producido se descontará del inventario. Los insumos
              consumidos no se reponen.
            </p>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Motivo del descarte
              </label>
              <Textarea
                value={discardDescription}
                onChange={(e) => setDiscardDescription(e.target.value)}
                placeholder="Breve descripción del motivo..."
                className="min-h-[70px] text-xs py-1.5 px-3 leading-normal resize-none"
                maxLength={255}
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setDiscardTarget(null)} disabled={discardSubmitting}>
                Volver
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={executeDiscard}
                disabled={discardSubmitting}
              >
                {discardSubmitting ? "Descartando..." : "Confirmar descarte"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductionHistoryTable;
