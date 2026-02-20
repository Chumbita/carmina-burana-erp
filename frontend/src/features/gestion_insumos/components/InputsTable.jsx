import { Link } from "react-router-dom"

//componentes de shadcn
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table"

import { Badge } from "@/components/ui/Badge"


// manejo provisorio de estado (critico, bajo , optimo)
const estadoStyles = {
  optimo: "bg-green-100 text-green-800",
  bajo: "bg-yellow-100 text-yellow-800",
  critico: "bg-red-100 text-red-700",
}

export function InputsTable({ insumos }) {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow className="h-10">
            <TableHead className="font-bold">Nombre</TableHead>
            <TableHead className="font-bold hidden md:table-cell">Marca</TableHead>
            <TableHead className="font-bold hidden lg:table-cell">Categoría</TableHead>
            <TableHead className="font-bold">Stock</TableHead>
            <TableHead className="font-bold">Estado</TableHead>
          </TableRow>
        </TableHeader>


        <TableBody>
          {insumos.map((insumo) => (
            <TableRow key={insumo.id} data-insumo-id={insumo.id} className="h-10">
              <TableCell className=" font-medium max-w-96">
                <Link
                  to={`/inventario/insumos/${insumo.id}`}
                  className="hover:underline"
                >
                  {insumo.name} 
                </Link>
              </TableCell>

              <TableCell className="hidden md:table-cell">{insumo.brand}</TableCell>
              <TableCell className="hidden lg:table-cell">{insumo.category}</TableCell>
              <TableCell className="whitespace-nowrap">
                {insumo.stockTotal} {insumo.unit}
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={estadoStyles[insumo.estadoStock]}
                >
                  {insumo.estadoStock}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
