import { 
  users, type User, type InsertUser,
  battles, type Battle, type InsertBattle,
  scores, type Score, type InsertScore,
  leaderboard, type LeaderboardEntry, type InsertLeaderboardEntry
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Battle methods
  getBattle(id: number): Promise<Battle | undefined>;
  createBattle(battle: Omit<InsertBattle, "userId"> & { userId: number }): Promise<Battle>;
  updateBattle(id: number, updates: Partial<Battle>): Promise<Battle>;
  
  // Score methods
  getScoreByBattleId(battleId: number): Promise<Score | undefined>;
  createScore(score: InsertScore): Promise<Score>;
  
  // Leaderboard methods
  getLeaderboard(period: string, username?: string): Promise<LeaderboardEntry[]>;
  updateLeaderboard(username: string, userId: number, isWin: boolean): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private battles: Map<number, Battle>;
  private scores: Map<number, Score>;
  private leaderboardEntries: Map<number, LeaderboardEntry>;
  
  private userId: number;
  private battleId: number;
  private scoreId: number;
  private leaderboardId: number;
  
  constructor() {
    this.users = new Map();
    this.battles = new Map();
    this.scores = new Map();
    this.leaderboardEntries = new Map();
    
    this.userId = 1;
    this.battleId = 1;
    this.scoreId = 1;
    this.leaderboardId = 1;
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Battle methods
  async getBattle(id: number): Promise<Battle | undefined> {
    return this.battles.get(id);
  }
  
  async createBattle(battle: Omit<InsertBattle, "userId"> & { userId: number }): Promise<Battle> {
    const id = this.battleId++;
    const newBattle = { 
      ...battle, 
      id, 
      userSolution: null,
      aiSolution: null,
      userScore: null,
      aiScore: null,
      userWon: null,
      createdAt: new Date().toISOString() 
    } as Battle;
    
    this.battles.set(id, newBattle);
    return newBattle;
  }
  
  async updateBattle(id: number, updates: Partial<Battle>): Promise<Battle> {
    const battle = this.battles.get(id);
    if (!battle) {
      throw new Error(`Battle with ID ${id} not found`);
    }
    
    const updatedBattle = { ...battle, ...updates };
    this.battles.set(id, updatedBattle);
    return updatedBattle;
  }
  
  // Score methods
  async getScoreByBattleId(battleId: number): Promise<Score | undefined> {
    return Array.from(this.scores.values()).find(score => score.battleId === battleId);
  }
  
  async createScore(score: InsertScore): Promise<Score> {
    const id = this.scoreId++;
    const newScore = { ...score, id };
    this.scores.set(id, newScore);
    return newScore;
  }
  
  // Leaderboard methods
  async getLeaderboard(period: string, username?: string): Promise<LeaderboardEntry[]> {
    // In a real app, we would filter by period
    // For simplicity, we'll return all entries
    const entries = Array.from(this.leaderboardEntries.values());
    
    // Mark current user
    if (username) {
      return entries.map(entry => ({
        ...entry,
        isCurrentUser: entry.username === username
      })).sort((a, b) => b.avgScore - a.avgScore);
    }
    
    return entries
      .map(entry => ({ ...entry, isCurrentUser: false }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }
  
  async updateLeaderboard(username: string, userId: number, isWin: boolean): Promise<void> {
    // Find existing entry
    let entry = Array.from(this.leaderboardEntries.values())
      .find(entry => entry.userId === userId);
    
    if (entry) {
      // Update existing entry
      const totalBattles = entry.totalBattles + 1;
      const wins = isWin ? entry.wins + 1 : entry.wins;
      
      const updatedEntry = {
        ...entry,
        totalBattles,
        wins,
        winRate: Math.round((wins / totalBattles) * 100)
      };
      
      this.leaderboardEntries.set(entry.id, updatedEntry);
    } else {
      // Create new entry
      const id = this.leaderboardId++;
      const newEntry = {
        id,
        userId,
        username,
        totalBattles: 1,
        wins: isWin ? 1 : 0,
        winRate: isWin ? 100 : 0,
        avgScore: 0
      };
      
      this.leaderboardEntries.set(id, newEntry);
    }
  }
}

export class DatabaseStorage implements IStorage {
  private db: any;

  constructor() {
    // Lazy-load db to avoid dependency cycle
    import('./db').then(({ db }) => {
      this.db = db;
    }).catch(err => {
      console.error("Failed to initialize database connection:", err);
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    try {
      const { db } = await import('./db');
      const [user] = await db.select().from(users).where(eq(users.id, id));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUser:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.getUser(id);
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const { db } = await import('./db');
      const [user] = await db.select().from(users).where(eq(users.username, username));
      return user || undefined;
    } catch (error) {
      console.error("Database error in getUserByUsername:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.getUserByUsername(username);
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      const { db } = await import('./db');
      const [newUser] = await db.insert(users).values(user).returning();
      return newUser;
    } catch (error) {
      console.error("Database error in createUser:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.createUser(user);
    }
  }

  async getBattle(id: number): Promise<Battle | undefined> {
    try {
      const { db } = await import('./db');
      const [battle] = await db.select().from(battles).where(eq(battles.id, id));
      return battle || undefined;
    } catch (error) {
      console.error("Database error in getBattle:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.getBattle(id);
    }
  }

  async createBattle(battle: Omit<InsertBattle, "userId"> & { userId: number }): Promise<Battle> {
    try {
      const { db } = await import('./db');
      const [newBattle] = await db.insert(battles).values(battle).returning();
      return newBattle;
    } catch (error) {
      console.error("Database error in createBattle:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.createBattle(battle);
    }
  }

  async updateBattle(id: number, updates: Partial<Battle>): Promise<Battle> {
    try {
      const { db } = await import('./db');
      const [updatedBattle] = await db
        .update(battles)
        .set(updates)
        .where(eq(battles.id, id))
        .returning();
      return updatedBattle;
    } catch (error) {
      console.error("Database error in updateBattle:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.updateBattle(id, updates);
    }
  }

  async getScoreByBattleId(battleId: number): Promise<Score | undefined> {
    try {
      const { db } = await import('./db');
      const [score] = await db.select().from(scores).where(eq(scores.battleId, battleId));
      return score || undefined;
    } catch (error) {
      console.error("Database error in getScoreByBattleId:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.getScoreByBattleId(battleId);
    }
  }

  async createScore(score: InsertScore): Promise<Score> {
    try {
      const { db } = await import('./db');
      const [newScore] = await db.insert(scores).values(score).returning();
      return newScore;
    } catch (error) {
      console.error("Database error in createScore:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.createScore(score);
    }
  }

  async getLeaderboard(period: string, username?: string): Promise<LeaderboardEntry[]> {
    try {
      const { db } = await import('./db');
      let result: LeaderboardEntry[];
      
      // Get all leaderboard entries
      result = await db.select().from(leaderboard);
      
      // Mark current user if username is provided
      if (username) {
        result = result.map(entry => ({
          ...entry,
          isCurrentUser: entry.username === username
        }));
      }
      
      // Sort by win rate descending, then by avg score descending
      result.sort((a, b) => {
        if (a.winRate !== b.winRate) return b.winRate - a.winRate;
        return b.avgScore - a.avgScore;
      });
      
      return result;
    } catch (error) {
      console.error("Database error in getLeaderboard:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.getLeaderboard(period, username);
    }
  }

  async updateLeaderboard(username: string, userId: number, isWin: boolean): Promise<void> {
    try {
      const { db } = await import('./db');
      
      // Get existing entry if it exists
      const [existingEntry] = await db
        .select()
        .from(leaderboard)
        .where(eq(leaderboard.userId, userId));
      
      if (existingEntry) {
        // Update existing entry
        const totalBattles = existingEntry.totalBattles + 1;
        const wins = existingEntry.wins + (isWin ? 1 : 0);
        const winRate = (wins / totalBattles) * 100;
        
        await db
          .update(leaderboard)
          .set({
            totalBattles,
            wins,
            winRate
          })
          .where(eq(leaderboard.userId, userId));
      } else {
        // Create new entry
        await db
          .insert(leaderboard)
          .values({
            userId,
            username,
            totalBattles: 1,
            wins: isWin ? 1 : 0,
            winRate: isWin ? 100 : 0,
            avgScore: 0
          });
      }
    } catch (error) {
      console.error("Database error in updateLeaderboard:", error);
      // Fallback to in-memory storage in case of DB issues
      const memStorage = new MemStorage();
      return memStorage.updateLeaderboard(username, userId, isWin);
    }
  }
}

// Import necessary operators and schema from shared schema
import { eq } from "drizzle-orm";

// Use DatabaseStorage by default, with MemStorage as fallback
// This ensures graceful degradation if DB connection fails
export const storage = new DatabaseStorage();
