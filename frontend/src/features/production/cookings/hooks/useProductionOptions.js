import { useEffect, useState } from "react";
import { productionService } from "../services/productionService";

export function useProductionOptions() {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function loadOptions() {
      try {
        setLoading(true);
        const data = await productionService.getOptions();
        if (mounted) setOptions(data);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadOptions();

    return () => {
      mounted = false;
    };
  }, []);

  return { options, loading, error };
}

export default useProductionOptions;
