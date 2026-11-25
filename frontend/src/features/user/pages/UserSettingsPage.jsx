import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useAuth } from "@/features/auth";

import UserProfileForm from "../components/UserProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";
import { useUserSettingsTabs } from "../hooks/useUserSettingsTabs";

/**
 * UserSettingsPage - Página de configuración de la cuenta.
 * Solo compone el layout: pestañas y paneles; la lógica vive en los hooks.
 */
export default function UserSettingsPage() {
  const { authUser } = useAuth();
  const { activeTab, setActiveTab, tabs } = useUserSettingsTabs();

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList variant="line">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className="cursor-pointer"
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {activeTab === "my-account" && <UserProfileForm user={authUser} />}
        {activeTab === "change-password" && <ChangePasswordForm />}
      </Tabs>
    </div>
  );
}
