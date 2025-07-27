import React from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Chat from "./pages/Chat";
import ChatRoom from "./pages/ChatRoom";
import Diary from "./pages/Diary";
import Recommendations from "./pages/Recommendations";
import RecommendationTab from "./pages/RecommendationTab";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import SettingsTab from "./pages/SettingsTab";
import Login from "./pages/Login";
import Register from "./pages/Register";
import PsychologyTest from "./pages/PsychologyTest";
import OnboardingScreen from "./components/OnboardingScreen";
import BottomNavigation from "./components/BottomNavigation";
import DesktopSidebar from "./components/DesktopSidebar";
import { useAnonymousUser } from "./hooks/useAnonymousUser";

function Router() {
  const [location] = useLocation();
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

  const isAuthPage = location.startsWith('/auth/');

  return (
    <div className={`app-container ${isAuthPage ? 'auth-layout' : ''}`}>
      {!isAuthPage && <DesktopSidebar />}
      <Switch>
        <Route path="/auth/login" component={Login} />
        <Route path="/auth/register" component={Register} />
        <Route path="/auth/psychology-test" component={PsychologyTest} />
        <Route path="/" component={Home} />
        <Route path="/chat/:type/:id" component={ChatRoom} />
        <Route path="/chat" component={Chat} />
        <Route path="/recommendations/:type" component={RecommendationTab} />
        <Route path="/recommendations" component={Recommendations} />
        <Route path="/diary" component={Diary} />
        <Route path="/profile" component={Profile} />
        <Route path="/settings/:type" component={SettingsTab} />
        <Route path="/settings" component={Settings} />
        <Route>
          <div className="error-page">
            <h2 className="error-title">페이지를 찾을 수 없습니다</h2>
            <p className="error-text">잘못된 주소입니다.</p>
          </div>
        </Route>
      </Switch>
      {!isAuthPage && <BottomNavigation />}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Router />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;