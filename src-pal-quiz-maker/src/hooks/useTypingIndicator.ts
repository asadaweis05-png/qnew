import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TypingUser {
  userId: string;
  userName: string;
}

export const useTypingIndicator = (
  channelName: string,
  currentUserId: string | null,
  currentUserName: string
) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTypingRef = useRef(false);

  useEffect(() => {
    if (!channelName || !currentUserId) return;

    const channel = supabase.channel(`typing:${channelName}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "typing" }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setTypingUsers((prev) => {
            const exists = prev.some((u) => u.userId === payload.userId);
            if (!exists) {
              return [...prev, { userId: payload.userId, userName: payload.userName }];
            }
            return prev;
          });

          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers((prev) =>
              prev.filter((u) => u.userId !== payload.userId)
            );
          }, 3000);
        }
      })
      .on("broadcast", { event: "stop_typing" }, ({ payload }) => {
        if (payload.userId !== currentUserId) {
          setTypingUsers((prev) =>
            prev.filter((u) => u.userId !== payload.userId)
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [channelName, currentUserId]);

  const sendTyping = useCallback(() => {
    if (!channelRef.current || !currentUserId) return;

    // Only send typing event if not already sent recently
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      channelRef.current.send({
        type: "broadcast",
        event: "typing",
        payload: { userId: currentUserId, userName: currentUserName },
      });
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      channelRef.current?.send({
        type: "broadcast",
        event: "stop_typing",
        payload: { userId: currentUserId },
      });
    }, 2000);
  }, [currentUserId, currentUserName]);

  const stopTyping = useCallback(() => {
    if (!channelRef.current || !currentUserId) return;

    isTypingRef.current = false;
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    channelRef.current.send({
      type: "broadcast",
      event: "stop_typing",
      payload: { userId: currentUserId },
    });
  }, [currentUserId]);

  return { typingUsers, sendTyping, stopTyping };
};