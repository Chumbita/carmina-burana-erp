import { useState } from "react";
import { useForm } from "react-hook-form";
import { replace, useNavigate, useLocation } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../schemas/loginForm.schema";
import { authService } from "../services/authService";
import { useAuth } from "@/app/providers/AuthContext";

// Componentes de shadcn
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { isLoggedIn, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/dashboard";
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data) => {
    try {
      setError("");
      setLoading(true);

      const response = await authService.login(data.username, data.password);
      login(response.user, response.access_token);

      if (isLoggedIn) {
        navigate(from, { replace: true });
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full max-w-md" onSubmit={handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="username">Nombre de usuario</FieldLabel>
            <Input
              id="username"
              type="text"
              placeholder="carlosolari"
              {...register("username")}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              {...register("password")}
            />
          </Field>
          {error && (
            <FieldDescription className="text-sm text-red-500">
              {error}
            </FieldDescription>
          )}
          <Field>
            <Button
              type="submit"
              size="lg"
              className="cursor-pointer"
              variant={loading ? "outline" : ""}
              disabled={loading || !isValid}
            >
              {loading && <Spinner />}
              Iniciar sesión
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
}
