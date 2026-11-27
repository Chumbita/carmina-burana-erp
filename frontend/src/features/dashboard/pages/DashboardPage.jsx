import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"

/**
 * Panel principal del ERP. Placeholder hasta que existan indicadores
 * agregados: solo presenta la estructura de la página.
 */
export default function DashboardPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-2xl font-semibold tracking-normal">Panel principal</h1>
        <p className="text-sm text-muted-foreground">Resumen general del ERP.</p>
      </header>

      <Card className="rounded-lg">
        <CardHeader>
          <CardTitle className="text-base">Sin indicadores todavía</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Este panel está pendiente de implementación. Usá el menú lateral para acceder a los
          módulos disponibles.
        </CardContent>
      </Card>
    </div>
  )
}
