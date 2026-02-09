import { z } from "zod";

export const LoginSchema = z.object({
    username: z
        .string()
        .min(3, { message: "El nombre de usuario debe tener al menos 3 caracteres." })
        .max(20, { message: "El nombre de usuario no puede superar los 20 caracteres." }),
    password: z
        .string()
        .min(1, { message: "La contraseña debe tener al menos 1 caracteres." })
})