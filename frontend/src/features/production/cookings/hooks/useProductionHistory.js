import { useState, useEffect, useCallback } from "react";
import { productionService } from "../services/productionService";

export function useProductionHistory() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productionService.getHistory();
      setProductions(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return {
    productions,
    loading,
    error,
    refetch: fetchHistory,
  };
}

export default useProductionHistory;
