import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertBattleSchema } from "@shared/schema";
import { generatePrompt, generateAIResponse, evaluateBattle } from "./grok";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get or create a new guest user
  app.post("/api/users", async (req: Request, res: Response) => {
    const schema = z.object({
      username: z.string().min(1),
    });

    try {
      const { username } = schema.parse(req.body);
      const existingUser = await storage.getUserByUsername(username);
      
      if (existingUser) {
        return res.json(existingUser);
      }
      
      const newUser = await storage.createUser({
        username,
        password: "guest", // Default password for guest users
      });
      
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(400).json({ message: "Invalid request" });
    }
  });

  // Start a new battle
  app.post("/api/battles", async (req: Request, res: Response) => {
    const schema = z.object({
      opponentType: z.enum(["ai", "human"]).default("ai"),
      username: z.string().optional(),
    });

    try {
      const { opponentType, username } = schema.parse(req.body);
      
      // Get or create user
      let user;
      if (username && username !== "Guest" && username.trim() !== "") {
        // Normalize username (trim whitespace, limit length if needed)
        const normalizedUsername = username.trim().substring(0, 30);
        
        // Check for existing user with this username
        const existingUser = await storage.getUserByUsername(normalizedUsername);
        if (existingUser) {
          user = existingUser;
          console.log(`Using existing user: ${normalizedUsername}, ID: ${user.id}`);
        } else {
          // Create new user with this username
          user = await storage.createUser({
            username: normalizedUsername,
            password: "guest", // Default password for guest users
          });
          console.log(`Created new user: ${normalizedUsername}, ID: ${user.id}`);
        }
      } else {
        // Create anonymous user with unique name
        const guestUsername = `Guest_${Date.now().toString().slice(-6)}`;
        user = await storage.createUser({
          username: guestUsername,
          password: "guest",
        });
        console.log(`Created anonymous user: ${guestUsername}, ID: ${user.id}`);
      }
      
      // Generate creative prompt
      const prompt = await generatePrompt();
      
      // Create new battle
      const battle = await storage.createBattle({
        prompt,
        userId: user.id,
        opponentType,
        completed: false,
      });
      
      return res.status(201).json(battle);
    } catch (error) {
      console.error("Error creating battle:", error);
      return res.status(500).json({ message: "Failed to create battle" });
    }
  });

  // Get battle by ID
  app.get("/api/battles/:id", async (req: Request, res: Response) => {
    try {
      const battleId = Number(req.params.id);
      if (isNaN(battleId)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      const battle = await storage.getBattle(battleId);
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      return res.json(battle);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get battle" });
    }
  });

  // Submit user solution
  app.post("/api/battles/:id/submit", async (req: Request, res: Response) => {
    const schema = z.object({
      solution: z.string().min(10),
    });

    try {
      const battleId = Number(req.params.id);
      if (isNaN(battleId)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      const { solution } = schema.parse(req.body);
      
      // Get battle
      const battle = await storage.getBattle(battleId);
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      if (battle.completed) {
        return res.status(400).json({ message: "Battle already completed" });
      }
      
      // Update battle with user solution
      const updatedBattle = await storage.updateBattle(battleId, { 
        userSolution: solution,
      });
      
      // Generate AI solution
      const aiSolution = await generateAIResponse(battle.prompt);
      
      // Update battle with AI solution
      const battleWithAI = await storage.updateBattle(battleId, {
        aiSolution,
      });
      
      // Check if AI failed to generate a solution
      const isAIFailed = aiSolution.includes("The AI was unable to generate a solution at this time due to technical difficulties");
      
      // If AI failed, set user as winner with predefined scores
      if (isAIFailed) {
        console.log("AI failed to generate a response - user automatically wins");
      }
      
      // Evaluate battle
      const evaluation = await evaluateBattle({
        prompt: battle.prompt,
        userSolution: solution,
        aiSolution,
      });
      
      // Update battle with scores and completion
      const completedBattle = await storage.updateBattle(battleId, {
        userScore: evaluation.userScore.total,
        aiScore: evaluation.aiScore.total,
        userWon: evaluation.winner === "user",
        completed: true,
      });
      
      // Create score record
      const score = await storage.createScore({
        battleId,
        userOriginality: evaluation.userScore.originality,
        userLogic: evaluation.userScore.logic,
        userExpression: evaluation.userScore.expression,
        aiOriginality: evaluation.aiScore.originality,
        aiLogic: evaluation.aiScore.logic,
        aiExpression: evaluation.aiScore.expression,
        judgeFeedback: evaluation.judgeFeedback,
        userOriginalityFeedback: evaluation.userScore.originalityFeedback,
        userLogicFeedback: evaluation.userScore.logicFeedback,
        userExpressionFeedback: evaluation.userScore.expressionFeedback,
        aiOriginalityFeedback: evaluation.aiScore.originalityFeedback,
        aiLogicFeedback: evaluation.aiScore.logicFeedback,
        aiExpressionFeedback: evaluation.aiScore.expressionFeedback,
      });
      
      // Update leaderboard
      const user = await storage.getUser(battle.userId);
      if (user) {
        await storage.updateLeaderboard(user.username, battle.userId, evaluation.winner === "user");
      }
      
      return res.json({ success: true });
    } catch (error) {
      console.error("Error submitting solution:", error);
      return res.status(500).json({ message: "Failed to submit solution" });
    }
  });

  // Get battle results
  app.get("/api/battles/:id/results", async (req: Request, res: Response) => {
    try {
      const battleId = Number(req.params.id);
      if (isNaN(battleId)) {
        return res.status(400).json({ message: "Invalid battle ID" });
      }
      
      const battle = await storage.getBattle(battleId);
      if (!battle) {
        return res.status(404).json({ message: "Battle not found" });
      }
      
      if (!battle.completed) {
        return res.status(400).json({ message: "Battle not yet completed" });
      }
      
      const score = await storage.getScoreByBattleId(battleId);
      if (!score) {
        return res.status(404).json({ message: "Battle score not found" });
      }
      
      return res.json({ battle, scores: score });
    } catch (error) {
      return res.status(500).json({ message: "Failed to get battle results" });
    }
  });

  // Get leaderboard
  app.get("/api/leaderboard/:period", async (req: Request, res: Response) => {
    try {
      const period = req.params.period;
      const username = req.query.username as string | undefined;
      
      const leaderboard = await storage.getLeaderboard(period, username);
      return res.json(leaderboard);
    } catch (error) {
      return res.status(500).json({ message: "Failed to get leaderboard" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
