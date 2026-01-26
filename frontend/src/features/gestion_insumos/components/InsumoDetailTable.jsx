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

function getStockClass(stockTotal, stockMinimo) {
  if (stockTotal <= stockMinimo) return "bg-red-200 rounded-full text-red-600"
  if (stockTotal <= stockMinimo * 1.5) return "bg-yellow-200 rounded-full text-yellow-800"
  return "bg-green-200 rounded-full text-green-700"
}

export function InsumoDetailTable({ insumo }) {
  const [expandedId, setExpandedId] = useState(null)
  const { unidadMedida, insumos } = insumo

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nombre</TableHead>
          <TableHead>Marca</TableHead>
          <TableHead>Cantidad disponible</TableHead>
          <TableHead>Lotes</TableHead>
        </TableRow>
      </TableHeader>

      <TableBody className="text-black">
        {insumos.map((insumoEspecifico) => (
          <>
            <TableRow
              key={insumoEspecifico.id}
              className="cursor-pointer"
              onClick={() => toggleExpand(insumoEspecifico.id)}
            >
              <TableCell className="font-medium">
                {insumoEspecifico.nombre}
              </TableCell>

              <TableCell>{insumoEspecifico.marca ?? "-"}</TableCell>

              <TableCell>
               
               <span   className={cn(
                  "font-medium p-1 px-3 ", 
                  getStockClass(
                    insumoEspecifico.stockTotal, 
                    insumoEspecifico.stockMinimo
                  )
                )}>
                 
                  {insumoEspecifico.stockTotal} {unidadMedida} 
                  </span> 
              </TableCell>

              <TableCell className="text-md ">
               <span className="flex flex-row gap-1 items-center">
                {insumoEspecifico.lotesActivos} lotes<ChevronDown size={14} />
               </span> 
              </TableCell>
            </TableRow>

            {expandedId === insumoEspecifico.id && (
              <TableRow>
                <TableCell colSpan={4}>
                  <LotesTable lotes={insumoEspecifico.lotes} />
                </TableCell>
              </TableRow>
            )}
          </>
        ))}
      </TableBody>
    </Table>
  )
}
