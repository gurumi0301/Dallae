import { 
  users, anonymousUsers, emotions, chatMessages
} from "../shared/schema.js";
import { db } from "./db.js";
import { eq, and, isNull, desc, count, avg, sql } from "drizzle-orm";

export class DatabaseStorage {
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserBySessionId(sessionId) {
    const [user] = await db.select().from(anonymousUsers).where(eq(anonymousUsers.sessionId, sessionId));
    return user || undefined;
  }

  async createUser(insertUser) {
    const [user] = await db
      .insert(anonymousUsers)
      .values(insertUser)
      .returning();
    return user;
  }

  async createEmotionEntry(entry) {
    const [emotionEntry] = await db
      .insert(emotions)
      .values(entry)
      .returning();
    return emotionEntry;
  }

  async getUserEmotionEntries(userId, limit = 50) {
    return await db
      .select()
      .from(emotions)
      .where(eq(emotions.anonymousUserId, userId))
      .orderBy(desc(emotions.createdAt))
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

  // 채팅 세션 관련 메서드들은 향후 구현 예정
  async findAvailableChatSession() {
    // 임시로 null 반환
    return null;
  }

  async createChatSession(session) {
    // 임시 구현
    return { id: Date.now(), ...session };
  }

  async joinChatSession(sessionId, userId) {
    // 임시 구현
    return { id: sessionId, user2Id: userId };
  }

  async getChatSession(sessionId) {
    // 임시 구현
    return { id: sessionId, isActive: true };
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