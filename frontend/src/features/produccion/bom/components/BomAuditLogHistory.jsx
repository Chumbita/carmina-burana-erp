import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useBomAuditLogs } from "../hooks/useBomAuditLogs";
import { Badge } from "@/components/ui/Badge";
import { TablePagination } from "@/components/shared/TablePagination";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/Table";
import { formatDecimal } from "@/lib/utils/formatters";

const actionLabels = {
  CREATED: "Creado",
  UPDATED: "Modificación",
};

const actionStyles = {
  CREATED: "bg-green-100 text-green-800",
  UPDATED: "bg-blue-100 text-blue-800",
};

const HEADER_FIELD_LABELS = {
  quantity: "Cantidad",
  uom_id: "UOM",
  uom_symbol: "UOM",
};

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function SummaryBadge({ count, type }) {
  if (count === 0) return null;
  const label = type === "header" ? "campo" : "componente";
  return (
    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
      {count} {label}
      {count !== 1 ? "s" : ""}
    </span>
  );
}

function LineChangesTable({ changes }) {
  if (!changes || changes.length === 0) return null;

  return (
    <div className="mt-2 border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-xs font-medium">Componente</TableHead>
            <TableHead className="text-xs font-medium w-24 text-center">
              Antes
            </TableHead>
            <TableHead className="text-xs font-medium w-24 text-center">
              Después
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {changes.map((change) => (
            <TableRow key={change.component_item_id}>
              <TableCell className="py-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{change.component_name}</span>
                  {change.type === "added" && (
                    <Badge className="bg-green-100 text-green-800 text-[10px]">
                      + Agregado
                    </Badge>
                  )}
                  {change.type === "removed" && (
                    <Badge className="bg-red-100 text-red-800 text-[10px]">
                      - Eliminado
                    </Badge>
                  )}
                  {change.type === "modified" && (
                    <Badge className="bg-amber-100 text-amber-800 text-[10px]">
                      ~ Modificado
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="py-1.5 text-center">
                {change.oldQty != null ? (
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {formatDecimal(change.oldQty)} {change.oldUom}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
              <TableCell className="py-1.5 text-center">
                {change.newQty != null ? (
                  <span className="text-sm tabular-nums">
                    {formatDecimal(change.newQty)} {change.newUom}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function AuditLogRow({ log }) {
  const [expanded, setExpanded] = useState(false);
  const hasDetails =
    log.changedHeaderKeys.length > 0 || log.changedLines.length > 0;

  const versionText =
    log.action === "CREATED"
      ? `v${log.newVersion}`
      : log.oldVersion && log.newVersion
        ? `v${log.oldVersion} → v${log.newVersion}`
        : log.newVersion
          ? `v${log.newVersion}`
          : "—";

  return (
    <>
      <TableRow className={expanded ? "bg-muted/30" : ""}>
        <TableCell>
          <Badge className={actionStyles[log.action]}>
            {actionLabels[log.action] ?? log.action}
          </Badge>
        </TableCell>
        <TableCell className="font-medium tabular-nums">
          {versionText}
        </TableCell>
        <TableCell>
          <div className="flex flex-col gap-0.5">
            {log.changedHeaderKeys.map((k) => (
              <span key={k} className="text-xs text-muted-foreground">
                {HEADER_FIELD_LABELS[k] || k}
              </span>
            ))}
            {log.changedLines.length > 0 && (
              <SummaryBadge count={log.changedLines.length} type="line" />
            )}
            {log.changedHeaderKeys.length === 0 &&
              log.changedLines.length === 0 && (
                <span className="text-xs text-muted-foreground">—</span>
              )}
          </div>
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {log.userName}
        </TableCell>
        <TableCell className="text-sm text-muted-foreground">
          {formatDate(log.created_at)}
        </TableCell>
        <TableCell className="text-right">
          {hasDetails && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-sm  hover:underline cursor-pointer"
            >
              {expanded ? "Ocultar" : "Ver cambios"}
              {expanded ? (
                <ChevronDown className="size-3" />
              ) : (
                <ChevronRight className="size-3" />
              )}
            </button>
          )}
        </TableCell>
      </TableRow>
      {expanded && (
        <TableRow>
          <TableCell colSpan={6} className="p-0 px-4 pb-3">
            <div className="pt-1 space-y-2">
              {log.changedHeaderKeys.length > 0 && (
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Cambios en encabezado:</span>{" "}
                  {log.changedHeaderKeys
                    .map((k) => HEADER_FIELD_LABELS[k] || k)
                    .join(", ")}
                </div>
              )}
              <LineChangesTable changes={log.changedLines} />
            </div>
          </TableCell>
        </TableRow>
      )}
    </>
  );
}

export function BomAuditLogHistory({ parentItemId, refreshKey }) {
  const {
    auditLogs,
    isLoading,
    error,
    page,
    pageSize,
    totalItems,
    totalPages,
    changePage,
    refetch,
  } = useBomAuditLogs(parentItemId);

  const [manualRefresh, setManualRefresh] = useState(0);

  // React to external refreshKey changes
  if (refreshKey > 0 && refreshKey !== manualRefresh) {
    setManualRefresh(refreshKey);
    refetch();
  }

  if (isLoading && !auditLogs.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Cargando historial de actividad...
      </p>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Error al cargar el historial de actividad.
      </p>
    );
  }

  if (!auditLogs.length && !totalItems) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin registros de actividad para esta fórmula.
      </p>
    );
  }

  return (
    <div className={isLoading ? "space-y-4 opacity-60" : "space-y-4"}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Acción</TableHead>
            <TableHead className="font-bold">Versión</TableHead>
            <TableHead className="font-bold">Cambios</TableHead>
            <TableHead className="font-bold">Usuario</TableHead>
            <TableHead className="font-bold">Fecha</TableHead>
            <TableHead className="font-bold text-right">Detalle</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {auditLogs.map((log) => (
            <AuditLogRow key={log.id} log={log} />
          ))}
        </TableBody>
      </Table>

      <TablePagination
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onChangePage={changePage}
      />
    </div>
  );
}
