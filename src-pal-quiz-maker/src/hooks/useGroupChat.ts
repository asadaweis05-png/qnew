import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string;
  sender_name: string;
  message: string;
  created_at: string;
}

export const useGroupChat = (groupId: string | null, userId: string | null) => {
  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = useCallback(async () => {
    if (!groupId) return;

    setLoading(true);
    const { data, error } = await supabase
      .from("group_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(100);

    if (!error && data) {
      setMessages(data);
    }
    setLoading(false);
  }, [groupId]);

  const sendMessage = useCallback(
    async (text: string, senderName: string) => {
      if (!groupId || !userId || !text.trim()) return false;

      const { error } = await supabase.from("group_messages").insert({
        group_id: groupId,
        sender_id: userId,
        sender_name: senderName,
        message: text.trim(),
      });

      return !error;
    },
    [groupId, userId]
  );

  useEffect(() => {
    if (!groupId) {
      setMessages([]);
      return;
    }

    fetchMessages();

    // Listen for new messages
    const channel = supabase
      .channel(`group-chat-${groupId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "group_messages",
          filter: `group_id=eq.${groupId}`,
        },
        (payload) => {
          const newMessage = payload.new as GroupMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, fetchMessages]);

  return { messages, loading, sendMessage, refetch: fetchMessages };
};
