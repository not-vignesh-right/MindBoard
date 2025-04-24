import { useState, useEffect, useRef, useContext } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { UserContext } from "@/App";
import Timer from "@/components/Timer";
import BattleCard from "@/components/BattleCard";
import LoadingOverlay from "@/components/LoadingOverlay";
import { Battle } from "@/lib/types";

export default function BattlePage() {
  const { id } = useParams();
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { username } = useContext(UserContext);
  const battleId = Number(id);
  
  console.log("Current username in Battle page:", username);
  
  const [userSolution, setUserSolution] = useState("");
  const [charCount, setCharCount] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [timeExpired, setTimeExpired] = useState(false);
  const [submissionAllowed, setSubmissionAllowed] = useState(false);
  const timerRef = useRef<any>(null);
  
  // Get battle data
  const { data: battle, isLoading: isBattleLoading, error } = useQuery<Battle>({
    queryKey: [`/api/battles/${battleId}`],
    enabled: !!battleId
  });

  // Submit solution mutation
  const submitSolutionMutation = useMutation({
    mutationFn: async (isAutoSubmit: boolean) => {
      // Use solution as-is, the backend will handle validation
      return await apiRequest("POST", `/api/battles/${battleId}/submit`, { 
        solution: userSolution,
        isAutoSubmit
      });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      queryClient.invalidateQueries({ queryKey: [`/api/battles/${battleId}`] });
      
      toast({
        title: "Solution submitted!",
        description: "Your creative solution has been submitted and is being evaluated.",
      });
      
      setTimeout(() => {
        navigate(`/results/${battleId}`);
      }, 1000);
    },
    onError: (error) => {
      console.error("API Request Error (submit solution):", error);
      toast({
        title: "Submission failed",
        description: "There was an error submitting your solution. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Auto-submit when timer expires
  useEffect(() => {
    if (timeExpired && !isSubmitted) {
      // Auto-submit even if solution is empty or less than 10 chars
      handleSubmit(true);
    }
  }, [timeExpired]);

  // Set character count when user solution changes
  useEffect(() => {
    setCharCount(userSolution.length);
  }, [userSolution]);

  // Handle when minimum time (2 minutes) is reached
  const handleMinimumTimeReached = () => {
    setSubmissionAllowed(true);
    toast({
      title: "Submission now allowed",
      description: "You may now submit your solution, or wait until the timer expires for auto-submission.",
    });
  };

  // Handle submit
  const handleSubmit = (autoSubmit: boolean = false) => {
    // Skip validation for auto-submit
    if (!autoSubmit) {
      // Validate solution content (only for manual submissions)
      if (userSolution.trim().length === 0) {
        toast({
          title: "Empty solution",
          description: "Please enter your creative solution before submitting.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if submission is allowed yet (2 minute mark passed)
      if (!submissionAllowed && timerRef.current && !timerRef.current.isSubmissionAllowed()) {
        toast({
          title: "Early submission",
          description: "You must wait at least 2 minutes before submitting your solution.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Proceed with submission
    setIsSubmitted(true);
    if (timerRef.current) {
      timerRef.current.stopTimer();
    }
    submitSolutionMutation.mutate(autoSubmit);
  };

  // Handle timer expiration
  const handleTimeExpired = () => {
    setTimeExpired(true);
    setSubmissionAllowed(true);
  };

  if (isBattleLoading) {
    return <LoadingOverlay message="Loading battle..." description="Please wait while we set up your creativity challenge." />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <h2 className="text-2xl font-bold mb-4">Error Loading Battle</h2>
        <p className="text-gray-600 mb-8">We couldn't load this battle. It may not exist or there was a server error.</p>
        <button 
          className="bg-primary text-white py-2 px-6 rounded-lg"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Battle Header */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div>
            <h2 className="text-2xl font-heading font-bold mb-2">Your Creative Challenge:</h2>
            <p className="text-lg md:text-xl font-semibold text-primary">
              {battle?.prompt}
            </p>
          </div>
          
          <Timer 
            duration={180} // 3 minutes (180 seconds)
            minimumTimeBeforeSubmission={120} // 2 minutes (120 seconds)
            onExpire={handleTimeExpired}
            onMinimumTimeReached={handleMinimumTimeReached}
            ref={timerRef}
          />
        </div>
      </div>
      
      {/* Battle Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* User Battle Card */}
        <BattleCard
          type="user"
          title={`${username}'s Solution`}
          badge="YOU"
          isSubmitted={isSubmitted}
          solution={userSolution}
          onSolutionChange={setUserSolution}
          onSubmit={handleSubmit}
          charCount={charCount}
          isSubmitting={submitSolutionMutation.isPending}
        />
        
        {/* Opponent Battle Card */}
        <BattleCard
          type="opponent"
          title={battle?.opponentType === "ai" ? "AI Opponent" : "Human Opponent"}
          badge={battle?.opponentType === "ai" ? "AI" : "HUMAN"}
          isThinking={true}
        />
      </div>
      
      {submitSolutionMutation.isPending && (
        <LoadingOverlay 
          message="Submitting your solution..." 
          description="Please wait while we process your creative masterpiece!" 
        />
      )}
    </div>
  );
}
