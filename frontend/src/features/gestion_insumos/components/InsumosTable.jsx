import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Link } from "react-router-dom"

export function InsumosTable({ insumos }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader >
          <TableRow>
            <TableHead className="font-bold">Nombre</TableHead>
            <TableHead className="font-bold">Categoría</TableHead>
            <TableHead className="font-bold">Stock total</TableHead>
            <TableHead className="font-bold">Unidad</TableHead>        
          </TableRow>
        </TableHeader>

        <TableBody>
          {insumos.map((insumo) => (
            <TableRow key={insumo.id}>
              <TableCell className="font-medium">
                <Link
                  to={`/inventario/insumos/${insumo.id}`}
                  className="hover:underline"
                >
                  {insumo.nombre}
                </Link>
              </TableCell>

              <TableCell>{insumo.categoria}</TableCell>
              <TableCell className=""> {insumo.stockTotal} </TableCell>
              <TableCell>{insumo.unidadMedida}</TableCell>
             
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
