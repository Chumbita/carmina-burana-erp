import { DataTable } from "../../../../components/shared/DataTable";
import { ArrowUpRight } from "lucide-react";

export function BomsTable({ boms }) {

  const tableHeaders = [
    { header: "Nro", accessor: "id", render: (_value, _row, index) => index + 1 },
    { header: "Producto", accessor: "parent_item_name"},
    { header: "Version", accessor: "version"},
    { header: "Componentes", accessor: "components_count"},
    { header: "Vigente desde", accessor: "valid_from"},
    { header: "Ver detalle", accessor: "id", render: () => (
      <span className="inline-flex items-center text-muted-foreground font-semibold border-b-2 cursor-pointer ">
        <ArrowUpRight className="h-4 w-4" strokeWidth={2.5} />
      </span>
    )},
  ]

  return (
    <DataTable
      columns={tableHeaders}
      data={boms}
    />
  )
}
