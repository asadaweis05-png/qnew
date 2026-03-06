import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Brain, MessageCircle, Users } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePresence } from "@/hooks/usePresence";
import { useChat } from "@/hooks/useChat";
import { useGroups } from "@/hooks/useGroups";
import { useGroupChat } from "@/hooks/useGroupChat";
import ChatSidebar from "@/components/ChatSidebar";
import ChatWindow from "@/components/ChatWindow";
import GroupList from "@/components/GroupList";
import GroupChatWindow from "@/components/GroupChatWindow";

const Chat = () => {
  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("groups");
  
  // Direct chat state
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserName, setSelectedUserName] = useState("");
  
  // Group chat state
  const [selectedGroup, setSelectedGroup] = useState<{
    id: string;
    name: string;
    icon: string;
  } | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);

      const name =
        session.user.user_metadata?.display_name ||
        session.user.user_metadata?.full_name ||
        session.user.email?.split("@")[0] ||
        "User";
      setDisplayName(name);
      setLoading(false);
    };
    checkUser();
  }, [navigate]);

  const { onlineUsers } = usePresence(user?.id || null, displayName);
  const { messages: directMessages, loading: chatLoading, sendMessage: sendDirectMessage } = useChat(
    user?.id || null,
    selectedUserId
  );
  
  const { 
    groups, 
    loading: groupsLoading, 
    joinGroup, 
    leaveGroup, 
    isGroupMember,
    getGroupOnlineCount,
    getGroupMemberCount,
    groupMembers,
    refetch: refetchGroups
  } = useGroups(user?.id || null);
  
  const { messages: groupMessages, loading: groupChatLoading, sendMessage: sendGroupMessage } = useGroupChat(
    selectedGroup?.id || null,
    user?.id || null
  );

  const handleSelectUser = (userId: string, userName: string) => {
    setSelectedUserId(userId);
    setSelectedUserName(userName);
  };

  const handleSelectGroup = (group: { id: string; name: string; icon: string }) => {
    setSelectedGroup(group);
  };

  const handleJoinGroup = async (groupId: string) => {
    return await joinGroup(groupId, displayName);
  };

  const handleBackToList = () => {
    if (activeTab === "groups") {
      setSelectedGroup(null);
    } else {
      setSelectedUserId(null);
      setSelectedUserName("");
    }
  };

  // Determine if we should show chat view on mobile
  const showChatOnMobile = activeTab === "groups" ? !!selectedGroup : !!selectedUserId;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Fadlan sug...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 flex-shrink-0">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => showChatOnMobile ? handleBackToList() : navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">
              {showChatOnMobile 
                ? (activeTab === "groups" ? selectedGroup?.name : selectedUserName) 
                : "Wada Hadal"}
            </span>
          </div>
        </div>
      </header>

      {/* Tabs - Hide on mobile when chat is open */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className={`border-b border-border/50 bg-card/30 ${showChatOnMobile ? 'hidden md:block' : ''}`}>
          <div className="max-w-6xl mx-auto px-4">
            <TabsList className="h-12 bg-transparent border-0 p-0 gap-6">
              <TabsTrigger 
                value="groups" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <Users className="h-4 w-4 mr-2" />
                Kooxaha
              </TabsTrigger>
              <TabsTrigger 
                value="direct" 
                className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-0 pb-3"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Toos
                {onlineUsers.length > 0 && (
                  <span className="ml-2 px-1.5 py-0.5 text-xs bg-success/20 text-success rounded-full">
                    {onlineUsers.length}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        {/* Groups Tab */}
        <TabsContent value="groups" className="flex-1 flex overflow-hidden m-0">
          {/* Group List - Hide on mobile when group selected */}
          <div className={`${showChatOnMobile ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0`}>
            <GroupList
              groups={groups}
              selectedGroupId={selectedGroup?.id || null}
              onSelectGroup={handleSelectGroup}
              isGroupMember={isGroupMember}
              onJoinGroup={handleJoinGroup}
              onLeaveGroup={leaveGroup}
              getGroupOnlineCount={getGroupOnlineCount}
              getGroupMemberCount={getGroupMemberCount}
              groupMembers={groupMembers}
              onRefresh={refetchGroups}
              loading={groupsLoading}
            />
          </div>
          {/* Group Chat - Show on mobile when group selected */}
          <div className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1`}>
            <GroupChatWindow
              messages={groupMessages}
              currentUserId={user?.id || ""}
              groupId={selectedGroup?.id || null}
              groupName={selectedGroup?.name || ""}
              groupIcon={selectedGroup?.icon || ""}
              senderName={displayName}
              onSendMessage={sendGroupMessage}
              loading={groupChatLoading}
            />
          </div>
        </TabsContent>

        {/* Direct Messages Tab */}
        <TabsContent value="direct" className="flex-1 flex overflow-hidden m-0">
          {/* Sidebar - Hide on mobile when user selected */}
          <div className={`${showChatOnMobile ? 'hidden md:flex' : 'flex'} w-full md:w-72 flex-shrink-0`}>
            <ChatSidebar
              onlineUsers={onlineUsers}
              selectedUserId={selectedUserId}
              onSelectUser={handleSelectUser}
              currentUserId={user?.id || null}
            />
          </div>
          {/* Chat Window - Show on mobile when user selected */}
          <div className={`${showChatOnMobile ? 'flex' : 'hidden md:flex'} flex-1`}>
            <ChatWindow
              messages={directMessages}
              currentUserId={user?.id || ""}
              currentUserName={displayName}
              partnerId={selectedUserId}
              partnerName={selectedUserName}
              onSendMessage={sendDirectMessage}
              loading={chatLoading}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Chat;