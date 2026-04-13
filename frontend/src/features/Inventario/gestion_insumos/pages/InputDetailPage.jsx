//componentes shadcn
import { PackageIcon } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

//hooks
import { useParams } from "react-router-dom";
import { useInput } from "../hooks/useInput";
import { useInputs } from "../hooks/useInputs";

//Componentes
import { InputDetailTabs } from "../components/InputDetailTabs";
import { EntityDetailPage } from "@/components/shared/DetailPage/EntityDetailPage";
import { estadoStyles } from "../utils/stockStyles";

export default function InputDetailPage() {
  const { inputId } = useParams();
  const { input, loading, error } = useInput(inputId)
  const { inputs: availableInputs } = useInputs();

  return (
    <EntityDetailPage loading={loading} error={error}>
      <EntityDetailPage.Header name={input?.name} />

      <EntityDetailPage.Sidebar icon={<PackageIcon className="h-10 w-10 text-gray-400" />}>
        <EntityDetailPage.Sidebar.Row
          label="Stock actual"
          value={`${input?.stock_actual} ${input?.unit}`}
        />
        <EntityDetailPage.Sidebar.Row
          label="Estado"
          value={<Badge className={estadoStyles[input?.estado_stock]}>{input?.estado_stock}</Badge>}
        />
      </EntityDetailPage.Sidebar>

      <EntityDetailPage.Content>
        <InputDetailTabs
          insumo={input}
          availableInputs={availableInputs}
        />
      </EntityDetailPage.Content>
      <EntityDetailPage.History entityType="input" entityId={input?.id} />
    </EntityDetailPage>
  );
}