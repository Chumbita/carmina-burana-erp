import { DataTable } from "../../../../components/shared/DataTable";

export function BomsTable({ boms }) {

  const tableHeaders = [
    { header: "Nro", accessor: "id"},
    { header: "Producto", accessor: "parent_item_name"},
    { header: "Version", accessor: "version"},
    { header: "Componentes", accessor: "components_count"},
    { header: "Vigente desde", accessor: "valid_from"},
  ]

  return (
    <DataTable
      columns={tableHeaders}
      data={boms}
    />
  )
}
