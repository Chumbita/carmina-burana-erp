import { useState } from "react";
import { productionService } from "../services/productionService";

export function useProductions() {
  const [productions, setProductions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function createProduction(data) {
    setLoading(true);
    try {
      const created = await productionService.create(data);
      setProductions((prev) => [created, ...prev]);
      return created;
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
  };
}

export default useProductions;
