import { DataTable } from "@/components/shared/DataTable";

export function BeerTable({ beer }) {
  const tableHeaders = [
    { header: "Nro", accessor: "id" },
    { header: "Nombre", accessor: "name" },
    { header: "Estilo", accessor: "style" },
    { header: "ABV", accessor: "abv" },
    { header: "IBU", accessor: "ibu" },
    { header: "Fermentación", accessor: "fermentation_days" },
    { header: "Acondicionamiento", accessor: "conditioning_days" },
    { header: "Stock mínimo", accessor: "min_stock_level" },
  ];

  return <DataTable columns={tableHeaders} data={beer} />;
}
