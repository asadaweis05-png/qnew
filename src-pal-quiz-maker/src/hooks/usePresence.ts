import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface OnlineUser {
  id: string;
  user_id: string;
  display_name: string;
  last_seen: string;
  is_online: boolean;
}

export const usePresence = (userId: string | null, displayName: string) => {
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [isTracking, setIsTracking] = useState(false);

  const updatePresence = useCallback(async (online: boolean) => {
    if (!userId) return;

    try {
      const { data: existing } = await supabase
        .from("user_presence")
        .select("id")
        .eq("user_id", userId)
        .single();

      if (existing) {
        await supabase
          .from("user_presence")
          .update({
            is_online: online,
            last_seen: new Date().toISOString(),
            display_name: displayName,
          })
          .eq("user_id", userId);
      } else {
        await supabase.from("user_presence").insert({
          user_id: userId,
          display_name: displayName,
          is_online: online,
        });
      }
    } catch (error) {
      console.error("Error updating presence:", error);
    }
  }, [userId, displayName]);

  const fetchOnlineUsers = useCallback(async () => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from("user_presence")
      .select("*")
      .eq("is_online", true)
      .gte("last_seen", fiveMinutesAgo);

    if (!error && data) {
      setOnlineUsers(data.filter((u) => u.user_id !== userId));
    }
  }, [userId]);

  useEffect(() => {
    if (!userId || !displayName) return;

    // Mark user as online
    updatePresence(true);
    setIsTracking(true);

    // Fetch initial online users
    fetchOnlineUsers();

    // Update presence every 30 seconds
    const presenceInterval = setInterval(() => {
      updatePresence(true);
      fetchOnlineUsers();
    }, 30000);

    // Listen for realtime changes
    const channel = supabase
      .channel("presence-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_presence",
        },
        () => {
          fetchOnlineUsers();
        }
      )
      .subscribe();

    // Cleanup on unmount
    return () => {
      clearInterval(presenceInterval);
      supabase.removeChannel(channel);
      updatePresence(false);
    };
  }, [userId, displayName, updatePresence, fetchOnlineUsers]);

  return { onlineUsers, isTracking };
};
