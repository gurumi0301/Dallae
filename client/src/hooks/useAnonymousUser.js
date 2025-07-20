import { useState, useEffect } from 'react';

export function useAnonymousUser() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeUser();
  }, []);

  const initializeUser = async () => {
    try {
      const sessionId = localStorage.getItem('anonymousSessionId');
      
      const response = await fetch('/api/auth/anonymous', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        localStorage.setItem('anonymousSessionId', userData.sessionId);
      }
    } catch (error) {
      console.error('Failed to initialize anonymous user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const createAnonymousUser = async () => {
    setIsLoading(true);
    await initializeUser();
  };

  return {
    user,
    isLoading,
    createAnonymousUser,
  };
}