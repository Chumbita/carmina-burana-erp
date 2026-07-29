import { useState, useEffect, useCallback } from "react";
import { productionService } from "../services/productionService";

export function useProductions() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
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
    setLoading(true);
    try {
      const created = await productionService.create(data);
      await fetchProductions();
      return created;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function releaseProduction(id) {
    setLoading(true);
    try {
      const updated = await productionService.release(id);
      await fetchProductions();
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function startProduction(id) {
    setLoading(true);
    try {
      const updated = await productionService.start(id);
      await fetchProductions();
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function completeProduction(id, data) {
    setLoading(true);
    try {
      const updated = await productionService.complete(id, data);
      await fetchProductions();
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  return {
    productions,
    loading,
    error,
    createProduction,
    releaseProduction,
    startProduction,
    completeProduction,
    refetch: fetchProductions,
  };
}