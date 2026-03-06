
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { usePageTracking } from './hooks/usePageTracking';
import Index from './pages/Index';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import Leaderboard from './pages/Leaderboard';
import ProfilePage from './pages/ProfilePage';
import './App.css';

function App() {
  // Initialize analytics page tracking
  usePageTracking();
  
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/play" element={<Index />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
