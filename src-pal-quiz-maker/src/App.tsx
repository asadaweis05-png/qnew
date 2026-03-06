import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CreateQuiz from "./pages/CreateQuiz";
import TakeQuiz from "./pages/TakeQuiz";
import ShareQuiz from "./pages/ShareQuiz";
import Results from "./pages/Results";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import QuizAnswers from "./pages/QuizAnswers";
import Chat from "./pages/Chat";
import Football from "./pages/Football";
import News from "./pages/News";
import MakeupTest from "./pages/MakeupTest";
import AdminNotifications from "./pages/AdminNotifications";
import NotFound from "./pages/NotFound";
import { NotificationPrompt } from "./components/NotificationPrompt";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <NotificationPrompt />
      <BrowserRouter basename="/pal-quiz-maker/">
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/create" element={<CreateQuiz />} />
          <Route path="/quiz/:code" element={<TakeQuiz />} />
          <Route path="/share/:code" element={<ShareQuiz />} />
          <Route path="/results/:quizId/:score/:total" element={<Results />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/quiz-answers/:code" element={<QuizAnswers />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/football" element={<Football />} />
          <Route path="/news" element={<News />} />
          <Route path="/makeup" element={<MakeupTest />} />
          <Route path="/admin/notifications" element={<AdminNotifications />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
