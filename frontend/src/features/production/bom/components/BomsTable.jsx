import { useNavigate } from "react-router-dom"
import { DataTable } from "../../../../components/shared/DataTable";

export function BomsTable({ boms }) {
  const navigate = useNavigate()

  const handleRowClick = (row) => {
    navigate(`/produccion/bom/${row.id}`)
  }

  const tableHeaders = [
    { header: "Nro", accessor: "id", render: (_value, _row, index) => index + 1 },
    {
      header: "Producto",
      accessor: "parent_item_name",
      render: (value) => (
        <span className="font-medium text-primary">{value}</span>
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
      onRowClick={handleRowClick}
    />
  )
}
