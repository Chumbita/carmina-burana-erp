import { useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Play, X } from "lucide-react";
import { formatDecimal } from "@/lib/utils/formatters"
import { ExecuteProductionModal } from "./ExecuteProductionModal";
import { CancelProductionModal } from "./CancelProductionModal";


function formatDateDMY(value) {
  if (!value) return "";
  const [datePart] = String(value).split("T");
  const [y, m, d] = datePart.split("-");
  return y && m && d ? `${d}/${m}/${y}` : datePart;
}

export function ProductionTable({ productions, hasRecords, onExecute, onCancel }) {
  const navigate = useNavigate();

  const schemaComplete = completeProductionSchema();
  const { 
    handleSubmit: handleCompleteSubmitForm, 
    control: completeControl, 
    setValue: setCompleteValue,
    reset: resetCompleteForm,
    formState: { errors: completeErrors, isSubmitting: isCompleting }
  } = useForm({
    resolver: zodResolver(schemaComplete),
    defaultValues: {
      produced_quantity: 1,
      lot_code: "",
      production_date: "",
      expiration_date: "",
      unit_cost: "",
    },
    mode: "onChange"
  });
  // Orden seleccionada para el modal de ejecutar (completar producción)
  const [completeRow, setCompleteRow] = useState(null);

  // Orden seleccionada para la confirmación de cancelación
  const [cancelRow, setCancelRow] = useState(null);

  const handleRowClick = (row) => {
    navigate(`/produccion/cocciones/${row.id}`);
  };

  const renderContextualButton = (row) => {
    switch (row.status) {
      case "PLANNED":
        return (
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              className="gap-1.5 text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                setCompleteRow(row);
              }}
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Ejecutar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive text-xs h-7"
              onClick={(e) => {
                e.stopPropagation();
                setCancelRow(row);
              }}
            >
              <X className="h-3.5 w-3.5" /> Cancelar
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  const columns = [
    { header: "Nro", accessor: "row_number" },
    { header: "Producto", accessor: "item_name" },
    { header: "Receta", accessor: "bom_version", render: (value) => `v${value}` },
    {
      header: "Cantidad",
      accessor: "planned_quantity",
      render: (value, row) => `${formatDecimal(value)} ${row.base_uom_symbol || ""}`
    },
    { header: "Fecha programada", accessor: "schedule_date", render: (value) => (value ? formatDateDMY(value) : "Sin fecha") },
    {
      header: "Estado",
      accessor: "status",
      render: (value) => {
        const statusConfig = {
          PLANNED: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Planeada" },
        };
        const config = statusConfig[value] || { className: "bg-gray-100 text-gray-800", label: value };
        return <Badge className={`font-medium shadow-none ${config.className}`}>{config.label}</Badge>;
      },
    },
    {
      header: "Acción",
      accessor: "actions",
      render: (_, row) => renderContextualButton(row)
    }
  ];

  const formattedProductions = productions?.map((production, index) => ({
    ...production,
    row_number: index + 1,
  })) || [];

  return (
    <>
      <DataTable
        columns={columns}
        data={formattedProductions}
        hasRecords={hasRecords}
        emptyMessage="No hay producciones planeadas"
        noResultsMessage="No se encontraron producciones con los filtros aplicados"
        onRowClick={handleRowClick}
      />

      <ExecuteProductionModal
        open={!!completeRow}
        order={completeRow}
        onExecute={onExecute}
        onClose={() => setCompleteRow(null)}
      />

      <CancelProductionModal
        open={!!cancelRow}
        order={cancelRow}
        onCancel={onCancel}
        onClose={() => setCancelRow(null)}
      />
    </>
  );
}

export default ProductionTable;
