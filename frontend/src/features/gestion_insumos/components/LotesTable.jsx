import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export function LotesTable({ lotes }) {
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("es-AR")

  const formatCurrency = (value) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(value)

  const diasRestantes = (fechaVencimiento) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)

    const diff = Math.ceil(
      (vencimiento - hoy) / (1000 * 60 * 60 * 24)
    )

    if (diff < 0) return { label: `${diff} días`, color: "bg-red-100 text-red-700" }
    if (diff <= 7) return { label: `${diff} días`, color: "bg-red-100 text-red-700" }
    if (diff <= 30) return { label: `${diff} días`, color: "bg-yellow-100 text-yellow-700" }

    return { label: `${diff} días`, color: "bg-green-100 text-green-700" }
  }



  return (
    <div className="rounded-md border mt-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nº Lote</TableHead>
            <TableHead>Ingreso</TableHead>
            <TableHead className="">Cantidad</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Dias restantes</TableHead>
            <TableHead className="text-right">Costo</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {lotes.map((lote) => (
            <TableRow key={lote.id}>
              <TableCell className="font-medium">
                {lote.numeroLote ?? lote.id}
              </TableCell>

              <TableCell>
                {formatDate(lote.fechaIngreso)}
              </TableCell>


              <TableCell className="">
                {lote.cantidadDisponible}
              </TableCell>

              <TableCell>
                {formatDate(lote.fechaVencimiento)}
              </TableCell>
              
              <TableCell>
                {(() => {
                  const { label, color } = diasRestantes(lote.fechaVencimiento)
                  return (
                    <span className={`px-2 py-1 rounded text-sm font-medium ${color}`}>
                      {label}
                    </span>
                  )
                })()}
              </TableCell>
              
              <TableCell className="text-right">
                {formatCurrency(lote.costoTotal)}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
