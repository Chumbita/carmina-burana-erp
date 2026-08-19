import { useState, useEffect, useCallback } from "react";
import { productionService } from "../services/productionService";

export function useProductionHistory() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async ({ silent = false } = {}) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const data = await productionService.getHistory();
      setProductions(data);
    } catch (err) {
      setError(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  async function discardProduction(orderId, data) {
    setActionLoading(true);
    try {
      const updated = await productionService.discard(orderId, data);
      setProductions((prev) =>
        prev.map((p) => (p.id === orderId ? { ...p, status: updated.status } : p))
      );
      await fetchHistory({ silent: true });
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  return {
    productions,
    loading,
    actionLoading,
    error,
    refetch: fetchHistory,
    discardProduction,
  };
}

export default useProductionHistory;
