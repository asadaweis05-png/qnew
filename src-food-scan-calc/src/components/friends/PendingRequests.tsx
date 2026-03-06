import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Check, X, UserCircle } from 'lucide-react';
import { Friendship } from '@/types/friends';
import { supabase } from '@/integrations/supabase/client';

interface PendingRequestsProps {
  requests: Friendship[];
  onRespond: (friendshipId: string, accept: boolean) => Promise<void>;
}

const PendingRequests: React.FC<PendingRequestsProps> = ({ requests, onRespond }) => {
  const [requesterEmails, setRequesterEmails] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchEmails = async () => {
      const requesterIds = requests.map(r => r.requester_id);
      if (requesterIds.length === 0) return;

      const { data } = await supabase
        .from('profiles')
        .select('id, email')
        .in('id', requesterIds);

      if (data) {
        const emailMap: Record<string, string> = {};
        data.forEach(p => {
          if (p.email) emailMap[p.id] = p.email;
        });
        setRequesterEmails(emailMap);
      }
    };

    fetchEmails();
  }, [requests]);

  if (requests.length === 0) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">Codsiyada Sugaya ({requests.length})</h3>
      {requests.map((request) => (
        <Card key={request.id} className="border-primary/20">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-primary" />
              </div>
              <span className="font-medium text-sm">
                {requesterEmails[request.requester_id] || 'Loading...'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-600 hover:bg-green-50"
                onClick={() => onRespond(request.id, true)}
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-50"
                onClick={() => onRespond(request.id, false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default PendingRequests;
