import OpenAI from "openai";
import { EvaluationRequest, EvaluationResponse } from "@/lib/types";

// Configure xAI client (uses OpenAI library with custom baseURL)
const xai = new OpenAI({ 
  baseURL: "https://api.x.ai/v1", 
  apiKey: process.env.XAI_API_KEY,
  timeout: 60000, // 60 seconds timeout
  maxRetries: 3   // Retry up to 3 times
});

// Set this to false to use the API with real calls
// Set this to true for testing without API calls
const FORCE_OFFLINE_MODE = false;

// Log API key status (without revealing the key)
console.log("xAI API Key Status:", process.env.XAI_API_KEY ? "Present" : "Missing");
console.log("Offline Mode:", FORCE_OFFLINE_MODE ? "Enabled" : "Disabled");

/**
 * Generate a creative prompt for a battle
 */
export async function generatePrompt(): Promise<string> {
  // Fallback prompts in case the API fails or in offline mode
  const fallbackPrompts = [
    "Design a flying classroom that can travel anywhere in the world",
    "Create a device that helps people remember their dreams",
    "Invent a new sport that combines three existing sports",
    "Design a restaurant concept for the year 2050",
    "Create a new musical instrument that uses unconventional materials",
    "Design a sustainable home that could exist in extreme weather conditions",
    "Invent a new holiday and its traditions",
    "Create a transportation system for a city built underwater",
    "Design a device that translates animal communication into human language",
    "Create a new form of art that engages all five senses",
    "Design an AI assistant for elderly people living alone",
    "Create a solution for managing e-waste in urban environments",
    "Design a novel renewable energy technology for individual homes",
    "Invent a new type of social media platform focused on meaningful connections",
    "Design a futuristic learning tool for teaching complex topics to children",
    "Create a system that helps people develop healthy habits",
    "Design a device that enhances human productivity through neural interfaces",
    "Create a new form of agriculture suitable for Mars colonization",
    "Design a digital tool that preserves indigenous knowledge and languages",
    "Invent a new encryption method using biological principles"
  ];
  
  // If in offline mode, use fallback prompts without API call
  if (FORCE_OFFLINE_MODE) {
    console.log("Using offline mode for prompt generation");
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  }
  
  try {
    // Use Grok to generate a creative prompt
    const response = await xai.chat.completions.create({
      model: "grok-2-1212", 
      messages: [
        { 
          role: "system", 
          content: "Generate ONE creative prompt (maximum 15 words). Only output the prompt." 
        }
      ],
      temperature: 0.7,
      max_tokens: 30
    });

    return response.choices[0]?.message?.content?.trim() || fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  } catch (error) {
    console.error("Error generating prompt:", error);
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  }
}

/**
 * Generate an AI response to a prompt
 */
export async function generateAIResponse(prompt: string): Promise<string> {
  // Define a fallback AI response content
  const fallbackResponse = "The AI was unable to generate a solution at this time due to technical difficulties. According to the rules, when AI fails to generate a response, the user automatically wins this round.";
  
  // Custom responses for each prompt to ensure relevance
  const promptResponses: Record<string, string[]> = {
    "Design a flying classroom that can travel anywhere in the world": [
      "My design for a flying classroom combines aerodynamic principles with educational functionality. The structure uses lightweight carbon fiber materials with retractable wings powered by sustainable electric engines. Inside, reconfigurable learning spaces adapt to different teaching styles with smart boards, breakout pods, and observation decks. The classroom features AR windows that overlay information about locations below, transforming geography lessons into immersive experiences. Solar panels and wind turbines provide sustainable energy, while satellite connectivity ensures students remain connected to educational resources worldwide."
    ],
    // Other prompt responses omitted for brevity
  };
  
  // Generic responses for prompts without specific responses
  const genericResponses = [
    "My solution addresses this challenge through a multi-layered approach that balances innovation with practicality. I've designed a system that adapts to various user needs while maintaining core functionality. The implementation uses sustainable materials and energy-efficient processes to minimize environmental impact. I've incorporated feedback mechanisms to ensure continuous improvement based on real-world usage. The modular architecture allows for customization across different contexts while maintaining a cohesive user experience. This approach solves the immediate challenge while creating a foundation for future developments."
  ];
  
  // If in offline mode, use appropriate responses for the prompt
  if (FORCE_OFFLINE_MODE) {
    console.log("Using offline mode for AI response generation");
    
    // Check if we have specific responses for this prompt
    if (prompt in promptResponses) {
      // Use a response specific to this prompt
      const specificResponses = promptResponses[prompt];
      return specificResponses[Math.floor(Math.random() * specificResponses.length)];
    } else {
      // Use a generic response for prompts we don't have specific answers for
      return genericResponses[Math.floor(Math.random() * genericResponses.length)];
    }
  }
  
  // Check if we have an API key before attempting to call xAI
  if (!process.env.XAI_API_KEY) {
    console.error("Error: xAI API key is missing");
    return fallbackResponse;
  }
  
  try {
    console.log("Generating AI response for prompt:", prompt.substring(0, 30) + "...");
    
    // Use Grok model with minimal prompt and token usage
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { 
          role: "system", 
          content: "Be creative. Write a brief solution (120-150 words) to the prompt. Be original and practical." 
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const aiResponse = response.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      console.error("Empty response received from xAI");
      return fallbackResponse;
    }
    
    return aiResponse;
  } catch (error: any) {
    console.error("Error generating AI response:", error);
    
    // Check for specific error types and handle accordingly
    if (error.code === 'invalid_api_key') {
      console.error("Invalid API key. Please check your xAI API key.");
    } else if (error.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    } else if (error.status === 500 || error.status === 503) {
      console.error("xAI service is temporarily unavailable.");
    }
    
    return fallbackResponse;
  }
}

/**
 * Evaluate user and AI solutions
 */
export async function evaluateBattle(data: EvaluationRequest): Promise<EvaluationResponse> {
  // Check if AI had technical difficulties before attempting evaluation
  const isAIFailed = data.aiSolution.includes("The AI was unable to generate a solution at this time due to technical difficulties");
  
  // If AI failed, user automatically wins - no need to call the API
  if (isAIFailed) {
    console.log("AI failed to generate a response - skipping evaluation and declaring user as winner");
    
    // Return a evaluation response where user wins due to AI technical difficulties
    return {
      userScore: {
        originality: 80,
        logic: 85,
        expression: 75,
        originalityFeedback: "The user's solution shows creativity and novel thinking.",
        logicFeedback: "The approach is practical, well-reasoned, and addresses the key aspects of the challenge.",
        expressionFeedback: "The solution is clearly articulated and engaging.",
        total: 240
      },
      aiScore: {
        originality: 30,
        logic: 25,
        expression: 15,
        originalityFeedback: "The AI was unable to provide a solution due to technical difficulties.",
        logicFeedback: "No logical approach was provided due to technical issues.",
        expressionFeedback: "No proper expression due to technical failure.",
        total: 70
      },
      judgeFeedback: "The user provided a solution while the AI encountered technical difficulties. The user automatically wins this round.",
      winner: "user"
    };
  }
  
  // Helper function to create a fallback evaluation when API calls fail
  function createFallbackEvaluation(data: EvaluationRequest, userWins: boolean): EvaluationResponse {
    // Random scores with some variance but ensuring the winner has higher total
    const userOriginalityScore = Math.floor(Math.random() * 20) + (userWins ? 75 : 60);
    const userLogicScore = Math.floor(Math.random() * 20) + (userWins ? 70 : 60);
    const userExpressionScore = Math.floor(Math.random() * 20) + (userWins ? 70 : 55);
    
    const aiOriginalityScore = Math.floor(Math.random() * 20) + (userWins ? 60 : 75);
    const aiLogicScore = Math.floor(Math.random() * 20) + (userWins ? 55 : 75);
    const aiExpressionScore = Math.floor(Math.random() * 20) + (userWins ? 50 : 70);
    
    // Calculate totals
    const userTotal = userOriginalityScore + userLogicScore + userExpressionScore;
    const aiTotal = aiOriginalityScore + aiLogicScore + aiExpressionScore;
    
    // Feedback options for categories
    const feedbackOptions = {
      user: {
        win: {
          originality: [
            "Your solution demonstrates exceptional creativity and innovative thinking that addresses the challenge in original ways."
          ],
          logic: [
            "Your solution is well-structured with a clear practical approach and thoughtful implementation details."
          ],
          expression: [
            "Your idea is communicated with clarity and engaging language that makes the concept easy to understand."
          ]
        },
        lose: {
          originality: [
            "Your solution contains interesting elements but follows somewhat predictable patterns."
          ],
          logic: [
            "Your approach has logical merit but could benefit from more detailed consideration of practical challenges."
          ],
          expression: [
            "Your expression is adequate but could be more refined for better clarity and engagement."
          ]
        }
      },
      ai: {
        win: {
          originality: [
            "The AI solution demonstrates creative thinking and novel approaches to the challenge."
          ],
          logic: [
            "The AI approach is well-structured with practical implementation details and sound reasoning."
          ],
          expression: [
            "The AI solution is clearly communicated with engaging language and effective structure."
          ]
        },
        lose: {
          originality: [
            "The AI solution contains some creative elements but lacks the originality of your approach."
          ],
          logic: [
            "The AI solution has a reasonable logical structure but doesn't match the practicality of your solution."
          ],
          expression: [
            "The AI expression is competent but lacks the clarity and engagement of your solution."
          ]
        }
      },
      judgment: {
        userWins: [
          "Your solution stands out with its originality and practical approach. You've demonstrated creative thinking while maintaining feasibility and clear communication."
        ],
        aiWins: [
          "The AI solution shows a strong balance of creativity, logical structure and clear expression. Keep developing your own unique approach for next time!"
        ]
      }
    };
    
    // Select feedback based on winner
    const userOriginalityFeedback = userWins ? 
      feedbackOptions.user.win.originality[0] : 
      feedbackOptions.user.lose.originality[0];
    
    const userLogicFeedback = userWins ? 
      feedbackOptions.user.win.logic[0] : 
      feedbackOptions.user.lose.logic[0];
    
    const userExpressionFeedback = userWins ? 
      feedbackOptions.user.win.expression[0] : 
      feedbackOptions.user.lose.expression[0];
    
    const aiOriginalityFeedback = userWins ? 
      feedbackOptions.ai.lose.originality[0] : 
      feedbackOptions.ai.win.originality[0];
    
    const aiLogicFeedback = userWins ? 
      feedbackOptions.ai.lose.logic[0] : 
      feedbackOptions.ai.win.logic[0];
    
    const aiExpressionFeedback = userWins ? 
      feedbackOptions.ai.lose.expression[0] : 
      feedbackOptions.ai.win.expression[0];
    
    const judgeFeedback = userWins
      ? feedbackOptions.judgment.userWins[0]
      : feedbackOptions.judgment.aiWins[0];
    
    return {
      userScore: {
        originality: userOriginalityScore,
        logic: userLogicScore,
        expression: userExpressionScore,
        originalityFeedback: userOriginalityFeedback,
        logicFeedback: userLogicFeedback,
        expressionFeedback: userExpressionFeedback,
        total: userTotal
      },
      aiScore: {
        originality: aiOriginalityScore,
        logic: aiLogicScore,
        expression: aiExpressionScore,
        originalityFeedback: aiOriginalityFeedback,
        logicFeedback: aiLogicFeedback,
        expressionFeedback: aiExpressionFeedback,
        total: aiTotal
      },
      judgeFeedback: judgeFeedback,
      winner: userWins ? "user" : "ai"
    };
  }
  
  // If in offline mode, use a random evaluation with user winning most of the time (80%)
  if (FORCE_OFFLINE_MODE) {
    console.log("Using offline mode for battle evaluation");
    
    // Check if the user's solution is insufficient (less than 20 characters)
    if (!data.userSolution || data.userSolution.trim().length < 20) {
      console.log("User solution is too short, AI wins");
      return createFallbackEvaluation(data, false);
    }
    
    // Randomly determine if the user wins (80% chance to win) to make it more engaging
    const userWins = Math.random() < 0.8;
    return createFallbackEvaluation(data, userWins);
  }
  
  // Check if we have an API key before attempting to call xAI
  if (!process.env.XAI_API_KEY) {
    console.error("Error: xAI API key is missing");
    return createFallbackEvaluation(data, true);
  }
  
  try {
    console.log("Evaluating battle using Grok...");
    
    // Use Grok to evaluate the solutions
    const response = await xai.chat.completions.create({
      model: "grok-2-1212",
      messages: [
        { 
          role: "system", 
          content: `Rate two creative solutions. For each, score:
          1. Originality (0-100)
          2. Logic (0-100)
          3. Expression (0-100)
          Add brief feedback for each category. Calculate total score. Higher score wins. Output JSON only.`
        },
        {
          role: "user",
          content: `Prompt: ${data.prompt}\nUser: ${data.userSolution}\nAI: ${data.aiSolution}`
        }
      ],
      temperature: 0.5,
      response_format: { type: "json_object" },
      max_tokens: 600
    });

    // Handle possible null response
    if (!response.choices[0]?.message?.content) {
      console.error("Empty evaluation response received from xAI");
      return createFallbackEvaluation(data, false);
    }
    
    const result = JSON.parse(response.choices[0].message.content);
    return result as EvaluationResponse;
  } catch (error: any) {
    console.error("Error evaluating battle:", error);
    
    // Check for specific error types and handle accordingly
    if (error.code === 'invalid_api_key') {
      console.error("Invalid API key. Please check your xAI API key.");
    } else if (error.status === 429) {
      console.error("Rate limit exceeded. Please try again later.");
    } else if (error.status === 500 || error.status === 503) {
      console.error("xAI service is temporarily unavailable.");
    }
    
    // Return fallback evaluation where user wins
    return createFallbackEvaluation(data, false);
  }
}