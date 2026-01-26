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

  const getEstadoVariant = (estado) => {
    switch (estado) {
      case "disponible":
        return "outline"
      case "vencido":
        return "destructive"
      case "agotado":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <div className="rounded-md border mt-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lote</TableHead>
            <TableHead className="text-right">Cant. inicial</TableHead>
            <TableHead className="text-right">Cant. actual</TableHead>
            <TableHead>Ingreso</TableHead>
            <TableHead>Vencimiento</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead className="text-right">Costo total</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {lotes.map((lote) => (
            <TableRow key={lote.id}>
              <TableCell className="font-medium">
                {lote.numeroLote ?? lote.id}
              </TableCell>

              <TableCell className="text-right">
                {lote.cantidadInicial}
              </TableCell>

              <TableCell className="text-right">
                {lote.cantidadDisponible}
              </TableCell>

              <TableCell>
                {formatDate(lote.fechaIngreso)}
              </TableCell>

              <TableCell>
                {formatDate(lote.fechaVencimiento)}
              </TableCell>

              <TableCell>
                {lote.proveedor ?? "-"}
              </TableCell>

              <TableCell className="text-right">
                {formatCurrency(lote.costoTotal)}
              </TableCell>

              <TableCell>
                <Badge variant={getEstadoVariant(lote.estado)}>
                  {lote.estado}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
