import { 
  users, emotionEntries, chatSessions, chatMessages, emotionAnalysis,
  type User, type InsertUser, type EmotionEntry, type InsertEmotionEntry,
  type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage,
  type EmotionAnalysis, type InsertEmotionAnalysis
} from "@shared/schema";
import { db } from "./db";
import { eq, and, isNull, desc, count, avg, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserBySessionId(sessionId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.sessionId, sessionId));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createEmotionEntry(entry: InsertEmotionEntry): Promise<EmotionEntry> {
    const [emotionEntry] = await db
      .insert(emotionEntries)
      .values(entry)
      .returning();
    return emotionEntry;
  }

  async getUserEmotionEntries(userId: number, limit = 50): Promise<EmotionEntry[]> {
    return await db
      .select()
      .from(emotionEntries)
      .where(eq(emotionEntries.userId, userId))
      .orderBy(desc(emotionEntries.createdAt))
      .limit(limit);
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
        totalChats: 0, // Will be implemented later
        diaryEntries: totalDays,
        aiComforts: 0, // Will be implemented later
        streakDays: Math.min(totalDays, 7),
      },
      insights: `최근 ${totalDays}일간의 평균 기분은 ${Math.round(averageMood)}점입니다.`
    };
  }

  async findAvailableChatSession(): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.isActive, true), isNull(chatSessions.user2Id)))
      .limit(1);
    return session || undefined;
  }

  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [chatSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return chatSession;
  }

  async joinChatSession(sessionId: number, userId: number): Promise<ChatSession> {
    const [session] = await db
      .update(chatSessions)
      .set({ user2Id: userId })
      .where(eq(chatSessions.id, sessionId))
      .returning();
    return session;
  }

  async getChatSession(sessionId: number): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));
    return session || undefined;
  }

  async getChatMessages(sessionId: number, limit = 50): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  async createEmotionAnalysis(analysis: InsertEmotionAnalysis): Promise<EmotionAnalysis> {
    const [emotionAnalysisResult] = await db
      .insert(emotionAnalysis)
      .values(analysis)
      .returning();
    return emotionAnalysisResult;
  }
}

export const storage = new DatabaseStorage();