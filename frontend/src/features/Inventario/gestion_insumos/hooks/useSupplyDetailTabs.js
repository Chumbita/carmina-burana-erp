import { useState } from "react"

export const SUPPLY_DETAIL_TABS = {
  DETAIL: "insumos",
  LOTS: "lotes",
}

/**
 * Pestaña activa del panel de detalle de un insumo.
 */
export function useSupplyDetailTabs(initialTab = SUPPLY_DETAIL_TABS.DETAIL) {
  const [activeTab, setActiveTab] = useState(initialTab)

  return { activeTab, setActiveTab }
}
