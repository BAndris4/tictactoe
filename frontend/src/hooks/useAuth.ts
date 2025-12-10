import { useEffect, useState, useCallback } from "react";
import type { UserProfile } from "../data/mockProfile";

export function useAuth() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/users/me", {
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        const mappedUser: UserProfile = {
          ...data,
          firstName: data.first_name,
          lastName: data.last_name,
          phoneNumber: data.phone_number,
          history: data.history || [],
        };
        setUser(mappedUser);
        setError(null);
      } else if (res.status === 401 || res.status === 403) {
        setUser(null);
      } else {
        setError("Failed to fetch user profile");
      }
    } catch (err) {
      setError("Network error");
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
      await fetch("http://localhost:8000/api/users/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch {
    } finally {
      setUser(null);
    }
  };

  return { user, loading, error, logout, setUser, refetch: fetchUser };
}
