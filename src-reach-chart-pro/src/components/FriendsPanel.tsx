import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  UserPlus, 
  Mail, 
  X, 
  Check, 
  Loader2,
  Clock,
  UserMinus
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useFriends } from '@/hooks/useFriends';

export const FriendsPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [activeTab, setActiveTab] = useState<'friends' | 'pending' | 'sent'>('friends');
  
  const { 
    friends, 
    pendingInvitations, 
    sentInvitations, 
    loading,
    sendInvitation,
    respondToInvitation,
    removeFriend,
  } = useFriends();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setIsInviting(true);
    const success = await sendInvitation(inviteEmail.trim());
    if (success) {
      setInviteEmail('');
    }
    setIsInviting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="relative flex items-center gap-2 px-4 py-2 rounded-full bg-violet/10 text-violet text-sm font-medium hover:bg-violet/20 transition-colors">
          <Users className="w-4 h-4" />
          <span className="hidden sm:inline">Friends</span>
          {pendingInvitations.length > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-coral text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {pendingInvitations.length}
            </span>
          )}
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md bg-card border-border">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl flex items-center gap-2">
            <Users className="w-5 h-5 text-violet" />
            Friends & Sharing
          </DialogTitle>
        </DialogHeader>

        {/* Invite Form */}
        <form onSubmit={handleInvite} className="flex gap-2 mt-4">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Friend's email address"
              className="w-full pl-10 pr-4 py-2.5 bg-secondary border border-border rounded-xl text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-violet/20 focus:border-violet transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={isInviting || !inviteEmail.trim()}
            className="px-4 py-2.5 bg-violet text-white rounded-xl text-sm font-medium hover:bg-violet/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isInviting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UserPlus className="w-4 h-4" />
            )}
          </button>
        </form>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-lg mt-4">
          {[
            { id: 'friends', label: 'Friends', count: friends.length },
            { id: 'pending', label: 'Pending', count: pendingInvitations.length },
            { id: 'sent', label: 'Sent', count: sentInvitations.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-2 px-3 rounded-md text-xs font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
                  activeTab === tab.id ? 'bg-violet/10 text-violet' : 'bg-muted text-muted-foreground'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-4 max-h-[300px] overflow-y-auto space-y-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'friends' && (
                <motion.div
                  key="friends"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {friends.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No friends yet. Invite someone to get started!
                    </div>
                  ) : (
                    friends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-violet">
                              {friend.display_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{friend.display_name}</p>
                            <p className="text-xs text-muted-foreground">{friend.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFriend(friend.user_id)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'pending' && (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {pendingInvitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No pending invitations
                    </div>
                  ) : (
                    pendingInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gold/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-gold">
                              {invitation.inviter_name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{invitation.inviter_name}</p>
                            <p className="text-xs text-muted-foreground">wants to be friends</p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => respondToInvitation(invitation.id, true)}
                            className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => respondToInvitation(invitation.id, false)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}

              {activeTab === 'sent' && (
                <motion.div
                  key="sent"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-2"
                >
                  {sentInvitations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No sent invitations
                    </div>
                  ) : (
                    sentInvitations.map((invitation) => (
                      <div
                        key={invitation.id}
                        className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{invitation.invitee_email}</p>
                            <p className="text-xs text-muted-foreground">Waiting for response</p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
