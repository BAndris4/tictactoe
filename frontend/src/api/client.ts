export const API_URL = "http://localhost:8000/api";

export const getAuthToken = () => localStorage.getItem("access_token");

export const getHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

export const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Network response was not ok");
  }
  return response.json();
};
