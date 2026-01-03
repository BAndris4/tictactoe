import { useEffect, useState, useCallback } from "react";
import type { UserProfile } from "../data/mockProfile";
import { authApi } from "../api/auth";
import { getAuthToken as getClientToken } from "../api/client";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const data = await authApi.getMe();

      if (data) {
        const mappedUser: UserProfile = {
          ...data,
          firstName: data.first_name,
          lastName: data.last_name,
          phoneNumber: data.phone_number,
          country: data.country,
          history: data.history || [],
        };
        setUser(mappedUser);
        setError(null);
      } else {
        setUser(null);
      }
    } catch (err) {
      // console.error(err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
    } finally {
      setUser(null);
    }
  };

  return { user, loading, error, logout, setUser, refetch: fetchUser };
}

export const getAuthToken = getClientToken;
