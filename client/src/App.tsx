import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import Home from "@/pages/Home";
import Chat from "@/pages/Chat";
import Diary from "@/pages/Diary";
import Stats from "@/pages/Stats";
import OnboardingScreen from "@/components/OnboardingScreen";
import BottomNavigation from "@/components/BottomNavigation";
import { useAnonymousUser } from "@/hooks/useAnonymousUser";

function Router() {
  const [showOnboarding, setShowOnboarding] = useState(true);
  const { user, isLoading } = useAnonymousUser();

  useEffect(() => {
    // Show onboarding only for first-time users
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (hasSeenOnboarding && user) {
      setShowOnboarding(false);
    }
  }, [user]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-sm mx-auto bg-white shadow-2xl min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-green-400 rounded-full mx-auto mb-4 animate-pulse"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="max-w-sm mx-auto bg-white shadow-2xl min-h-screen relative overflow-hidden">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/chat" component={Chat} />
        <Route path="/chat/:sessionId" component={Chat} />
        <Route path="/diary" component={Diary} />
        <Route path="/stats" component={Stats} />
        <Route>
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">페이지를 찾을 수 없습니다</h2>
            <p className="text-gray-600">잘못된 주소입니다.</p>
          </div>
        </Route>
      </Switch>
      <BottomNavigation />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
