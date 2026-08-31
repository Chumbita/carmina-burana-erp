import { useState, useEffect, useCallback } from "react";
import { auditLogService } from "@/services/auditLogService";
import privateClient from "@/lib/api/privateClient";
import { ENDPOINTS } from "@/lib/api/endpoints";

const PAGE_SIZE = 10;

/**
 * Hook para obtener logs de auditoría de un BOM, enriquecidos con
 * nombres de usuario y transformación de datos para display.
 *
 * @param {number} parentItemId - ID del item padre (entity_id en audit_log)
 * @returns {object} auditLogs transformados, pagination, loading states
 */
export function useBomAuditLogs(parentItemId) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [userMap, setUserMap] = useState({});

  // Fetch user names for display (falls back to user_id if endpoint unavailable)
  useEffect(() => {
    privateClient
      .get("/user")
      .then((res) => {
        const users = Array.isArray(res.data) ? res.data : res.data?.data || [];
        const map = {};
        users.forEach((u) => {
          map[u.id] = u.name || u.email || `Usuario ${u.id}`;
        });
        setUserMap(map);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!parentItemId) return;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await auditLogService.getByEntity(
          "bom",
          parentItemId,
          page,
          PAGE_SIZE,
        );
        const logs = (data.data || []).map((log) => ({
          ...log,
          userName: userMap[log.user_id] || `Usuario #${log.user_id}`,
          oldVersion: log.old_data?.version ?? null,
          newVersion: log.new_data?.version ?? null,
          changedHeaderKeys: computeHeaderChanges(
            log.old_data,
            log.new_data,
            log.action,
          ),
          changedLines: computeLineChanges(log.old_data, log.new_data),
        }));
        setAuditLogs(logs);
        setTotalItems(data.pagination.total_items);
        setTotalPages(data.pagination.total_pages);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }

    load();
  }, [parentItemId, page, refreshKey]);

  const refetch = useCallback(() => {
    setPage(1);
    setRefreshKey((k) => k + 1);
  }, []);

  return {
    auditLogs,
    isLoading,
    error,
    page,
    pageSize: PAGE_SIZE,
    totalItems,
    totalPages,
    changePage: setPage,
    refetch,
  };
}

/**
 * Campos del header del BOM que se muestran en el diff (excluye versionado).
 */
const HEADER_KEYS = ["quantity", "uom_id", "uom_symbol"];

function computeHeaderChanges(oldData, newData, action) {
  if (action === "CREATED") return [];
  if (!oldData || !newData) return [];
  return HEADER_KEYS.filter((k) => oldData[k] !== newData[k]);
}

function computeLineChanges(oldData, newData) {
  const oldLines = oldData?.lines || [];
  const newLines = newData?.lines || [];

  const oldMap = new Map(oldLines.map((l) => [l.component_item_id, l]));
  const newMap = new Map(newLines.map((l) => [l.component_item_id, l]));

  const allIds = new Set([...oldMap.keys(), ...newMap.keys()]);
  const changes = [];

  for (const id of allIds) {
    const oldLine = oldMap.get(id);
    const newLine = newMap.get(id);

    if (oldLine && !newLine) {
      changes.push({
        component_item_id: id,
        component_name: oldLine.component_name || `Item #${id}`,
        type: "removed",
        oldQty: oldLine.quantity,
        newQty: null,
        oldUom: oldLine.uom_symbol,
        newUom: null,
      });
    } else if (!oldLine && newLine) {
      changes.push({
        component_item_id: id,
        component_name: newLine.component_name || `Item #${id}`,
        type: "added",
        oldQty: null,
        newQty: newLine.quantity,
        oldUom: null,
        newUom: newLine.uom_symbol,
      });
    } else if (oldLine && newLine) {
      const qtyChanged = oldLine.quantity !== newLine.quantity;
      const uomChanged = oldLine.uom_symbol !== newLine.uom_symbol;
      if (qtyChanged || uomChanged) {
        changes.push({
          component_item_id: id,
          component_name:
            newLine.component_name || oldLine.component_name || `Item #${id}`,
          type: "modified",
          oldQty: oldLine.quantity,
          newQty: newLine.quantity,
          oldUom: oldLine.uom_symbol,
          newUom: newLine.uom_symbol,
        });
      }
    }
  }

  return changes;
}
