import { sql } from 'drizzle-orm';
import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
  boolean,
  jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// 사용자 테이블
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 50 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  realName: varchar("real_name", { length: 100 }).notNull(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 20 }),
  isVerified: boolean("is_verified").default(false),
  verificationToken: varchar("verification_token", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// 익명 사용자 테이블 (기존 시스템 유지)
export const anonymousUsers = pgTable("anonymous_users", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).unique().notNull(),
  anonymousName: varchar("anonymous_name", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 감정 기록 테이블
export const emotions = pgTable("emotions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  anonymousUserId: integer("anonymous_user_id"),
  emotion: varchar("emotion", { length: 50 }).notNull(),
  intensity: integer("intensity").notNull(),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow(),
});

// 심리검사 테이블
export const psychologyTests = pgTable("psychology_tests", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(), // JSON 형태로 질문들 저장
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// 심리검사 결과 테이블
export const psychologyTestResults = pgTable("psychology_test_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  testId: integer("test_id").notNull(),
  answers: jsonb("answers").notNull(), // JSON 형태로 답변들 저장
  results: jsonb("results").notNull(), // JSON 형태로 결과 저장
  score: integer("score"),
  completedAt: timestamp("completed_at").defaultNow(),
});

// 채팅 메시지 테이블 (기존 시스템 확장)
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id"),
  anonymousSenderId: integer("anonymous_sender_id"),
  receiverId: integer("receiver_id"),
  anonymousReceiverId: integer("anonymous_receiver_id"),
  message: text("message").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"),
  roomId: varchar("room_id", { length: 100 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod 스키마 생성
export const insertUserSchema = createInsertSchema(users, {
  username: z.string().min(3, "아이디는 3자 이상이어야 합니다").max(50),
  password: z.string().min(6, "비밀번호는 6자 이상이어야 합니다"),
  realName: z.string().min(2, "실명은 2자 이상이어야 합니다").max(100),
  email: z.string().email("올바른 이메일 형식이 아닙니다").optional(),
  phone: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  isVerified: true,
  verificationToken: true,
});

export const loginSchema = z.object({
  username: z.string().min(1, "아이디를 입력해주세요"),
  password: z.string().min(1, "비밀번호를 입력해주세요"),
});

export const insertAnonymousUserSchema = createInsertSchema(anonymousUsers).omit({
  id: true,
  createdAt: true,
});

export const insertEmotionSchema = createInsertSchema(emotions).omit({
  id: true,
  createdAt: true,
});

export const insertPsychologyTestResultSchema = createInsertSchema(psychologyTestResults).omit({
  id: true,
  completedAt: true,
});

// 타입 정의
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginUser = z.infer<typeof loginSchema>;
export type AnonymousUser = typeof anonymousUsers.$inferSelect;
export type InsertAnonymousUser = z.infer<typeof insertAnonymousUserSchema>;
export type Emotion = typeof emotions.$inferSelect;
export type InsertEmotion = z.infer<typeof insertEmotionSchema>;
export type PsychologyTest = typeof psychologyTests.$inferSelect;
export type PsychologyTestResult = typeof psychologyTestResults.$inferSelect;
export type InsertPsychologyTestResult = z.infer<typeof insertPsychologyTestResultSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;