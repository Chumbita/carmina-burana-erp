import { changePasswordPayloadSchema } from "../schemas/changePasswordPayload.schema";

export const buildChangePasswordPayload = (currentPassword, newPassword) => {
  const payload = {
    current_password: currentPassword,
    new_password: newPassword,
  };

  changePasswordPayloadSchema.parse(payload);
  return payload;
};
