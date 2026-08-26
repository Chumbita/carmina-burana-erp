import { useState, useEffect } from "react";
import { itemService } from "@/features/Inventario/items/services/itemService";

export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await itemService.getOptions();
        if (mounted) setItems(data);
      } catch (err) {
        console.error("[useItems] Error fetching items:", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return { items, loading, error };
}

export function useManufacturableItems() {
  const [options, setOptions] = useState({ beerOptions: [], productOptions: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      try {
        const data = await itemService.getManufacturableItems();
        if (mounted) setOptions(data);
      } catch (err) {
        console.error("[useManufacturableItems] Error fetching items:", err);
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => (mounted = false);
  }, []);

  return { ...options, loading, error };
}
