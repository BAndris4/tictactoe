import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useAuth, getAuthToken } from '../hooks/useAuth';
import { useToast } from './ToastContext';

interface NotificationContextType {
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) {
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
      return;
    }

    const token = getAuthToken();
    if (!token) return;

    const wsUrl = `ws://localhost:8000/ws/notifications/?token=${token}`;
    const socket = new WebSocket(wsUrl);

    socket.onopen = () => {
      console.log("Notification WS Connected");
    };

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'game_invitation_cancelled') {
          showToast(`Game invite from @${data.from_user} was cancelled.`, 'warning');
          // We could also trigger a refetch of notifications here if we had a global notify store
        }
      } catch (err) {
        console.error("Failed to parse notification message", err);
      }
    };

    socket.onclose = () => {
      console.log("Notification WS Disconnected");
    };

    ws.current = socket;

    return () => {
      socket.close();
    };
  }, [user, showToast]);

  return (
    <NotificationContext.Provider value={{}}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};
