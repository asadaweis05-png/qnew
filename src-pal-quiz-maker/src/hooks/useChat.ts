import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

export const useChat = (userId: string | null, chatPartnerId: string | null) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!userId || !chatPartnerId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .or(
        `and(sender_id.eq.${userId},receiver_id.eq.${chatPartnerId}),and(sender_id.eq.${chatPartnerId},receiver_id.eq.${userId})`
      )
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  }, [userId, chatPartnerId]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!userId || !chatPartnerId || !text.trim()) return false;

      const { error } = await supabase.from("chat_messages").insert({
        sender_id: userId,
        receiver_id: chatPartnerId,
        message: text.trim(),
      });

      return !error;
    },
    [userId, chatPartnerId]
  );

  const markAsRead = useCallback(async () => {
    if (!userId || !chatPartnerId) return;

    await supabase
      .from("chat_messages")
      .update({ read_at: new Date().toISOString() })
      .eq("sender_id", chatPartnerId)
      .eq("receiver_id", userId)
      .is("read_at", null);
  }, [userId, chatPartnerId]);

  useEffect(() => {
    if (!userId || !chatPartnerId) return;

    fetchMessages();
    markAsRead();

    // Listen for new messages
    const channel = supabase
      .channel(`chat-${userId}-${chatPartnerId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          // Only add if it's part of this conversation
          if (
            (newMessage.sender_id === userId && newMessage.receiver_id === chatPartnerId) ||
            (newMessage.sender_id === chatPartnerId && newMessage.receiver_id === userId)
          ) {
            setMessages((prev) => [...prev, newMessage]);
            // Mark as read if received
            if (newMessage.sender_id === chatPartnerId) {
              markAsRead();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, chatPartnerId, fetchMessages, markAsRead]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
};
