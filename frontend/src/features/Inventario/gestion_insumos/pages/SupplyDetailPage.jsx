import { PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

import { useParams } from "react-router-dom";
import { useSupply } from "../hooks/useSupply";
import { useSupplies } from "../hooks/useSupplies";

import { SupplyDetailTabs } from "../components/SupplyDetailTabs";
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage";
import { estadoStyles } from "../utils/stockStyles";

export default function SupplyDetailPage() {
  const { inputId } = useParams();
  const { supply, loading, error, updateSupply } = useSupply(inputId)
  const { supplies } = useSupplies();

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={supply?.name} />

      <EntityDetailPage.Sidebar icon={<PackageIcon className="h-10 w-10 text-gray-400" />}>
        <EntityDetailPage.Sidebar.Row
          label="Stock actual"
          value={`${supply?.stock_total ?? 0} ${supply?.base_uom_symbol ?? ""}`}
        />
        <EntityDetailPage.Sidebar.Row
          label="Estado"
          value={<Badge className={estadoStyles[supply?.estado_stock]}>{supply?.estado_stock}</Badge>}
        />
      </EntityDetailPage.Sidebar>

      <EntityDetailPage.Content>
        <SupplyDetailTabs
          supply={supply}
          onSupplyUpdated={updateSupply}
          availableInputs={supplies}
        />
      </EntityDetailPage.Content>
      <EntityDetailPage.History entityType="input" entityId={supply?.id} />
    </EntityDetailPage>
  );
}