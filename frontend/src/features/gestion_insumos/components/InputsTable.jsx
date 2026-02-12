import { MoreHorizontal } from "lucide-react"
import { Link } from "react-router-dom"
import { AlertIndicatorSuccess, AlertIndicatorDestructive } from "./Notifications"
import { useState } from "react"

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
import { Button } from "@/components/ui/Button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu"

import { useDeleteInsumo } from "../hooks/useDeleteInsumo"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog"


// manejo provisorio de estado (critico, bajo , optimo)
const estadoStyles = {
  optimo: "bg-green-100 text-green-800",
  bajo: "bg-yellow-100 text-yellow-800",
  critico: "bg-red-100 text-red-800",
}

export function InputsTable({ insumos, onDeleteSuccess }) {

  const [notification, setNotification] = useState(null)
  const [insumoToDelete, setInsumoToDelete] = useState(null)

  const { deleteInsumo, isDeleting } = useDeleteInsumo(
    () => {
      onDeleteSuccess(insumoToDelete)
      setNotification({
        type: 'success',
        message: 'Insumo eliminado exitosamente'
      })
    },
    () => {
      setNotification({
        type: 'error',
        message: 'No se pudo eliminar el insumo', 
      })
    }
  )

  const handleCloseNotification = () => {
    setNotification(null)
  }

  const handleConfirmDelete = async () => {

    if (insumoToDelete) {
      await deleteInsumo(insumoToDelete)
    }
  }

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
            <TableRow key={insumo.id} data-insumo-id={insumo.id} className="h-10">
              <TableCell className=" font-medium max-w-96">
                <Link
                  to={`/inventario/insumos/${insumo.id}`}
                  className="hover:underline"
                >
                  {insumo.name} {insumo.id}
                </Link>
              </TableCell>

              <TableCell className="hidden md:table-cell">{insumo.brand}</TableCell>
              <TableCell className="hidden lg:table-cell">{insumo.category}</TableCell>
              <TableCell className="whitespace-nowrap">
                {insumo.stock_total} {insumo.unit}
              </TableCell>

              <TableCell>
                <Badge
                  variant="outline"
                  className={estadoStyles[insumo.stock_status]}
                >
                  {insumo.stock_status}
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

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600"
                          onSelect={(e) => {
                            e.preventDefault()
                            
                            setInsumoToDelete(insumo.id)
                          }}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El insumo será eliminado permanentemente. Para borrar el insumo, primero debes eliminar todos los lotes asociados.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={isDeleting} className="cursor-pointer">Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={handleConfirmDelete} disabled={isDeleting} className="bg-red-600 text-white cursor-pointer hover:bg-red-700">
                            {isDeleting ? "Eliminando..." : "Eliminar"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* Notificaciones */}
      {notification?.type === 'success' && (
        <AlertIndicatorSuccess
          message={notification.message}
          onClose={handleCloseNotification}
          duration={6000}
        />
      )}
      {notification?.type === 'error' && (
        <AlertIndicatorDestructive
          message={notification.message}
          onClose={handleCloseNotification}
          duration={6000}
        />
      )}

    </div>
  )
}
