import React, { useState, useEffect, useCallback } from "react";
import { useNotificationSocket } from "@/lib/hooks";
import type { INotification } from "@/pages/customer/common/customers";
import { NotificationContext } from "../common/notification";

import { showToast } from "@/components/ui/CustomToast"; 

import { 
  useLazyGetPaginatedNotificationsQuery, 
  useMarkAsReadMutation, 
  useMarkAllReadMutation 
} from "../common/notificationsApi";

export const NotificationProvider: React.FC<{
  children: React.ReactNode;
  token: string | null;
}> = ({ children, token }) => {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [getNotifications, { isLoading }] = useLazyGetPaginatedNotificationsQuery();
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllRead] = useMarkAllReadMutation();

  useEffect(() => {
    if (!token) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    const fetchInitialNotifications = async () => {
      try {
        const result = await getNotifications({ pageIndex: 1, pageSize: 50 }).unwrap();
        const fetchedNotifications = result.contents || [];
        
        setNotifications(fetchedNotifications);
        setUnreadCount(fetchedNotifications.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Failed to load initial notifications", error);
      }
    };

    fetchInitialNotifications();
  }, [token, getNotifications]);

  const handleNewNotification = useCallback((newNotif: INotification) => {
    setNotifications((prev) => [newNotif, ...prev]);
    setUnreadCount((prev) => prev + 1);

    showToast({
      title: "New Notification",
      message: newNotif.message || "You have a new message.",
      type: "info",
    });
    const playSound = () => {
      const audio = new Audio('/assets/sounds/ariel.mp3'); 
      
      audio.play().catch((error) => {
        console.warn("Browser prevented notification audio from playing:", error);
      });
    };

    playSound();
  }, []);

  const handleNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  const handleMarkAllRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  }, []);

  useNotificationSocket({
    token,
    onNewNotification: handleNewNotification,
    onNotificationRead: handleNotificationRead,
    onMarkAllRead: handleMarkAllRead,
  });

  const markAsReadREST = async (id: string) => {
    await markAsRead(id).unwrap();
  };

  const markAllReadREST = async () => {
    await markAllRead().unwrap();
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isLoading,
        markAsReadREST,
        markAllReadREST,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};