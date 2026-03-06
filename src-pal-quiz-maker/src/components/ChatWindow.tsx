import { useState, useRef, useEffect } from "react";
import { Send, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import TypingIndicator from "./TypingIndicator";
import { useTypingIndicator } from "@/hooks/useTypingIndicator";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  read_at: string | null;
}

interface ChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  currentUserName: string;
  partnerId: string | null;
  partnerName: string;
  onSendMessage: (message: string) => Promise<boolean>;
  loading: boolean;
}

const ChatWindow = ({
  messages,
  currentUserId,
  currentUserName,
  partnerId,
  partnerName,
  onSendMessage,
  loading,
}: ChatWindowProps) => {
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Create a unique channel name for this conversation
  const channelName = partnerId
    ? [currentUserId, partnerId].sort().join("-")
    : "";

  const { typingUsers, sendTyping, stopTyping } = useTypingIndicator(
    channelName,
    currentUserId,
    currentUserName
  );

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typingUsers]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (e.target.value.trim()) {
      sendTyping();
    }
  };

  const handleSend = async () => {
    if (!newMessage.trim() || sending) return;

    stopTyping();
    setSending(true);
    const success = await onSendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
    setSending(false);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("so-SO", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!partnerName) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center px-4">
          <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold text-foreground mb-1">
            Dooro qof aad la hadashid
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Dooro mid ka mid ah dadka online ah si aad ula hadashid
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full w-full">
      {/* Chat Header - Hide on mobile since main header shows name */}
      <div className="hidden md:block p-4 border-b border-border/50 bg-card/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm font-semibold text-primary">
              {partnerName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-foreground">{partnerName}</p>
            <p className="text-xs text-success">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              Billow wada hadalka - u dir fariin!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${
                      isOwn
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    <p className="text-sm">{msg.message}</p>
                    <p
                      className={`text-[10px] mt-1 ${
                        isOwn ? "text-primary-foreground/70" : "text-muted-foreground"
                      }`}
                    >
                      {formatTime(msg.created_at)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>

      {/* Typing Indicator */}
      <TypingIndicator typingUsers={typingUsers} />

      {/* Input */}
      <div className="p-4 border-t border-border/50 bg-card/50">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Qor fariin..."
            className="flex-1"
            disabled={sending}
          />
          <Button type="submit" disabled={sending || !newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
