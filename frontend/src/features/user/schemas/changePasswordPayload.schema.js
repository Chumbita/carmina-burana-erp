import { z } from 'zod';

export const changePasswordPayloadSchema = z.object({
    current_password: z.string().min(1, "El campo 'current_password' es obligatorio y no puede estar vacío."),
    new_password: z.string().min(1, "El campo 'new_password' es obligatorio y no puede estar vacío.")
})