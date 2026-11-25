import { Avatar, AvatarFallback } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Field, FieldLabel } from "@/components/ui/Field";

const getInitials = (fullName = "") =>
  fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

/**
 * UserProfileForm - Presentación de los datos de la cuenta autenticada.
 * Componente de presentación puro: recibe el usuario, no consulta servicios.
 */
export default function UserProfileForm({ user }) {
  if (!user) {
    return (
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Mi cuenta</CardTitle>
          <CardDescription>No hay datos de usuario disponibles.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="max-w-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 rounded-lg">
            <AvatarFallback className="rounded-lg">
              {getInitials(user.full_name)}
            </AvatarFallback>
          </Avatar>
          <div className="grid gap-1">
            <CardTitle>{user.full_name}</CardTitle>
            <CardDescription>@{user.username}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Field>
          <FieldLabel>Nombre completo</FieldLabel>
          <p className="text-sm">{user.full_name}</p>
        </Field>
        <Field>
          <FieldLabel>Nombre de usuario</FieldLabel>
          <p className="text-sm">{user.username}</p>
        </Field>
        <Field>
          <FieldLabel>Rol</FieldLabel>
          <Badge variant="secondary" className="w-fit">
            {user.role}
          </Badge>
        </Field>
      </CardContent>
    </Card>
  );
}
