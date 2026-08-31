// EntityDetailContext.jsx
import { createContext, useContext, useState, useCallback, useMemo } from "react";

const EntityDetailContext = createContext(null);

export function EntityDetailProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdated = useCallback(() => setRefreshKey((prev) => prev + 1), []);

  const value = useMemo(() => ({ refreshKey, handleUpdated }), [refreshKey, handleUpdated]);

  return (
    <EntityDetailContext.Provider value={value}>
      {children}
    </EntityDetailContext.Provider>
  );
}

export function useEntityDetail() {
  const context = useContext(EntityDetailContext);
  if (!context) throw new Error("useEntityDetail debe usarse dentro de EntityDetailPage");
  return context;
}

export function useEntityDetailOptional() {
  return useContext(EntityDetailContext);
}