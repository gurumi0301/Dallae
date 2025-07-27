import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import Diary from "./pages/Diary";
import Stats from "./pages/Stats";
import OnboardingScreen from "./components/OnboardingScreen";
import BottomNavigation from "./components/BottomNavigation";
import { useAnonymousUser } from "./hooks/useAnonymousUser";

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
      <div className="app-container">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p className="loading-text">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="app-container">
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/chat" component={Chat} />
        <Route path="/chat/:sessionId" component={Chat} />
        <Route path="/diary" component={Diary} />
        <Route path="/stats" component={Stats} />
        <Route>
          <div className="error-page">
            <h2 className="error-title">페이지를 찾을 수 없습니다</h2>
            <p className="error-text">잘못된 주소입니다.</p>
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
      <Router />
    </QueryClientProvider>
  );
}

export default App;