import { Check } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/AlertDialog";

/**
 * ChangePasswordFeedback - Diálogos de error y éxito del cambio de contraseña.
 *
 * Envuelve el botón disparador (`children`) y renderiza el contenido del
 * diálogo según el estado de la mutación.
 */
export function ChangePasswordFeedback({
  error,
  success,
  onSuccess,
  children,
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{children}</AlertDialogTrigger>
      {error && (
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">
              No se pudo completar la acción
            </AlertDialogTitle>
            <AlertDialogDescription>{error}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="cursor-pointer">
              Cerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
      {success && (
        <AlertDialogContent>
          <AlertDialogHeader className="flex flex-col content-center">
            <AlertDialogMedia className="sm bg-emerald-100 text-emerald-700 self-center">
              <Check />
            </AlertDialogMedia>
            <AlertDialogTitle className="text-base text-center">
              Contraseña actualizada correctamente
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tu sesión se cerrará automáticamente por seguridad. Para
              continuar, deberás iniciar sesión nuevamente con tu nueva
              contraseña.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={onSuccess}
              className="cursor-pointer"
            >
              Aceptar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      )}
    </AlertDialog>
  );
}
