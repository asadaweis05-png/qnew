import { Users, Check, Plus, LogOut, Circle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import CreateGroupDialog from "./CreateGroupDialog";

interface InterestGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  created_at: string;
  member_count: number;
}

interface GroupMemberWithStatus {
  user_id: string;
  display_name: string;
  is_online: boolean;
}

interface GroupListProps {
  groups: InterestGroup[];
  selectedGroupId: string | null;
  onSelectGroup: (group: InterestGroup) => void;
  isGroupMember: (groupId: string) => boolean;
  onJoinGroup: (groupId: string) => Promise<boolean>;
  onLeaveGroup: (groupId: string) => Promise<boolean>;
  getGroupOnlineCount: (groupId: string) => number;
  getGroupMemberCount: (groupId: string) => number;
  groupMembers: Record<string, GroupMemberWithStatus[]>;
  onRefresh: () => void;
  loading: boolean;
}

const GroupList = ({
  groups,
  selectedGroupId,
  onSelectGroup,
  isGroupMember,
  onJoinGroup,
  onLeaveGroup,
  getGroupOnlineCount,
  getGroupMemberCount,
  groupMembers,
  onRefresh,
  loading,
}: GroupListProps) => {
  const handleJoin = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    const success = await onJoinGroup(groupId);
    if (success) {
      toast.success("Waad ku biirtay kooxda!");
    } else {
      toast.error("Khalad ayaa dhacay");
    }
  };

  const handleLeave = async (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    const success = await onLeaveGroup(groupId);
    if (success) {
      toast.success("Waad ka baxday kooxda");
    } else {
      toast.error("Khalad ayaa dhacay");
    }
  };

  if (loading) {
    return (
      <div className="w-full border-r border-border/50 bg-card/50 flex items-center justify-center min-h-[200px]">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full border-r border-border/50 bg-card/50 flex flex-col h-full">
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold text-foreground">Kooxaha</h2>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {groups.length}
          </span>
        </div>
        <CreateGroupDialog onGroupCreated={onRefresh} />
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {groups.map((group) => {
            const isMember = isGroupMember(group.id);
            const isSelected = selectedGroupId === group.id;
            const memberCount = getGroupMemberCount(group.id);
            const onlineCount = getGroupOnlineCount(group.id);
            const members = groupMembers[group.id] || [];

            return (
              <div
                key={group.id}
                onClick={() => isMember && onSelectGroup(group)}
                className={`w-full p-3 rounded-lg transition-all ${
                  isSelected
                    ? "bg-primary/10 border border-primary/20"
                    : isMember
                    ? "hover:bg-muted/50 cursor-pointer"
                    : "opacity-80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                    {group.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-foreground truncate">
                        {group.name}
                      </p>
                      {isMember && (
                        <Check className="h-4 w-4 text-success flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                      {group.description}
                    </p>
                    
                    {/* Member count and online status */}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {memberCount} xubnood
                      </span>
                      {onlineCount > 0 && (
                        <span className="flex items-center gap-1 text-success">
                          <Circle className="h-2 w-2 fill-success" />
                          {onlineCount} online
                        </span>
                      )}
                    </div>

                    {/* Show online members avatars */}
                    {isMember && members.length > 0 && (
                      <div className="flex items-center gap-1 mt-2 flex-wrap">
                        {members
                          .filter((m) => m.is_online)
                          .slice(0, 5)
                          .map((member) => (
                            <div
                              key={member.user_id}
                              className="relative group/member"
                            >
                              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-medium text-primary border-2 border-success">
                                {member.display_name.charAt(0).toUpperCase()}
                              </div>
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-lg opacity-0 group-hover/member:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {member.display_name}
                              </div>
                            </div>
                          ))}
                        {members.filter((m) => m.is_online).length > 5 && (
                          <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                            +{members.filter((m) => m.is_online).length - 5}
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {isMember ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground hover:text-destructive"
                          onClick={(e) => handleLeave(e, group.id)}
                        >
                          <LogOut className="h-3 w-3 mr-1" />
                          Ka bax
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={(e) => handleJoin(e, group.id)}
                        >
                          <Plus className="h-3 w-3 mr-1" />
                          Ku biir
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GroupList;
