import { 
  users, emotionEntries, chatSessions, chatMessages, emotionAnalysis
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and, isNull, desc, count, avg, sql } from "drizzle-orm";

export class DatabaseStorage {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserBySessionId(sessionId) {
    const [user] = await db.select().from(users).where(eq(users.sessionId, sessionId));
    return user || undefined;
  }

  async createUser(insertUser) {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createEmotionEntry(entry) {
    const [emotionEntry] = await db
      .insert(emotionEntries)
      .values(entry)
      .returning();
    return emotionEntry;
  }

  async getUserEmotionEntries(userId, limit = 50) {
    return await db
      .select()
      .from(emotionEntries)
      .where(eq(emotionEntries.userId, userId))
      .orderBy(desc(emotionEntries.createdAt))
      .limit(limit);
  }

  async getUserEmotionStats(userId) {
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
    
    const emotionDistribution = {};
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

  async findAvailableChatSession() {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(and(eq(chatSessions.isActive, true), isNull(chatSessions.user2Id)))
      .limit(1);
    return session || undefined;
  }

  async createChatSession(session) {
    const [chatSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return chatSession;
  }

  async joinChatSession(sessionId, userId) {
    const [session] = await db
      .update(chatSessions)
      .set({ user2Id: userId })
      .where(eq(chatSessions.id, sessionId))
      .returning();
    return session;
  }

  async getChatSession(sessionId) {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));
    return session || undefined;
  }

  async getChatMessages(sessionId, limit = 50) {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(limit);
  }

  async createChatMessage(message) {
    const [chatMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return chatMessage;
  }

  async createEmotionAnalysis(analysis) {
    const [emotionAnalysisResult] = await db
      .insert(emotionAnalysis)
      .values(analysis)
      .returning();
    return emotionAnalysisResult;
  }
}

export const storage = new DatabaseStorage();