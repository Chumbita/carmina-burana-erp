import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { ChevronDown } from "lucide-react"

import { LotesTable } from "./LotesTable"
import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/Label"
import { Input } from "@/components/ui/Input"

function getStockClass(stockTotal, stockMinimo) {
  if (stockTotal <= stockMinimo) return "bg-red-200 rounded-full text-red-600"
  if (stockTotal <= stockMinimo * 1.5) return "bg-yellow-200 rounded-full text-yellow-800"
  return "bg-green-200 rounded-full text-green-700"
}

export function InsumoDetailTable({ insumo }) {

  const { unidadMedida, insumos } = insumo

 

  return (
   <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="flex flex-col gap-2">
        <Label>Nombre</Label>
        <Input defaultValue={insumo.nombre} className="bg-neutral-100 border-none"/>
      </div>

      <div className="flex flex-col gap-2">
        <Label>Marca</Label>
        <Input defaultValue={insumo.marca} className="bg-neutral-100 border-none" />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Categoría</Label>
        <Input defaultValue={insumo.categoria} className="bg-neutral-100 border-none" />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Unidad de medida</Label>
        <Input defaultValue={insumo.unidadMedida} className="bg-neutral-100 border-none" />
      </div>

      <div className="flex flex-col gap-2">
        <Label>Stock mínimo</Label>
        <Input type="number" defaultValue={insumo.stockMinimo} className="bg-neutral-100 border-none " />
      </div>

</form>
  )
}
