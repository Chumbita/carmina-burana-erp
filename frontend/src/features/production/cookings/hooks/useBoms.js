import { useEffect, useState } from "react";

// Temporal: devuelve datos mock mientras no exista endpoint de recetas
export function useBoms() {
  const [boms, setBoms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    function loadMock() {
      try {
        const data = [{ id: 2, name: "Receta #2 (mock)" }];
        if (mounted) setBoms(data);
      } catch (err) {
        setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadMock();
    return () => (mounted = false);
  }, []);

  return { boms, loading, error };
}

export default useBoms;
