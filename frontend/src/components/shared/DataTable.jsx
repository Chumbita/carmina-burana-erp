import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";

export function DataTable({
  columns,
  data = [],
  onRowClick,
  emptyMessage = "No hay registros",
  noResultsMessage = "No se encontraron registros",
  hasRecords = data.length > 0,
}) {
  const message = hasRecords ? noResultsMessage : emptyMessage;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              key={column.accessor}
              className="font-bold"
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        {data.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={columns.length}
              className="h-24 text-center text-neutral-500"
            >
              {message}
            </TableCell>
          </TableRow>
        ) : data.map((row, rowIndex) => (
          <TableRow
            key={row.id}
            className={onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}
            onClick={() => onRowClick && onRowClick(row)}
          >
            {columns.map((column) => (
              <TableCell key={`${row.id}-${column.accessor}`}>
                {column.render
                  ? column.render(row[column.accessor], row, rowIndex)
                  : row[column.accessor]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
