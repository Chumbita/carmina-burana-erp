import { useState } from "react";

export const USER_SETTINGS_TABS = [
  { value: "my-account", label: "Mi cuenta" },
  { value: "change-password", label: "Cambiar contraseña" },
];

const DEFAULT_TAB = USER_SETTINGS_TABS[0].value;

/**
 * useUserSettingsTabs - Estado de la pestaña activa de la configuración
 * de usuario y su definición declarativa.
 */
export function useUserSettingsTabs(defaultTab = DEFAULT_TAB) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  return {
    activeTab,
    setActiveTab,
    tabs: USER_SETTINGS_TABS,
  };
}
