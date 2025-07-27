import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";

export function useAnonymousUser() {
  const queryClient = useQueryClient();
  
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/anonymous'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('anonymousSessionId');
      return await apiRequest('/api/auth/anonymous', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      });
    },
    onSuccess: (userData) => {
      // Store session ID for future requests
      if (userData?.sessionId) {
        localStorage.setItem('anonymousSessionId', userData.sessionId);
      }
    },
    retry: 1,
  });

  const createUser = useMutation({
    mutationFn: async () => {
      return await apiRequest('/api/auth/anonymous', {
        method: 'POST',
        body: JSON.stringify({ sessionId: null }),
      });
    },
    onSuccess: (userData) => {
      localStorage.setItem('anonymousSessionId', userData.sessionId);
      queryClient.setQueryData(['/api/auth/anonymous'], userData);
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