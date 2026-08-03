import { useState, useEffect, useCallback } from "react";
import { productionService } from "../services/productionService";

export function useProductions() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);       // solo carga inicial / refetch de listado
  const [actionLoading, setActionLoading] = useState(false); // start/release/complete/create
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

  async function createProduction(data) {
    setActionLoading(true);
    try {
      const created = await productionService.create(data);
      await fetchProductions(); // este SÍ togglea `loading`, está bien porque no hay modal abierto acá
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function releaseProduction(id) {
    setActionLoading(true);
    try {
      const updated = await productionService.release(id);
      await fetchProductions();
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function startProduction(id) {
    setActionLoading(true);
    try {
      const updated = await productionService.start(id);
      await fetchProductions();
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }

  async function completeProduction(id, data) {
    setActionLoading(true);
    try {
      const updated = await productionService.complete(id, data);
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
    createProduction,
    releaseProduction,
    startProduction,
    completeProduction,
    refetch: fetchProductions,
  };
}