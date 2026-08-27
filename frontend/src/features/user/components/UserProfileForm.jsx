import { useMemo, useState } from "react";
import { Check, ChevronRight, Mail, Pencil, Shield } from "lucide-react";

import { useAuth } from "@/app/providers/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { userService } from "../services/userService";
import { UpdateProfileSchema } from "../schemas/updateProfile.schema";

const roleLabels = {
  admin: "Administrador",
  host: "Host",
};

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U"
  );
}

function ProfileRow({ icon: Icon, label, value, children, onClick }) {
  const RowIcon = Icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className="flex h-[68px] w-full items-center border-b px-6 text-left last:border-b-0 hover:bg-neutral-50 disabled:pointer-events-none disabled:opacity-100"
    >
      <span className="flex size-9 items-center justify-center rounded-md bg-neutral-100">
        <RowIcon className="size-[18px] text-neutral-500" />
      </span>
      <span className="ml-3 flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="text-xs text-neutral-500">{label}</span>
        {children || (
          <span className="truncate text-sm text-neutral-950">{value || "-"}</span>
        )}
      </span>
      {onClick && <ChevronRight className="size-4 text-neutral-500" />}
    </button>
  );
}

export default function UserProfileForm({ user }) {
  const { updateAuthUser } = useAuth();
  const email = user?.email || "";
  const [editingEmail, setEditingEmail] = useState(false);
  const [emailDraft, setEmailDraft] = useState(email);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const roleLabel = roleLabels[user?.role] || user?.role || "-";
  const initials = useMemo(() => getInitials(user?.full_name), [user?.full_name]);

  const cancelEmailEdit = () => {
    setEmailDraft(email);
    setError("");
    setEditingEmail(false);
  };

  const saveEmail = async () => {
    const parsed = UpdateProfileSchema.safeParse({ email: emailDraft });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "El correo electrónico no es válido.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const response = await userService.updateProfile(parsed.data);
      updateAuthUser(response.user);
      setEditingEmail(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-4 overflow-hidden rounded-md border bg-white">
      <header className="flex h-[104px] items-center bg-neutral-100 px-6">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-xl font-medium text-neutral-50">
          {initials}
        </div>
        <div className="ml-4 min-w-0">
          <h2 className="truncate text-lg font-semibold text-neutral-950">
            {user?.full_name || "-"}
          </h2>
          <p className="text-sm text-neutral-500">{roleLabel}</p>
        </div>
      </header>

      <ProfileRow
        icon={Mail}
        label="Correo electrónico"
        value={email}
        onClick={() => {
          setEmailDraft(email);
          setError("");
          setEditingEmail(true);
        }}
      />
      <ProfileRow icon={Shield} label="Rol">
        <span className="text-sm text-neutral-950">
          {roleLabel}
        </span>
      </ProfileRow>

      {editingEmail && (
        <div className="border-t bg-white">
          <div className="flex h-[68px] items-center border-b px-6">
            <span className="flex size-9 items-center justify-center rounded-md bg-neutral-100">
              <Mail className="size-[18px] text-neutral-500" />
            </span>
            <span className="ml-3 text-sm font-medium text-neutral-950">
              Correo electrónico
            </span>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div>
              <p className="mb-1 text-xs text-neutral-500">Correo actual</p>
              <div className="flex h-11 items-center gap-2 rounded-md bg-neutral-100 px-3 text-sm">
                <span className="truncate text-neutral-950">{email || "-"}</span>
              </div>
            </div>

            <div>
              <label htmlFor="profile-email" className="mb-1 block text-xs text-neutral-500">
                Nuevo correo electrónico
              </label>
              <div className="relative">
                <Pencil className="pointer-events-none absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-neutral-500" />
                <Input
                  id="profile-email"
                  type="email"
                  value={emailDraft}
                  onChange={(event) => setEmailDraft(event.target.value)}
                  className="h-10 border pl-9"
                  placeholder="nuevo@email.com"
                  aria-invalid={Boolean(error)}
                />
              </div>
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <div className="flex h-[68px] items-center justify-end gap-3 border-t px-6">
            <Button type="button" variant="outline" onClick={cancelEmailEdit} disabled={loading}>
              Cancelar
            </Button>
            <Button type="button" onClick={saveEmail} disabled={loading}>
              {loading ? <Spinner /> : <Check className="size-4" />}
              Guardar cambios
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
