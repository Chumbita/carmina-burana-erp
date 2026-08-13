import { PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { formatDecimal } from "@/lib/utils/formatters";

import { useParams } from "react-router-dom";
import { useSupply } from "../hooks/useSupply";
import { useSupplies } from "../hooks/useSupplies";

import { SupplyDetailTabs } from "../components/SupplyDetailTabs";
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage";
import { estadoStyles } from "../utils/stockStyles";

export default function SupplyDetailPage() {
  const { supplyId } = useParams();
  const { supply, loading, error } = useSupply(supplyId);
  const { supplies } = useSupplies();

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={supply?.name} />

      <EntityDetailPage.Sidebar icon={<PackageIcon className="h-10 w-10 text-gray-400" />}>
        <EntityDetailPage.Sidebar.Row label="Tipo" value="Producción" />
        <EntityDetailPage.Sidebar.Row
          label="Stock actual"
          value={`${formatDecimal(supply?.stock_total)} ${supply?.base_uom_symbol ?? ""}`}
        />
        <EntityDetailPage.Sidebar.Row
          label="Estado"
          value={<Badge className={estadoStyles[supply?.estado_stock]}>{supply?.estado_stock}</Badge>}
        />
      </EntityDetailPage.Sidebar>

      <EntityDetailPage.Content>
        <SupplyDetailTabs insumo={supply} base_uom_symbol={supply?.base_uom_symbol} availableSupplies={supplies} />
      </EntityDetailPage.Content>
      <EntityDetailPage.History itemId={supply?.id} entityType="supply" />
    </EntityDetailPage>
  );
}
