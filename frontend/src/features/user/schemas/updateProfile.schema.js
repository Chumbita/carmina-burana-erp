import { z } from "zod";

export const UpdateProfileSchema = z.object({
  email: z.string().trim().email("El correo electrónico no es válido."),
});
