import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useFriends } from '@/hooks/useFriends';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Users, Loader2, UserPlus, Clock } from 'lucide-react';
import AddFriendForm from '@/components/friends/AddFriendForm';
import PendingRequests from '@/components/friends/PendingRequests';
import FriendCard from '@/components/friends/FriendCard';
import { Card, CardContent } from '@/components/ui/card';
import Footer from '@/components/Footer';

const Friends = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    friends,
    pendingRequests,
    sentRequests,
    loading,
    sendFriendRequest,
    respondToRequest,
    removeFriend
  } = useFriends(user?.id);

  useEffect(() => {
    if (!authLoading && !user) {
      toast({
        title: "Waa in aad soo gashaa",
        description: "Fadlan soo gal si aad u aragto saaxiibadaada",
        variant: "destructive",
      });
      navigate('/auth');
    }
  }, [user, authLoading, navigate, toast]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 pt-24 md:pt-28">
        <div className="container-tight px-4 md:px-8 pb-12">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Users className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-3xl md:text-4xl text-foreground">
                Saaxiibada
              </h1>
              <p className="text-sm text-muted-foreground">Wadaag hadafyadaada iyo horumarka saaxiibadaada</p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Add Friend */}
            <Card className="glass-card">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-primary" />
                  <h2 className="font-semibold">Ku dar Saaxiib</h2>
                </div>
                <AddFriendForm onSendRequest={sendFriendRequest} />
              </CardContent>
            </Card>

            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <PendingRequests
                requests={pendingRequests}
                onRespond={respondToRequest}
              />
            )}

            {/* Sent Requests */}
            {sentRequests.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Codsiyada La Diray ({sentRequests.length})
                </h3>
                <p className="text-xs text-muted-foreground">
                  Codsiyadan waxay sugayaan in saaxiibkaagu aqbalo
                </p>
              </div>
            )}

            {/* Friends List */}
            <div>
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Saaxiibadaada ({friends.length})
              </h2>
              
              {friends.length === 0 ? (
                <Card className="glass-card">
                  <CardContent className="p-8 text-center">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="font-medium mb-2">Wali saaxiib ma lihid</h3>
                    <p className="text-sm text-muted-foreground">
                      Ku dar saaxiib adigoo isticmaalaya email-kooda si aad u wadaagtaan hadafyadiinna
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {friends.map((friend) => (
                    <FriendCard
                      key={friend.friendship.id}
                      friend={friend}
                      onRemove={removeFriend}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Friends;
