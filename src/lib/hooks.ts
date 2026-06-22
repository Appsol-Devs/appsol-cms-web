import { setSidebarState } from "@/pages/layout/sidebar/common/sidebarSlice";
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { io, Socket } from "socket.io-client";
import type { INotification } from "@/pages/customer/common/customers";

export const useToggleSidebarForNotLargeScreens = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const checkScreen = () => {
      const isSmall = window.innerWidth < 1024;
      dispatch(setSidebarState(isSmall));
    };

    checkScreen();

    window.addEventListener("resize", checkScreen);
    return () => window.removeEventListener("resize", checkScreen);
  }, [dispatch]);
};

interface UseNotificationSocketParams {
  token: string | null;
  onNewNotification: (notification: INotification) => void;
  onNotificationRead: (id: string) => void;
  onMarkAllRead: (count: number) => void;
}

export const useNotificationSocket = ({
  token,
  onNewNotification,
  onNotificationRead,
  onMarkAllRead,
}: UseNotificationSocketParams) => {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(import.meta.env.VITE_BASEE_URL, {
        path: "/socket.io",
        autoConnect: false, 
        transports: ["websocket"],
      });
    }

    const socket = socketRef.current;

    if (!token) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    const handleConnect = () => {
      socket.emit("authenticate", { token });
    };

    const handleAuthenticated = ({
      ok,
      error,
    }: {
      ok: boolean;
      error?: string;
    }) => {
      if (!ok) {
        console.error("Socket auth failed:", error);
        socket.disconnect();
      } else {
        console.log(" Socket authentication successful!");
      }
    };

    const handleNotificationRead = ({ id }: { id: string }) => {
      onNotificationRead(id);
    };

    const handleMarkAllRead = ({ count }: { count: number }) => {
      onMarkAllRead(count);
    };

    socket.on("connect", handleConnect);
    socket.on("authenticated", handleAuthenticated);
    socket.on("notification:new", onNewNotification);
    socket.on("notification:read", handleNotificationRead);
    socket.on("notification:markAllRead", handleMarkAllRead);

    if (!socket.connected) {
      socket.connect();
    } else {
      socket.emit("authenticate", { token });
    }

    return () => {
      socket.off("connect", handleConnect);
      socket.off("authenticated", handleAuthenticated);
      socket.off("notification:new", onNewNotification);
      socket.off("notification:read", handleNotificationRead);
      socket.off("notification:markAllRead", handleMarkAllRead);
    };
  }, [token, onNewNotification, onNotificationRead, onMarkAllRead]);

  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);
};
