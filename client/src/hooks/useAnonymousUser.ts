import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

export function useAnonymousUser() {
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ['/api/user/current'],
    queryFn: async () => {
      const sessionId = localStorage.getItem('anonymousSessionId');
      if (!sessionId) return null;
      
      try {
        const response = await apiRequest('POST', '/api/auth/anonymous', { sessionId });
        const userData = await response.json();
        return userData;
      } catch (error) {
        console.error('Failed to get user:', error);
        return null;
      }
    },
  });

  const createAnonymousUser = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/anonymous', {});
      return response.json();
    },
    onSuccess: (userData: User) => {
      localStorage.setItem('anonymousSessionId', userData.sessionId);
      queryClient.setQueryData(['/api/user/current'], userData);
    },
  });

  // Create user if none exists
  if (!user && !isLoading && !createAnonymousUser.isPending) {
    createAnonymousUser.mutate();
  }

  return {
    user,
    isLoading: isLoading || createAnonymousUser.isPending,
    createUser: createAnonymousUser.mutate,
  };
}
