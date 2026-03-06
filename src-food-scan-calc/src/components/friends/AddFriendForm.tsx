import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { UserPlus, Loader2 } from 'lucide-react';

interface AddFriendFormProps {
  onSendRequest: (email: string) => Promise<{ success: boolean }>;
}

const AddFriendForm: React.FC<AddFriendFormProps> = ({ onSendRequest }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    const result = await onSendRequest(email.trim());
    if (result.success) {
      setEmail('');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        placeholder="Geli email-ka saaxiibkaaga..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !email.trim()}>
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <UserPlus className="w-4 h-4 mr-2" />
            Dir
          </>
        )}
      </Button>
    </form>
  );
};

export default AddFriendForm;
