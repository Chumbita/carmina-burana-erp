import { useNavigate } from "react-router-dom"
import { DataTable } from "../../../../components/shared/DataTable";
import { ArrowUpRight } from "lucide-react";

export function BomsTable({ boms }) {
  const navigate = useNavigate()

  const tableHeaders = [
    { header: "Nro", accessor: "id", render: (_value, _row, index) => index + 1 },
    {
      header: "Producto",
      accessor: "parent_item_name",
      render: (value, row) => (
        <span
          onClick={() => navigate(`/produccion/bom/${row.id}`)}
          className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer font-medium"
        >
          {value}
          <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={2} />
        </span>
      ),
    },
    { header: "Version", accessor: "version"},
    { header: "Componentes", accessor: "components_count"},
    { header: "Vigente desde", accessor: "valid_from", render: (value) => {
      const date = new Date(value)
      return date.toLocaleString("es-AR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
    }},
  ]

  return (
    <DataTable
      columns={tableHeaders}
      data={boms}
    />
  )
}
