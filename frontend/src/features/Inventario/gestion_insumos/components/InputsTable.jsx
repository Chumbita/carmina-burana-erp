import { DataTable } from "../../../../components/shared/DataTable";
import { Badge } from "@/components/ui/Badge";
import { estadoStyles } from "../utils/stockStyles";
import { useNavigate } from "react-router-dom";

export function InputsTable({ insumos }) {
  const navigate = useNavigate();

  const handleRowClick = (insumo) => {
    navigate(`/inventario/insumos/${insumo.id}`);
  };

  const tableHeaders = [
    { header: "Nro", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    { header: "Marca", accessor: "brand" },
    { header: "Categoria", accessor: "category" },
    { header: "Stock", accessor: "stockTotal" },
    {
      header: "Estado",
      accessor: "estadoStock",
      render: (value) => (
        <Badge variant="outline" className={estadoStyles[value]}>
          {value}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable 
      columns={tableHeaders} 
      data={insumos} 
      onRowClick={handleRowClick}
    />
  );
}
