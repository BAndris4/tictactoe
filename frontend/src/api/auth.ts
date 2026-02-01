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
        }),
      });

      if (!response.ok) throw new Error("Registration failed");
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
