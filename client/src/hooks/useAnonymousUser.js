import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export function useAnonymousUser() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/anonymous'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('anonymousSessionId');
      const userData = await apiRequest('/api/auth/anonymous', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
      
      // Store session ID for future requests
      if (userData?.sessionId) {
        localStorage.setItem('anonymousSessionId', userData.sessionId);
      }
      
      return userData;
    },
    retry: 1,
  });

  const createUser = useMutation({
    mutationFn: async () => {
      const userData = await apiRequest('/api/auth/anonymous', {
        method: 'POST',
        body: JSON.stringify({ sessionId: null }),
      });
      
      localStorage.setItem('anonymousSessionId', userData.sessionId);
      queryClient.setQueryData(['/api/auth/anonymous'], userData);
      
      return userData;
    },
  });

  return {
    user,
    isLoading,
    error,
    createUser: createUser.mutate,
    isCreating: createUser.isPending,
  };
}