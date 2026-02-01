import { API_URL, getHeaders } from "./client";
import type { RegisterFormValues } from "../rules/validation";
import { serializePhone } from "../utils";

export const authApi = {
  login: async (username: string, password: string, keepSigned: boolean) => {
    const response = await fetch(`${API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password, stay_logged_in: keepSigned }),
    });
    
    // We handle response manually here to check for access_token specifically
    if (response.ok) {
        const data = await response.json();
        return data; // Expected to contain access_token
    } else {
        throw new Error("Login failed");
    }
  },

  register: async (values: RegisterFormValues) => {
     const response = await fetch(`${API_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          username: values.username,
          email: values.email,
          password: values.password,
          first_name: values.firstName,
          last_name: values.lastName,
          phone_number: serializePhone(values.phone),
          play_tutorial: values.playTutorial,
          gender: values.gender,
          avatar_config: values.avatar_config
        }),
      });

      if (!response.ok) throw new Error("Registration failed");
      return response.json();
  },

  checkEmail: async (email: string): Promise<{ available: boolean }> => {
    const response = await fetch(`${API_URL}/users/check-email?email=${encodeURIComponent(email)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to check email availability");
    return response.json();
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    const response = await fetch(`${API_URL}/users/check-username?username=${encodeURIComponent(username)}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to check username availability");
    return response.json();
  },

  requestPasswordReset: async (email: string) => {
    const response = await fetch(`${API_URL}/users/request-password-reset`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    // Even if it fails, we usually don't want to leak info, 
    // but here we throw if the actual request fails (e.g. network)
    if (!response.ok) throw new Error("Request failed");
    return response.json();
  },

  confirmPasswordReset: async (token: string, newPassword: string) => {
     const response = await fetch(`${API_URL}/users/confirm-password-reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: newPassword }),
      });
      if (!response.ok) {
          const data = await response.json();
          throw new Error(data.detail || "Reset failed");
      }
      return response.json();
  },

  getMe: async () => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "GET",
      headers: getHeaders(), // Trying to use Bearer token if available, though original used credentials: include
      credentials: "include",
    });
    if (response.ok) return response.json();
    if (response.status === 401 || response.status === 403) return null;
    throw new Error("Failed to fetch user");
  },

  logout: async () => {
      await fetch(`${API_URL}/users/logout`, {
        method: "POST",
        headers: getHeaders(),
        credentials: "include",
      });
      localStorage.removeItem("access_token");
  },

  updateMe: async (data: Partial<{
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    username: string;
    avatar_config: any;
    gender: 'M' | 'F';
  }>) => {
    const response = await fetch(`${API_URL}/users/me`, {
      method: "PATCH",
      headers: {
        ...getHeaders(),
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error("Failed to update profile");
    return response.json();
  },

  getProfile: async (username: string) => {
    const response = await fetch(`${API_URL}/users/profile/${username}`, {
      method: "GET",
      headers: getHeaders(),
      credentials: "include",
    });
    if (!response.ok) throw new Error("Failed to fetch profile");
    return response.json();
  }
};
