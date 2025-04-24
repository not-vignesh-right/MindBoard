import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - simple storage for player information
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Battle schema - stores information about each creativity battle
export const battles = pgTable("battles", {
  id: serial("id").primaryKey(),
  prompt: text("prompt").notNull(),
  userId: integer("user_id").notNull(),
  userSolution: text("user_solution"),
  aiSolution: text("ai_solution"),
  userScore: integer("user_score"),
  aiScore: integer("ai_score"),
  userWon: boolean("user_won"),
  completed: boolean("completed").default(false),
  opponentType: text("opponent_type").default("ai"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBattleSchema = createInsertSchema(battles).omit({
  id: true,
  createdAt: true,
});

// Score schema - stores evaluation details for each battle
export const scores = pgTable("scores", {
  id: serial("id").primaryKey(),
  battleId: integer("battle_id").notNull(),
  userOriginality: integer("user_originality"),
  userLogic: integer("user_logic"),
  userExpression: integer("user_expression"),
  aiOriginality: integer("ai_originality"),
  aiLogic: integer("ai_logic"),
  aiExpression: integer("ai_expression"),
  judgeFeedback: text("judge_feedback"),
  userOriginalityFeedback: text("user_originality_feedback"),
  userLogicFeedback: text("user_logic_feedback"),
  userExpressionFeedback: text("user_expression_feedback"),
  aiOriginalityFeedback: text("ai_originality_feedback"),
  aiLogicFeedback: text("ai_logic_feedback"),
  aiExpressionFeedback: text("ai_expression_feedback"),
});

export const insertScoreSchema = createInsertSchema(scores).omit({
  id: true,
});

// Leaderboard schema - stores aggregated user stats
export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  username: text("username").notNull(),
  totalBattles: integer("total_battles").default(0),
  wins: integer("wins").default(0),
  winRate: integer("win_rate").default(0), // Store as integer (percentage * 100)
  avgScore: integer("avg_score").default(0),
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Battle = typeof battles.$inferSelect;
export type InsertBattle = z.infer<typeof insertBattleSchema>;

export type Score = typeof scores.$inferSelect;
export type InsertScore = z.infer<typeof insertScoreSchema>;

export type LeaderboardEntry = typeof leaderboard.$inferSelect;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;
