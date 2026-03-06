
import React from 'react';
import { useNavigate } from 'react-router-dom';
import UserProfile from '@/components/UserProfile';
import { useAuth } from '@/hooks/useAuth';

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <UserProfile user={user} />
    </div>
  );
};

export default ProfilePage;
