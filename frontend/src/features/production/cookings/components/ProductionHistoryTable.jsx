import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/shared/DataTable";
import { useNavigate } from "react-router-dom";

const statusConfig = {
  PLANNED: { className: "bg-slate-100 text-slate-800 border-slate-200", label: "Planeada" },
  DONE: { className: "bg-emerald-50 text-emerald-700 border-emerald-200", label: "Completada" },
  CANCELLED: { className: "bg-red-50 text-red-700 border-red-200", label: "Cancelada" },
  DISCARDED: { className: "bg-slate-100 text-slate-500 border-slate-200", label: "Descartada" },
};

export function ProductionHistoryTable({ productions }) {
  const navigate = useNavigate();

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
    { header: "Fecha programada", accessor: "schedule_date", render: (value) => (value ? value : "Sin fecha") },
    {
      header: "Estado",
      accessor: "status",
      render: (value) => {
        const config = statusConfig[value] || { className: "bg-gray-100 text-gray-800", label: value };
        return <Badge className={`font-medium shadow-none ${config.className}`}>{config.label}</Badge>;
      },
    },
  ];

  const formattedProductions =
    productions?.map((production, index) => ({
      ...production,
      row_number: index + 1,
    })) || [];

  return (
    <DataTable
      columns={columns}
      data={formattedProductions}
      onRowClick={handleRowClick}
      emptyMessage="No hay cocciones en el historial."
    />
  );
}

export default ProductionHistoryTable;
