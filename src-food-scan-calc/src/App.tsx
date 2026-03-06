import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { UserProvider } from "@/context/UserContext";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import NotFound from "./pages/NotFound";
import Goals from "./pages/Goals";
import Auth from "./pages/Auth";
import Subscription from "./pages/Subscription";
import Friends from "./pages/Friends";
import Admin from "./pages/Admin";
import { PushNotificationPrompt } from "./components/PushNotificationPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename="/nutritrack">
      <UserProvider>
        <TooltipProvider delayDuration={0}>
          <Toaster />
          <Sonner />
          <Navigation />
          <PushNotificationPrompt />
          <main className="pt-16">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/friends" element={<Friends />} />
              <Route path="/subscription" element={<Subscription />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </TooltipProvider>
      </UserProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
