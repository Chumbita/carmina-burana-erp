import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useLocation } from "react-router-dom";
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/InputGroup";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";

// Iconos
import { EyeIcon, EyeOffIcon } from "lucide-react";

export function LoginForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
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

      // Login: el backend guarda las cookies HttpOnly automáticamente
      const response = await authService.login(data.username, data.password);

      // Almacenar solo los datos del usuario en memoria (no el token)
      login(response.user);

      // Navegar a la ruta original o al dashboard
      navigate(from, { replace: true });
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
            <InputGroup>
              <InputGroupInput
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
              />
              <InputGroupAddon align="inline-end">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none mr-2"
                >
                  {showPassword ? (
                    <EyeIcon size={17} />
                  ) : (
                    <EyeOffIcon size={17} />
                  )}
                </button>
              </InputGroupAddon>
            </InputGroup>
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
