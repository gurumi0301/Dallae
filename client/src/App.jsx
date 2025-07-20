import { Router, Route, Switch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useAnonymousUser } from "./hooks/useAnonymousUser.js";

import Home from "./pages/Home.jsx";
import Chat from "./pages/Chat.jsx";
import Diary from "./pages/Diary.jsx";
import Stats from "./pages/Stats.jsx";
import NotFound from "./pages/not-found.jsx";
import BottomNavigation from "./components/BottomNavigation.jsx";
import OnboardingScreen from "./components/OnboardingScreen.jsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { user, isLoading, createAnonymousUser } = useAnonymousUser();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    // Show onboarding for new users (when no session ID exists)
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    if (!hasSeenOnboarding && !isLoading && !user) {
      setShowOnboarding(true);
    }
  }, [user, isLoading]);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    createAnonymousUser();
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-soft-blue-200 border-t-soft-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="app-container">
        <Router>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/chat/:sessionId?" component={Chat} />
            <Route path="/diary" component={Diary} />
            <Route path="/stats" component={Stats} />
            <Route component={NotFound} />
          </Switch>
          <BottomNavigation />
        </Router>
      </div>
    </QueryClientProvider>
  );
}

export default App;