import { Badge } from "@/components/ui/Badge";
import { DataTable } from "@/components/shared/DataTable";

const statusStyles = {
  Programada: "bg-slate-100 text-slate-700",
  "En proceso": "bg-amber-100 text-amber-700",
  Finalizada: "bg-emerald-100 text-emerald-700",
};

export function CookingsTable({ cookings }) {
  const tableHeaders = [
    { header: "Nro", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    { header: "Receta", accessor: "recipe" },
    { header: "Lote", accessor: "batch" },
    {
      header: "Estado",
      accessor: "status",
      render: (value) => (
        <Badge
          variant="outline"
          className={statusStyles[value] ?? "bg-gray-100 text-gray-700"}
        >
          {value}
        </Badge>
      ),
    },
    { header: "Fecha", accessor: "date" },
  ];

  return <DataTable columns={tableHeaders} data={cookings} />;
}
