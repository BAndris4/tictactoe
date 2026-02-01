import { API_URL, getHeaders } from "./client";

export interface Friendship {
  id: number;
  from_user: string;
  to_user: string;
  status: 'pending' | 'accepted' | 'rejected' | 'blocked';
  created_at: string;
}

export interface FriendUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  profile?: {
    avatar_config?: any;
    gender?: 'M' | 'F';
  };
}

export const sendFriendRequest = async (username: string): Promise<Friendship> => {
  const response = await fetch(`${API_URL}/users/friends/request`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to send friend request");
  }

  return response.json();
};

export const getPendingRequests = async (): Promise<Friendship[]> => {
  const response = await fetch(`${API_URL}/users/friends/requests/pending`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch pending requests");
  }

  return response.json();
};

export const respondToFriendRequest = async (requestId: number, status: 'accepted' | 'rejected'): Promise<Friendship> => {
  const response = await fetch(`${API_URL}/users/friends/requests/${requestId}`, {
    method: "PATCH",
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to respond to friend request");
  }

  return response.json();
};

export const getFriendsList = async (): Promise<FriendUser[]> => {
  const response = await fetch(`${API_URL}/users/friends`, {
    method: "GET",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to fetch friends list");
  }

  return response.json();
};

export const unfriendUser = async (username: string): Promise<void> => {
  const response = await fetch(`${API_URL}/users/friends/${username}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error("Failed to unfriend user");
  }
};

export const blockUser = async (username: string): Promise<Friendship> => {
  const response = await fetch(`${API_URL}/users/friends/block`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.detail || "Failed to block user");
  }

  return response.json();
};
