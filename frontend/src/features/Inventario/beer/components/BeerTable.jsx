import { DataTable } from "@/components/shared/DataTable";

export function BeerTable({ beer }) {
const tableHeaders = [
  { header: "Nro", accessor: "id" },
  { header: "Nombre", accessor: "name" },
  { header: "Estilo", accessor: "style" },
  { 
    header: "ABV", 
    accessor: "abv", 
    render: (value) => `${value}%` 
  },
  { 
    header: "IBU", 
    accessor: "ibu",
    render: (value) => `${value}%`
  },
  { 
    header: "Fermentación", 
    accessor: "fermentation_days", 
    render: (value) => `${value} días`
  },
  { 
    header: "Acondicionamiento", 
    accessor: "conditioning_days", 
    render: (value) => `${value} días` 
  },
  { header: "Stock mínimo", accessor: "min_stock_level" },
];


  return <DataTable columns={tableHeaders} data={beer} />;
}
