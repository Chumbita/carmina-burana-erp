import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/shared/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import { useNavigate } from "react-router-dom";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { DiscardProductionModal } from "./DiscardProductionModal";
import { formatDateTime } from "@/lib/utils/formatters";

const statusConfig = {
  PLANNED: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Planeada" },
  DONE: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completada" },
  CANCELLED: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelada" },
  DISCARDED: { className: "bg-slate-100 text-slate-500 border-slate-200", label: "Descartada" },
};

export function ProductionHistoryTable({ productions, hasRecords, onDiscard }) {
  const navigate = useNavigate();

  // Orden seleccionada para la confirmación de descarte
  const [discardRow, setDiscardRow] = useState(null);

  const handleRowClick = (row) => {
    navigate(`/produccion/cocciones/${row.id}`);
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
    { header: "Fecha programada", accessor: "schedule_date", render: (value) => {
      if (!value) return "Sin fecha";
      const [datePart] = String(value).split("T");
      const [y, m, d] = datePart.split("-");
      return y && m && d ? `${d}/${m}/${y}` : datePart;
    } },
    { header: "Fecha completada", accessor: "completed_at", render: (value) => formatDateTime(value) },
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
                      setDiscardRow(row);
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
        hasRecords={hasRecords}
        onRowClick={handleRowClick}
        emptyMessage="No hay cocciones en el historial"
        noResultsMessage="No se encontraron cocciones con los filtros aplicados"
      />

      <DiscardProductionModal
        open={!!discardRow}
        order={discardRow}
        onDiscard={onDiscard}
        onClose={() => setDiscardRow(null)}
      />
    </>
  );
}

export default ProductionHistoryTable;
