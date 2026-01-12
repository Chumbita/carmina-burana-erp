import { useState } from "react";
import { useForm } from "react-hook-form";
import { replace, useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema } from "../schemas/loginForm.schema";
import { authService } from "../services/authService";

// Componentes de shadcn
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data) => {
    try {
      setError("");
      setLoading(true);

      await authService.login(data.username, data.password);
      navigate("/dashboard", { replace: true });
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
