// Shadcn components importation
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export function DataTable({ columns, data, onRowClick }) {
  console.log(data);
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead className="font-bold">{column.header}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row) => (
          <TableRow 
            key={row.id}
            className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column) => (
              <TableCell key={column.accessor}>
                {column.render
                  ? column.render(row[column.accessor], row)
                  : row[column.accessor]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
