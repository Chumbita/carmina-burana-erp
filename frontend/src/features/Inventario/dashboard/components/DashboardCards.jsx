import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

/**
 * Tarjeta contenedora de una gráfica con estado vacío.
 */
export function ChartCard({ title, empty, children }) {
  return (
    <Card className="rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="min-h-[280px]">
        {empty ? (
          <div className="flex h-[260px] items-center justify-center text-sm text-muted-foreground">
            Sin datos para graficar
          </div>
        ) : children}
      </CardContent>
    </Card>
  )
}

/**
 * Tarjeta contenedora de una tabla de datos.
 */
export function TableCard({ title, children }) {
  return (
    <Card className="overflow-hidden rounded-lg">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">{children}</CardContent>
    </Card>
  )
}
