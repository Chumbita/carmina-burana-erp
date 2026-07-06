import { useEffect, useState } from "react";

// Temporal: devuelve datos mock mientras no exista endpoint de productos
export function useItems() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    function loadMock() {
      try {
        const data = [{ id: 1, name: "Producto mock #1" }];
        if (mounted) setItems(data);
      } catch (err) {
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMock();
    return () => (mounted = false);
  }, []);

  return { items, loading, error };
}

export default useItems;
