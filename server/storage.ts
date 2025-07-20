import { 
  type User, type InsertUser, type EmotionEntry, type InsertEmotionEntry,
  type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage,
  type EmotionAnalysis, type InsertEmotionAnalysis
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserBySessionId(sessionId: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Emotion entry methods
  createEmotionEntry(entry: InsertEmotionEntry): Promise<EmotionEntry>;
  getUserEmotionEntries(userId: number, limit?: number): Promise<EmotionEntry[]>;
  getUserEmotionStats(userId: number): Promise<any>;
  
  // Chat methods
  findAvailableChatSession(): Promise<ChatSession | undefined>;
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  joinChatSession(sessionId: number, userId: number): Promise<ChatSession>;
  getChatSession(sessionId: number): Promise<ChatSession | undefined>;
  getChatMessages(sessionId: number, limit?: number): Promise<ChatMessage[]>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  
  // Emotion analysis methods
  createEmotionAnalysis(analysis: InsertEmotionAnalysis): Promise<EmotionAnalysis>;
}

export class MemoryStorage implements IStorage {
  private users = new Map<number, User>();
  private emotionEntries = new Map<number, EmotionEntry>();
  private chatSessions = new Map<number, ChatSession>();
  private chatMessages = new Map<number, ChatMessage>();
  private emotionAnalyses = new Map<number, EmotionAnalysis>();
  
  private nextUserId = 1;
  private nextEmotionEntryId = 1;
  private nextChatSessionId = 1;
  private nextChatMessageId = 1;
  private nextEmotionAnalysisId = 1;

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.sessionId === sessionId) {
        return user;
      }
    }
    return undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      id: this.nextUserId++,
      anonymousName: insertUser.anonymousName,
      sessionId: insertUser.sessionId,
      createdAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async createEmotionEntry(entry: InsertEmotionEntry): Promise<EmotionEntry> {
    const emotionEntry: EmotionEntry = {
      id: this.nextEmotionEntryId++,
      userId: entry.userId,
      emotion: entry.emotion,
      intensity: entry.intensity,
      content: entry.content || null,
      gratefulFor: entry.gratefulFor || null,
      tomorrowGoal: entry.tomorrowGoal || null,
      createdAt: new Date()
    };
    this.emotionEntries.set(emotionEntry.id, emotionEntry);
    return emotionEntry;
  }

  async getUserEmotionEntries(userId: number, limit = 50): Promise<EmotionEntry[]> {
    const entries = Array.from(this.emotionEntries.values())
      .filter(entry => entry.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return entries;
  }

  async getUserEmotionStats(userId: number): Promise<any> {
    const entries = await this.getUserEmotionEntries(userId, 30);
    
    if (entries.length === 0) {
      return {
        totalDays: 0,
        averageMood: 0,
        emotionDistribution: {},
        weeklyMoodData: [],
        usageStats: {
          totalChats: 0,
          diaryEntries: 0,
          aiComforts: 0,
          streakDays: 0,
        },
        insights: "아직 감정 기록이 없습니다. 첫 번째 감정을 기록해보세요!"
      };
    }

    const totalDays = entries.length;
    const averageMood = entries.reduce((sum, entry) => sum + entry.intensity, 0) / totalDays;
    
    const emotionDistribution: Record<string, number> = {};
    entries.forEach(entry => {
      emotionDistribution[entry.emotion] = (emotionDistribution[entry.emotion] || 0) + 1;
    });

    return {
      totalDays,
      averageMood: Math.round(averageMood * 10) / 10,
      emotionDistribution,
      weeklyMoodData: entries.slice(0, 7).map(entry => ({
        day: entry.createdAt.toLocaleDateString('ko-KR', { weekday: 'short' }),
        mood: entry.intensity,
        emotion: entry.emotion
      })),
      usageStats: {
        totalChats: 0,
        diaryEntries: totalDays,
        aiComforts: 0,
        streakDays: Math.min(totalDays, 7),
      },
      insights: `최근 ${totalDays}일간의 평균 기분은 ${Math.round(averageMood)}점입니다.`
    };
  }

  async findAvailableChatSession(): Promise<ChatSession | undefined> {
    for (const session of this.chatSessions.values()) {
      if (session.isActive && !session.user2Id) {
        return session;
      }
    }
    return undefined;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const chatSession: ChatSession = {
      id: this.nextChatSessionId++,
      user1Id: session.user1Id,
      user2Id: session.user2Id || null,
      isActive: session.isActive ?? true,
      createdAt: new Date(),
      endedAt: session.endedAt || null
    };
    this.chatSessions.set(chatSession.id, chatSession);
    return chatSession;
  }

  async joinChatSession(sessionId: number, userId: number): Promise<ChatSession> {
    const session = this.chatSessions.get(sessionId);
    if (!session) {
      throw new Error('Chat session not found');
    }
    session.user2Id = userId;
    return session;
  }

  async getChatSession(sessionId: number): Promise<ChatSession | undefined> {
    return this.chatSessions.get(sessionId);
  }

  async getChatMessages(sessionId: number, limit = 50): Promise<ChatMessage[]> {
    const messages = Array.from(this.chatMessages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
    return messages;
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const chatMessage: ChatMessage = {
      id: this.nextChatMessageId++,
      sessionId: message.sessionId,
      senderId: message.senderId,
      content: message.content,
      isAiMessage: message.isAiMessage ?? false,
      aiComfortType: message.aiComfortType || null,
      createdAt: new Date()
    };
    this.chatMessages.set(chatMessage.id, chatMessage);
    return chatMessage;
  }

  async createEmotionAnalysis(analysis: InsertEmotionAnalysis): Promise<EmotionAnalysis> {
    const emotionAnalysisResult: EmotionAnalysis = {
      id: this.nextEmotionAnalysisId++,
      userId: analysis.userId,
      content: analysis.content,
      detectedEmotion: analysis.detectedEmotion,
      confidence: analysis.confidence,
      aiResponse: analysis.aiResponse,
      createdAt: new Date()
    };
    this.emotionAnalyses.set(emotionAnalysisResult.id, emotionAnalysisResult);
    return emotionAnalysisResult;
  }
}

export const storage = new MemoryStorage();