import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  anonymousName: text("anonymous_name").notNull(),
  sessionId: text("session_id").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emotionEntries = pgTable("emotion_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  emotion: text("emotion").notNull(), // happy, sad, angry, anxious, excited, tired, etc.
  intensity: integer("intensity").notNull(), // 1-10 scale
  content: text("content"), // diary content
  gratefulFor: text("grateful_for"),
  tomorrowGoal: text("tomorrow_goal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  user1Id: integer("user1_id").references(() => users.id).notNull(),
  user2Id: integer("user2_id").references(() => users.id),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at"),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id).notNull(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  isAiMessage: boolean("is_ai_message").default(false).notNull(),
  aiComfortType: text("ai_comfort_type"), // emotion_analysis, comfort, encouragement
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emotionAnalysis = pgTable("emotion_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  content: text("content").notNull(),
  detectedEmotion: text("detected_emotion").notNull(),
  confidence: integer("confidence").notNull(), // 0-100
  aiResponse: text("ai_response").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  emotionEntries: many(emotionEntries),
  chatSessions1: many(chatSessions, { relationName: "user1" }),
  chatSessions2: many(chatSessions, { relationName: "user2" }),
  chatMessages: many(chatMessages),
  emotionAnalyses: many(emotionAnalysis),
}));

export const emotionEntriesRelations = relations(emotionEntries, ({ one }) => ({
  user: one(users, {
    fields: [emotionEntries.userId],
    references: [users.id],
  }),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user1: one(users, {
    fields: [chatSessions.user1Id],
    references: [users.id],
    relationName: "user1",
  }),
  user2: one(users, {
    fields: [chatSessions.user2Id],
    references: [users.id],
    relationName: "user2",
  }),
  messages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
  sender: one(users, {
    fields: [chatMessages.senderId],
    references: [users.id],
  }),
}));

export const emotionAnalysisRelations = relations(emotionAnalysis, ({ one }) => ({
  user: one(users, {
    fields: [emotionAnalysis.userId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionEntrySchema = createInsertSchema(emotionEntries).omit({
  id: true,
  createdAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  endedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionAnalysisSchema = createInsertSchema(emotionAnalysis).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type EmotionEntry = typeof emotionEntries.$inferSelect;
export type InsertEmotionEntry = z.infer<typeof insertEmotionEntrySchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type EmotionAnalysis = typeof emotionAnalysis.$inferSelect;
export type InsertEmotionAnalysis = z.infer<typeof insertEmotionAnalysisSchema>;
