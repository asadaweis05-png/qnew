import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Users, Loader2, X, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useFriends } from '@/hooks/useFriends';
import { useSharing, SharedWith } from '@/hooks/useSharing';

interface ShareGoalButtonProps {
  goalId: string;
  goalTitle: string;
}

export const ShareGoalButton = ({ goalId, goalTitle }: ShareGoalButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [sharedWith, setSharedWith] = useState<SharedWith[]>([]);
  const [loadingShares, setLoadingShares] = useState(false);
  const [sharingFriend, setSharingFriend] = useState<string | null>(null);
  
  const { friends, loading: friendsLoading } = useFriends();
  const { getSharedWith, shareGoal, unshareGoal, loading: sharingLoading } = useSharing();

  useEffect(() => {
    if (isOpen) {
      loadSharedWith();
    }
  }, [isOpen, goalId]);

  const loadSharedWith = async () => {
    setLoadingShares(true);
    const shares = await getSharedWith(goalId);
    setSharedWith(shares);
    setLoadingShares(false);
  };

  const handleShare = async (friendUserId: string) => {
    setSharingFriend(friendUserId);
    const success = await shareGoal(goalId, friendUserId, true);
    if (success) {
      await loadSharedWith();
    }
    setSharingFriend(null);
  };

  const handleUnshare = async (sharedGoalId: string) => {
    const success = await unshareGoal(sharedGoalId);
    if (success) {
      await loadSharedWith();
    }
  };

  const sharedFriendIds = sharedWith.map(s => s.shared_with_id);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button 
          className="p-2 rounded-lg text-muted-foreground hover:text-violet hover:bg-violet/10 transition-all"
          title="Share goal"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Share2 className="w-5 h-5 text-violet" />
            Share Goal
          </DialogTitle>
        </DialogHeader>

        <div className="mt-2">
          <p className="text-sm text-muted-foreground mb-4">
            Share "<span className="text-foreground font-medium">{goalTitle}</span>" with friends so they can see your progress and help you complete it.
          </p>

          {friendsLoading || loadingShares ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Add friends first to share your goals with them.
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              <AnimatePresence>
                {friends.map((friend) => {
                  const isShared = sharedFriendIds.includes(friend.user_id);
                  const sharedEntry = sharedWith.find(s => s.shared_with_id === friend.user_id);
                  const isSharing = sharingFriend === friend.user_id;

                  return (
                    <motion.div
                      key={friend.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                        isShared ? 'bg-violet/5 border border-violet/20' : 'bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                          isShared ? 'bg-violet/20' : 'bg-secondary'
                        }`}>
                          <span className={`text-sm font-medium ${
                            isShared ? 'text-violet' : 'text-muted-foreground'
                          }`}>
                            {friend.display_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">{friend.display_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {isShared ? 'Can view & complete' : friend.email}
                          </p>
                        </div>
                      </div>

                      {isShared ? (
                        <button
                          onClick={() => sharedEntry && handleUnshare(sharedEntry.id)}
                          disabled={sharingLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-violet bg-violet/10 rounded-lg hover:bg-violet/20 transition-colors"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Shared
                        </button>
                      ) : (
                        <button
                          onClick={() => handleShare(friend.user_id)}
                          disabled={isSharing || sharingLoading}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-muted-foreground bg-secondary rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
                        >
                          {isSharing ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Share2 className="w-3.5 h-3.5" />
                          )}
                          Share
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
