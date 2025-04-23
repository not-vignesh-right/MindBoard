import { Button } from "@/components/ui/button";
import { BrainCircuit } from "lucide-react";

interface BattleCardProps {
  type: "user" | "opponent";
  title: string;
  badge: string;
  isThinking?: boolean;
  isSubmitted?: boolean;
  solution?: string;
  onSolutionChange?: (value: string) => void;
  onSubmit?: (autoSubmit?: boolean) => void;
  charCount?: number;
  isSubmitting?: boolean;
}

export default function BattleCard({
  type,
  title,
  badge,
  isThinking = false,
  isSubmitted = false,
  solution = "",
  onSolutionChange,
  onSubmit,
  charCount = 0,
  isSubmitting = false
}: BattleCardProps) {
  const isUser = type === "user";
  const bgColor = isUser ? "bg-primary" : "bg-secondary";
  const textColor = isUser ? "text-primary" : "text-secondary";
  
  return (
    <div className="battle-card bg-white rounded-xl shadow-md overflow-hidden">
      <div className={`${bgColor} text-white py-3 px-4`}>
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-heading font-semibold">{title}</h3>
          <span className={`bg-white ${textColor} text-xs font-bold px-2 py-1 rounded-full`}>{badge}</span>
        </div>
      </div>
      <div className="p-6">
        {isUser ? (
          <>
            <textarea 
              className="w-full h-64 p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary transition"
              placeholder="Type your creative solution here..."
              onChange={(e) => onSolutionChange?.(e.target.value)}
              value={solution}
              disabled={isSubmitted || isSubmitting}
            />
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                <span>{charCount}</span> characters
              </div>
              <Button 
                className={`${bgColor} hover:bg-opacity-90 text-white font-bold py-2 px-6 rounded-lg transition duration-300`}
                onClick={() => onSubmit?.(false)} // Pass false to indicate it's not an auto-submit
                disabled={isSubmitted || solution.trim().length === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Submit Solution"}
              </Button>
            </div>
          </>
        ) : (
          <>
            {isThinking ? (
              <div className="h-64 flex flex-col items-center justify-center">
                <div className="animate-pulse-slow">
                  <BrainCircuit className="h-12 w-12 text-gray-400 mb-4" />
                </div>
                <p className="text-gray-500 text-center">Your opponent is working on their solution...</p>
              </div>
            ) : (
              <div className="h-64 p-4 border border-gray-300 rounded-lg overflow-auto">
                {solution}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
