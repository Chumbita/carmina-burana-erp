import { z } from "zod";

export const ChangePasswordSchema = z.object({
    currentPassword: z.string(1, "Debe ingresar la contraseña actual."),
    newPassword: z.string()
        .min(6, "Debe tener al menos 6")
        .regex(/[0-9]/, "Debe contener al menos un número.")
        .regex(/[a-z]/, "Debe contener al menos una letra minúscula.")
        .regex(/[!$@%]/, "Debe contener al menos un caracter especíal (!, $, @, %)"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
})