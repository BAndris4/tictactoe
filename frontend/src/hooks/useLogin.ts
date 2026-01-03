import { useState } from "react";
import { authApi } from "../api/auth";

export function useLogin(onSuccess?: () => void) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [keepSigned, setKeepSigned] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authApi.login(username, password, keepSigned);
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (err) {
      setError("Login failed. Please check your credentials.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    keepSigned,
    setKeepSigned,
    login,
    loading,
    error,
  };
}
