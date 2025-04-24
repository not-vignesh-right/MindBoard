import { EvaluationRequest, EvaluationResponse } from "@/lib/types";

// Flag to control API usage
// Setting to true will use offline mode with pre-defined responses
// Setting to false will attempt to use the Perplexity API (requires API key)
const FORCE_OFFLINE_MODE = true;

// Log API key status (without revealing the key)
console.log("Perplexity API Key Status:", process.env.PERPLEXITY_API_KEY ? "Present" : "Missing");
console.log("Offline Mode:", FORCE_OFFLINE_MODE ? "Enabled" : "Disabled");

/**
 * Generate a creative prompt for a battle using Perplexity AI
 */
export async function generatePrompt(): Promise<string> {
  // Fallback prompts in case the API fails or in offline mode
  const fallbackPrompts = [
    // Technology & Computing Prompts
    "Design a new programming language that uses natural human gestures instead of typing",
    "Create a computer interface for people who have no hands or mobility",
    "Design a smart city infrastructure that respects privacy while enhancing safety",
    "Invent a new social media platform that promotes genuine human connection",
    "Design an AI assistant for mental health that respects ethical boundaries",
    
    // Science & Innovation Prompts
    "Design a device that could capture and store carbon dioxide from the atmosphere",
    "Create a renewable energy solution for areas with extreme weather conditions",
    "Invent a material that could replace plastic in all common applications",
    "Design a sustainable water purification system for remote communities",
    "Create a solution for managing e-waste in urban environments",
    
    // AI & Future Tech Prompts
    "Design an AI system that could help predict and prevent natural disasters",
    "Create a fair and transparent algorithm for college admissions",
    "Invent a new type of quantum computing application for everyday use",
    "Design a robot that could help restore damaged ecosystems",
    "Create an AI that can translate animal communication to human language"
  ];
  
  // If in offline mode, use fallback prompts without API call
  if (FORCE_OFFLINE_MODE || !process.env.PERPLEXITY_API_KEY) {
    console.log("Using offline mode for prompt generation");
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  }
  
  try {
    console.log("Generating prompt using Perplexity API...");
    
    // Call Perplexity API to generate a creative prompt
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          {
            role: "system",
            content: "Generate ONE creative prompt (maximum 15 words) for a creative challenge. The prompt should be about designing, inventing, or creating something innovative."
          }
        ],
        temperature: 0.7,
        max_tokens: 30
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API responded with status ${response.status}`);
    }

    const data = await response.json();
    const generatedPrompt = data.choices[0]?.message?.content?.trim();
    
    // Return the generated prompt or fall back to a predefined one
    return generatedPrompt || fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  } catch (error) {
    console.error("Error generating prompt with Perplexity:", error);
    return fallbackPrompts[Math.floor(Math.random() * fallbackPrompts.length)];
  }
}

/**
 * Generate an AI response to a prompt using Perplexity
 */
export async function generateAIResponse(prompt: string): Promise<string> {
  // Define a fallback AI response content
  const fallbackResponse = "The AI was unable to generate a solution at this time due to technical difficulties. According to the rules, when AI fails to generate a response, the user automatically wins this round.";
  
  // Generic responses for prompts - tailored for common prompt types
  const genericResponses = [
    // Technology Innovation Response
    "My solution uses a distributed network of quantum-encrypted nodes that can process information in parallel while maintaining data integrity. The system incorporates adaptive learning algorithms that improve efficiency as usage patterns emerge. I've designed a modular architecture that can be deployed incrementally, with each component being self-contained yet interconnected through standardized APIs. Energy requirements are managed through a combination of renewable sources and advanced power management techniques. The user interface adapts to individual preferences while maintaining a consistent experience across different platforms and abilities.",

    // Environmental Solution Response
    "I propose a bio-inspired system that mimics natural processes to achieve sustainable outcomes. The core technology uses engineered microorganisms that can be programmed for specific tasks without disrupting existing ecosystems. The implementation is scalable from individual buildings to entire cities, with each installation being self-sufficient after initial setup. Materials used are biodegradable or easily recyclable, ensuring minimal environmental impact throughout the lifecycle. The solution integrates with existing infrastructure to minimize disruption while providing immediate benefits to communities.",

    // AI & Computing Response
    "My approach combines neural networks with symbolic reasoning to create a hybrid system that addresses the limitations of each individual approach. The architecture utilizes federated learning to protect privacy while still benefiting from distributed data processing. Implementation happens in phases, with each phase building on lessons from previous deployments. The system is designed to be explainable, with clear reasoning paths that users can understand and verify. This transparency builds trust while maintaining performance at levels comparable to black-box alternatives.",

    // Social Innovation Response 
    "I've designed a platform that connects people based on complementary skills rather than similar interests, creating diverse networks that solve problems more effectively. The system uses reputation mechanisms that reward helpful behaviors rather than popularity. Implementation begins with small community pilots that generate data for subsequent refinement. Privacy controls are granular but intuitive, allowing users to meaningfully control their data. The business model is cooperative rather than extractive, ensuring sustainability through alignment with user interests."
  ];
  
  // If in offline mode, use generic responses without API call
  if (FORCE_OFFLINE_MODE || !process.env.PERPLEXITY_API_KEY) {
    console.log("Using offline mode for AI response generation");
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
  }
  
  try {
    console.log("Generating AI response for prompt:", prompt.substring(0, 30) + "...");
    
    // Call Perplexity API to generate a response to the prompt
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
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
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API responded with status ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content?.trim();
    
    if (!aiResponse) {
      console.error("Empty response received from Perplexity");
      return fallbackResponse;
    }
    
    return aiResponse;
  } catch (error) {
    console.error("Error generating AI response with Perplexity:", error);
    
    // Check for specific error types and handle accordingly
    if (error instanceof Error) {
      console.error(error.message);
    }
    
    return fallbackResponse;
  }
}

/**
 * Evaluate user and AI solutions using Perplexity
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
  
  // Helper function to create a fallback evaluation
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
  if (FORCE_OFFLINE_MODE || !process.env.PERPLEXITY_API_KEY) {
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
  
  try {
    console.log("Evaluating battle using Perplexity...");
    
    // Call Perplexity API to evaluate the solutions
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.PERPLEXITY_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-sonar-small-128k-online",
        messages: [
          { 
            role: "system", 
            content: `You are an expert judge evaluating creative solutions to technical challenges. 
            Rate two solutions (User and AI) on three criteria:
            
            1. Originality (0-100): Novelty, uniqueness, and creative thinking
              - High scores: Truly innovative ideas that haven't been widely implemented
              - Low scores: Common or derivative approaches with little innovation
            
            2. Logic (0-100): Practicality, feasibility, and sound reasoning
              - High scores: Well-thought-out solutions that could be implemented
              - Low scores: Impractical ideas with major logical flaws
            
            3. Expression (0-100): Clarity, engagement, and effective communication
              - High scores: Clear, concise, and compelling communication
              - Low scores: Confusing, verbose, or poorly structured writing
            
            For each category, provide specific, constructive feedback (2-3 sentences).
            Calculate the total score for each solution (sum of all three categories).
            Determine the winner based on the higher total score.
            
            Return your evaluation in JSON format only with this structure:
            {
              "userScore": {
                "originality": number,
                "logic": number,
                "expression": number,
                "originalityFeedback": string,
                "logicFeedback": string,
                "expressionFeedback": string,
                "total": number
              },
              "aiScore": {
                "originality": number,
                "logic": number,
                "expression": number,
                "originalityFeedback": string,
                "logicFeedback": string,
                "expressionFeedback": string,
                "total": number
              },
              "judgeFeedback": string,
              "winner": "user" or "ai"
            }`
          },
          {
            role: "user",
            content: `Prompt: ${data.prompt}\n\nUser Solution: ${data.userSolution}\n\nAI Solution: ${data.aiSolution}`
          }
        ],
        temperature: 0.4,
        response_format: { type: "json_object" },
        max_tokens: 800
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API responded with status ${response.status}`);
    }

    const result = await response.json();
    
    // Handle possible null response
    if (!result.choices[0]?.message?.content) {
      console.error("Empty evaluation response received from Perplexity");
      return createFallbackEvaluation(data, true); // Let user win by default in case of API failure
    }
    
    // Parse the JSON response
    const evaluation = JSON.parse(result.choices[0].message.content);
    return evaluation as EvaluationResponse;
  } catch (error) {
    console.error("Error evaluating battle with Perplexity:", error);
    
    // Return fallback evaluation where user wins
    return createFallbackEvaluation(data, true);
  }
}