import { useState, useEffect, useCallback } from "react";
import { productionService } from "../services/productionService";

export function useProductions() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProductions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionService.getIncomplete();
      setProductions(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProductions();
  }, [fetchProductions]);

  async function planProduction(data) {
    setActionLoading(true);
    try {
      const created = await productionService.plan(data);
      await fetchProductions();
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function executeProduction(orderId, data) {
    setActionLoading(true);
    try {
      const updated = await productionService.execute(orderId, data);
      await fetchProductions();
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
    planProduction,
    executeProduction,
    refetch: fetchProductions,
  };
}
