import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs"

function DetailRow({ label, value }) {
  return (
    <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-[180px_1fr] sm:items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value ?? "-"}</span>
    </div>
  )
}

export function PackagingSupplyDetailTabs({ packagingSupply }) {
  const [contentOption, setContentOption] = useState("detalle")

  return (
    <div>
      <Tabs defaultValue="detalle" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="detalle" className="cursor-pointer">Detalle</TabsTrigger>
          <TabsTrigger value="lotes" className="cursor-pointer">Lotes</TabsTrigger>
        </TabsList>

        {contentOption === "detalle" && (
          <section className="mt-4 divide-y">
            <DetailRow label="Tipo de envase" value={packagingSupply?.packaging_type} />
            <DetailRow label="Material" value={packagingSupply?.material} />
            <DetailRow
              label="Capacidad"
              value={
                packagingSupply?.capacity_ml
                  ? `${packagingSupply.capacity_ml} ml`
                  : "-"
              }
            />
            <DetailRow label="Marca" value={packagingSupply?.brand} />
            <DetailRow label="Unidad de medida" value={packagingSupply?.base_uom_symbol} />
            <DetailRow label="Stock mínimo" value={packagingSupply?.min_stock_level} />
          </section>
        )}

        {contentOption === "lotes" && <p className="mt-4">Contenido de Lotes</p>}
      </Tabs>
    </div>
  )
}
