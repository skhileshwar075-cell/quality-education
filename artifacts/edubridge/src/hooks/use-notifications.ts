import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface Notification {
  id: string;
  message: string;
  type: "quiz" | "content" | "result";
  timestamp: Date;
}

let socket: Socket | null = null;

function getSocket(): Socket {
  if (!socket) {
    socket = io(window.location.origin, {
      path: "/api/socket.io",
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    const addNotif = (type: Notification["type"]) => (data: { message?: string; subjectTitle?: string }) => {
      const msg = data.message || `New ${type} event`;
      setNotifications((prev) => [
        { id: `${Date.now()}`, message: msg, type, timestamp: new Date() },
        ...prev.slice(0, 9),
      ]);
    };

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("quiz:new", addNotif("quiz"));
    s.on("quiz:updated", addNotif("quiz"));
    s.on("content:new", addNotif("content"));
    s.on("result:published", addNotif("result"));

    if (s.connected) setConnected(true);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("quiz:new");
      s.off("quiz:updated");
      s.off("content:new");
      s.off("result:published");
    };
  }, []);

  const dismiss = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAll = () => setNotifications([]);

  return { notifications, connected, dismiss, clearAll };
}
