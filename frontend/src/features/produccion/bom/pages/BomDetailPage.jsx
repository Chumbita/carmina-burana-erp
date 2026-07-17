import { useParams } from "react-router-dom"
import { BoxesIcon } from "lucide-react"
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage"
import { DataTable } from "@/components/shared/DataTable"
import { useBom } from "../hooks/useBom"

export default function BomDetailPage() {
  const { bomId } = useParams()
  const { bom, loading, error } = useBom(bomId)

  const componentColumns = [
    { header: "Nro", accessor: "id", render: (_value, _row, index) => index + 1 },
    { header: "Insumo", accessor: "component_item_name" },
    {
      header: "Cantidad",
      accessor: "quantity",
      render: (value, row) => (
        <span className="font-medium">
          {parseFloat(value)} {row.uom_symbol}
        </span>
      ),
    },
  ]

  const validFromDate = bom?.valid_from
    ? new Date(bom.valid_from).toLocaleDateString("es-AR")
    : "-"

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={bom?.parent_item_name} />

      <EntityDetailPage.Sidebar
        icon={<BoxesIcon className="h-10 w-10 text-gray-400"/>}
      >
        <EntityDetailPage.Sidebar.Row
          label="Versión"
          value={bom?.version}
        />
        <EntityDetailPage.Sidebar.Row
          label="Cantidad"
          value={`${parseFloat(bom?.quantity || 0)} ${bom?.bom_uom_symbol}`}
        />
        <EntityDetailPage.Sidebar.Row
          label="Vigente desde"
          value={validFromDate}
        />
        {
          bom?.is_active === true
            ? ""
            : <EntityDetailPage.Sidebar.Row
              label="Vigente hasta"
              value={bom?.valid_to
                ? new Date(bom.valid_to).toLocaleDateString("es-AR")
                : "-"}
              />
        }
        <EntityDetailPage.Sidebar.Row
          label="Estado"
          value={bom?.is_active
            ? "Vigente"
            : "Descontinuado"
          }
        />
        <EntityDetailPage.Sidebar.Row
          label="Insumos"
          value={bom?.components_count}
        />
      </EntityDetailPage.Sidebar>

      <EntityDetailPage.Content>
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Lista de Insumos</h2>
          <DataTable columns={componentColumns} data={bom?.lines || []} />
        </div>
      </EntityDetailPage.Content>
    </EntityDetailPage>
  )
}
