import { MessageCircle, Circle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OnlineUser {
  id: string;
  user_id: string;
  display_name: string;
  last_seen: string;
  is_online: boolean;
}

interface ChatSidebarProps {
  onlineUsers: OnlineUser[];
  selectedUserId: string | null;
  onSelectUser: (userId: string, displayName: string) => void;
  currentUserId: string | null;
}

const ChatSidebar = ({
  onlineUsers,
  selectedUserId,
  onSelectUser,
  currentUserId,
}: ChatSidebarProps) => {
  return (
    <div className="w-full border-r border-border/50 bg-card/50 flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Dadka Online</h2>
          </div>
          <span className="text-xs text-success bg-success/10 px-2 py-1 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-success rounded-full"></span>
            {onlineUsers.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {onlineUsers.length === 0 ? (
            <div className="text-center py-8 px-4">
              <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Ma jiro qof kale oo online ah hadda
              </p>
            </div>
          ) : (
            onlineUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => onSelectUser(user.user_id, user.display_name)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
                  selectedUserId === user.user_id
                    ? "bg-primary/10 border border-primary/20"
                    : "hover:bg-muted/50"
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {user.display_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <Circle className="absolute -bottom-0.5 -right-0.5 h-3 w-3 fill-green-500 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {user.display_name}
                  </p>
                  <p className="text-xs text-green-600">Online</p>
                </div>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatSidebar;
