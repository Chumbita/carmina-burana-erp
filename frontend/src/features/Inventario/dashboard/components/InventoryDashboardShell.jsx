import { Link } from "react-router-dom"

import { Button } from "@/components/ui/Button"

/**
 * Layout del dashboard: título, descripción y accesos rápidos.
 */
export function InventoryDashboardShell({ title, children }) {
  return (
    <div className="space-y-4 overflow-x-hidden">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">{title}</h1>
          <p className="text-sm text-muted-foreground">
            Lectura operativa desde un endpoint analítico: stock, vencimientos e ingresos recientes.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link to="/inventario/insumos">Ver insumos</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/inventario/ingreso-insumos">Registrar ingreso</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  )
}
