import { useAuth } from "@/app/providers/AuthContext";

// Componentes
import UserProfileForm from "../components/UserProfileForm";
import ChangePasswordForm from "../components/ChangePasswordForm";

// Componentes de shadcn
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { useState } from "react";
import { User } from "lucide-react";

export default function UserSettingsPage() {
  const { authUser } = useAuth();
  const [contentOption, setContentOption] = useState("my-account");

  return (
    <div>
      <Tabs defaultValue="my-account" onValueChange={setContentOption}>
        <TabsList variant="line">
          <TabsTrigger value="my-account" className="cursor-pointer">Mi cuenta</TabsTrigger>
          <TabsTrigger value="change-password" className="cursor-pointer">Cambiar contraseña</TabsTrigger>
        </TabsList>

        {contentOption === "my-account" && <UserProfileForm />}
        {contentOption === "change-password" && <ChangePasswordForm />}
      </Tabs>
    </div>
  );
}
