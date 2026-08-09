import { DataTable } from "@/components/shared/DataTable";
import { useNavigate } from "react-router-dom";
import { formatDecimal } from "@/lib/utils/formatters";

export function BeerTable({ beer }) {
  const navigate = useNavigate();

  const handleRowClick = (row) => {
    navigate(`/inventario/cervezas/${row.id}`);
  };

  const tableHeaders = [
    { header: "Nro", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    { header: "Estilo", accessor: "style" },
    { header: "ABV", accessor: "abv", render: (value) => formatDecimal(value) },
    { header: "IBU", accessor: "ibu", render: (value) => formatDecimal(value) },
    { header: "Fermentación", accessor: "fermentation_days" },
    { header: "Acondicionamiento", accessor: "conditioning_days" },
    { header: "Stock mínimo", accessor: "min_stock_level", render: (value) => formatDecimal(value) },
  ];

  return <DataTable columns={tableHeaders} data={beer} onRowClick={handleRowClick} />;
}
