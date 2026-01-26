import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

import { MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"
import { Separator } from "@/components/ui/Separator"


// manejo provisorio de estado (critico, bajo , optimo)
const estadoStyles = {
  optimo: "bg-green-100 text-green-800",
  bajo: "bg-yellow-100 text-yellow-800",
  critico: "bg-red-100 text-red-800",
}

export function InsumosTable({ insumos, onDelete }) {
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
            <TableHead className="font-bold text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>


        <TableBody>
          {insumos.map((insumo) => (
            <TableRow key={insumo.id} className="h-10">
              <TableCell className=" font-medium max-w-60 truncate">
                <Link
                  to={`/inventario/insumos/${insumo.id}`}
                  className="hover:underline"
                >
                  {insumo.nombre}
                </Link>
              </TableCell>

              <TableCell className="hidden md:table-cell">{insumo.marca}</TableCell>
              <TableCell className="hidden lg:table-cell">{insumo.categoria}</TableCell>
              <TableCell className="whitespace-nowrap">
                {insumo.stockTotal} {insumo.unidadMedida}
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={estadoStyles[insumo.estadoStock]}
                >
                  {insumo.estadoStock}
                </Badge>
              </TableCell>

              {/* ACCIONES */}
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/inventario/insumos/${insumo.id}`}>
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    
                

                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDelete?.(insumo.id)}
                    >
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
