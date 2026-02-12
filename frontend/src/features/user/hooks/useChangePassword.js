import { useState } from "react";
import { userService } from "../services/userService";
import { buildChangePasswordPayload } from "../dto/user.dto";

export function useChangePassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const changePassword = async (current_password, new_password) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    const payload = buildChangePasswordPayload(current_password, new_password);

    try {
      const response = await userService.changePassword(payload);
      setSuccess(true);
      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { changePassword, loading, error, success };
}
