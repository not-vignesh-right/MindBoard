import { useState, useContext } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter 
} from "@/components/ui/dialog";
import { UserContext } from "../App";
import Leaderboard from "@/components/Leaderboard";
import { Brain, BoltIcon, Trophy, Users } from "lucide-react";

export default function Home() {
  const [location, navigate] = useLocation();
  const { username, setUsername } = useContext(UserContext);
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [showComingSoonDialog, setShowComingSoonDialog] = useState(false);
  const [newUsername, setNewUsername] = useState(username);

  const startBattleMutation = useMutation({
    mutationFn: async (opponentType: string) => {
      return apiRequest("POST", "/api/battles", { opponentType, username });
    },
    onSuccess: async (res) => {
      const data = await res.json();
      navigate(`/battle/${data.id}`);
    },
    onError: (error) => {
      console.error("Failed to start battle:", error);
    }
  });

  const handleStartBattle = (opponentType: string) => {
    if (opponentType === "human") {
      // Show the "Coming Soon" dialog for human battles
      setShowComingSoonDialog(true);
      return;
    }
    
    if (username === "Guest") {
      setShowNameDialog(true);
    } else {
      startBattleMutation.mutate(opponentType);
    }
  };

  const handleNameSubmit = () => {
    if (newUsername.trim().length > 0) {
      setUsername(newUsername.trim());
      setShowNameDialog(false);
      startBattleMutation.mutate("ai"); // Default to AI battle
    }
  };

  return (
    <>
      <div className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-neutral-dark mb-6">
            The <span className="text-primary">First AI-Powered</span> <br/>
            Creativity Battle Arena
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Challenge your creativity against AI or other humans. Get prompts, create solutions, and see who has the most innovative mind!
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Button 
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 text-lg h-auto"
              onClick={() => handleStartBattle("ai")}
              disabled={startBattleMutation.isPending}
            >
              <Brain className="mr-2 h-5 w-5" /> Battle vs AI
            </Button>
            <Button 
              size="lg"
              className="bg-secondary hover:bg-secondary/90 text-white font-bold py-4 px-8 rounded-lg shadow-lg transition duration-300 text-lg h-auto"
              onClick={() => handleStartBattle("human")}
              disabled={startBattleMutation.isPending}
            >
              <Users className="mr-2 h-5 w-5" /> Battle vs Human
            </Button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-xl shadow-md transform transition duration-500 hover:scale-105">
              <div className="text-accent text-4xl mb-4 flex justify-center">
                <BoltIcon size={40} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Creative Challenges</h3>
              <p className="text-gray-600">Unique AI-generated prompts to spark your creativity and challenge your thinking.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transform transition duration-500 hover:scale-105">
              <div className="text-accent text-4xl mb-4 flex justify-center">
                <Brain size={40} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Fair Judgment</h3>
              <p className="text-gray-600">Advanced AI evaluates ideas based on originality, logic, and expression.</p>
            </div>
            
            <div className="bg-white p-6 rounded-xl shadow-md transform transition duration-500 hover:scale-105">
              <div className="text-accent text-4xl mb-4 flex justify-center">
                <Trophy size={40} />
              </div>
              <h3 className="text-xl font-heading font-semibold mb-2">Climb The Ranks</h3>
              <p className="text-gray-600">Track your progress and compete for the top spot on our creativity leaderboard.</p>
            </div>
          </div>
        </div>
      </div>

      <Leaderboard />

      {/* Username Dialog */}
      <Dialog open={showNameDialog} onOpenChange={setShowNameDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Your Username</DialogTitle>
            <DialogDescription>
              Please enter a username to track your scores on the leaderboard.
            </DialogDescription>
          </DialogHeader>
          <Input 
            value={newUsername} 
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="Enter your username"
            className="mt-2"
          />
          <DialogFooter>
            <Button onClick={handleNameSubmit}>Save & Start Battle</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Coming Soon Dialog */}
      <Dialog open={showComingSoonDialog} onOpenChange={setShowComingSoonDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Coming Soon!</DialogTitle>
            <DialogDescription>
              Battles against other human players will be available in a future update. 
              In the meantime, challenge yourself against our advanced AI opponents!
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setShowComingSoonDialog(false)}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
