import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface InterestGroup {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  created_at: string;
  member_count: number;
}

interface GroupMembership {
  id: string;
  user_id: string;
  group_id: string;
  display_name: string;
  joined_at: string;
}

interface GroupMemberWithStatus {
  user_id: string;
  display_name: string;
  is_online: boolean;
}

export const useGroups = (userId: string | null) => {
  const [groups, setGroups] = useState<InterestGroup[]>([]);
  const [myMemberships, setMyMemberships] = useState<GroupMembership[]>([]);
  const [groupMembers, setGroupMembers] = useState<Record<string, GroupMemberWithStatus[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchGroups = useCallback(async () => {
    const { data, error } = await supabase
      .from("interest_groups")
      .select("*")
      .order("name");

    if (!error && data) {
      setGroups(data);
    }
  }, []);

  const fetchMyMemberships = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from("group_memberships")
      .select("*")
      .eq("user_id", userId);

    if (!error && data) {
      setMyMemberships(data);
    }
  }, [userId]);

  const fetchGroupMembers = useCallback(async () => {
    // Fetch all memberships
    const { data: memberships, error: membershipError } = await supabase
      .from("group_memberships")
      .select("user_id, group_id, display_name");

    if (membershipError || !memberships) return;

    // Fetch online status for all users
    const { data: presenceData, error: presenceError } = await supabase
      .from("user_presence")
      .select("user_id, is_online");

    const onlineMap = new Map<string, boolean>();
    if (!presenceError && presenceData) {
      presenceData.forEach((p) => onlineMap.set(p.user_id, p.is_online));
    }

    // Group members by group_id with online status
    const membersMap: Record<string, GroupMemberWithStatus[]> = {};
    memberships.forEach((m) => {
      if (!membersMap[m.group_id]) {
        membersMap[m.group_id] = [];
      }
      membersMap[m.group_id].push({
        user_id: m.user_id,
        display_name: m.display_name,
        is_online: onlineMap.get(m.user_id) || false,
      });
    });

    setGroupMembers(membersMap);
  }, []);

  const joinGroup = useCallback(
    async (groupId: string, displayName: string) => {
      if (!userId) return false;

      const { error } = await supabase.from("group_memberships").insert({
        user_id: userId,
        group_id: groupId,
        display_name: displayName,
      });

      if (!error) {
        await Promise.all([fetchMyMemberships(), fetchGroupMembers()]);
        return true;
      }
      return false;
    },
    [userId, fetchMyMemberships, fetchGroupMembers]
  );

  const leaveGroup = useCallback(
    async (groupId: string) => {
      if (!userId) return false;

      const { error } = await supabase
        .from("group_memberships")
        .delete()
        .eq("user_id", userId)
        .eq("group_id", groupId);

      if (!error) {
        await Promise.all([fetchMyMemberships(), fetchGroupMembers()]);
        return true;
      }
      return false;
    },
    [userId, fetchMyMemberships, fetchGroupMembers]
  );

  const isGroupMember = useCallback(
    (groupId: string) => {
      return myMemberships.some((m) => m.group_id === groupId);
    },
    [myMemberships]
  );

  const getGroupOnlineCount = useCallback(
    (groupId: string) => {
      const members = groupMembers[groupId] || [];
      return members.filter((m) => m.is_online).length;
    },
    [groupMembers]
  );

  const getGroupMemberCount = useCallback(
    (groupId: string) => {
      return (groupMembers[groupId] || []).length;
    },
    [groupMembers]
  );

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchGroups(), fetchMyMemberships(), fetchGroupMembers()]);
      setLoading(false);
    };

    loadData();

    // Subscribe to membership changes
    const membershipChannel = supabase
      .channel("group-membership-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "group_memberships" },
        () => fetchGroupMembers()
      )
      .subscribe();

    // Subscribe to presence changes
    const presenceChannel = supabase
      .channel("group-presence-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_presence" },
        () => fetchGroupMembers()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(membershipChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [fetchGroups, fetchMyMemberships, fetchGroupMembers]);

  return {
    groups,
    myMemberships,
    groupMembers,
    loading,
    joinGroup,
    leaveGroup,
    isGroupMember,
    getGroupOnlineCount,
    getGroupMemberCount,
    refetch: () => Promise.all([fetchGroups(), fetchMyMemberships(), fetchGroupMembers()]),
  };
};
