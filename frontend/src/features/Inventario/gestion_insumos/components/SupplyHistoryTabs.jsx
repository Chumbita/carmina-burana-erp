import { AuditLogHistory } from "@/components/shared/AuditLogHistory"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"

import { TransactionsTable } from "./TransactionsTable"

/**
 * Historial compartido por los detalles de insumo y envase:
 * movimientos de stock + registro de actividad.
 */
export function SupplyHistoryTabs({ itemId, refreshKey, entityType = "supply" }) {
  return (
    <Tabs defaultValue="stock">
      <TabsList variant="line">
        <TabsTrigger value="stock" className="cursor-pointer">
          Movimientos
        </TabsTrigger>
        <TabsTrigger value="audit" className="cursor-pointer">
          Registro de actividad
        </TabsTrigger>
      </TabsList>
      <TabsContent value="stock">
        <TransactionsTable itemId={itemId} refreshKey={refreshKey} />
      </TabsContent>
      <TabsContent value="audit">
        <AuditLogHistory entityType={entityType} entityId={itemId} refreshKey={refreshKey} />
      </TabsContent>
    </Tabs>
  )
}
