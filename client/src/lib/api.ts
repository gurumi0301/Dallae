import { apiRequest } from "./queryClient";
import type { 
  InsertEmotionEntry, 
  InsertChatMessage,
  EmotionEntry,
  ChatMessage,
  ChatSession 
} from "@shared/schema";

export interface EmotionAnalysisResult {
  emotion: string;
  confidence: number;
  intensity: number;
  comfortMessage: string;
}

export interface EmotionStats {
  totalDays: number;
  averageMood: number;
  emotionDistribution: Record<string, number>;
  weeklyMoodData: Array<{ day: string; mood: number; emotion: string }>;
  usageStats: {
    totalChats: number;
    diaryEntries: number;
    aiComforts: number;
    streakDays: number;
  };
  insights: string;
}

export const emotionApi = {
  analyze: async (content: string, userId: number): Promise<EmotionAnalysisResult> => {
    const response = await apiRequest('POST', '/api/emotions/analyze', { content, userId });
    return response.json();
  },

  getComfort: async (emotion: string, context?: string): Promise<{ message: string }> => {
    const response = await apiRequest('POST', '/api/ai/comfort', { emotion, context });
    return response.json();
  },
};

export const diaryApi = {
  create: async (entry: InsertEmotionEntry): Promise<EmotionEntry> => {
    const response = await apiRequest('POST', '/api/diary', entry);
    return response.json();
  },

  getUserEntries: async (userId: number): Promise<EmotionEntry[]> => {
    const response = await apiRequest('GET', `/api/diary/${userId}`);
    return response.json();
  },
};

export const statsApi = {
  getUserStats: async (userId: number): Promise<EmotionStats> => {
    const response = await apiRequest('GET', `/api/stats/${userId}`);
    return response.json();
  },
};

export const chatApi = {
  matchChat: async (userId: number): Promise<ChatSession> => {
    const response = await apiRequest('POST', '/api/chat/match', { userId });
    return response.json();
  },

  sendMessage: async (message: InsertChatMessage): Promise<ChatMessage> => {
    const response = await apiRequest('POST', '/api/chat/message', message);
    return response.json();
  },

  getMessages: async (sessionId: number): Promise<ChatMessage[]> => {
    const response = await apiRequest('GET', `/api/chat/${sessionId}/messages`);
    return response.json();
  },
};
