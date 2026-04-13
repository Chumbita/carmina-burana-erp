// EntityDetailContext.jsx
import { createContext, useContext, useState } from "react";

const EntityDetailContext = createContext(null);

export function EntityDetailProvider({ children }) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUpdated = () => setRefreshKey(prev => prev + 1);

  return (
    <EntityDetailContext.Provider value={{ refreshKey, handleUpdated }}>
      {children}
    </EntityDetailContext.Provider>
  );
}

export function useEntityDetail() {
  const context = useContext(EntityDetailContext);
  if (!context) throw new Error("useEntityDetail debe usarse dentro de EntityDetailPage");
  return context;
}