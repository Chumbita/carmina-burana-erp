import { useState, useEffect } from "react";
import { itemService } from "../services/itemService";

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await itemService.getOptions();
        setItems(data);
      } catch (err) {
        console.log('[useItems] Error fetching items:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [])

  return { items, loading, error }
}
