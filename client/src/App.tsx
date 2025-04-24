import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

import Home from "@/pages/Home";
import Battle from "@/pages/Battle";
import Results from "@/pages/Results";
import NotFound from "@/pages/not-found";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Context for managing user info
import { createContext } from "react";

interface UserContextType {
  username: string;
  setUsername: (name: string) => void;
}

export const UserContext = createContext<UserContextType>({
  username: "Guest",
  setUsername: () => {},
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/battle/:id" component={Battle} />
      <Route path="/results/:id" component={Results} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [username, setUsername] = useState<string>(() => {
    return localStorage.getItem("mindboard-username") || "Guest";
  });

  // Store username in localStorage whenever it changes
  useEffect(() => {
    if (username && username !== "Guest") {
      localStorage.setItem("mindboard-username", username);
      console.log("Username saved to localStorage:", username);
    }
  }, [username]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <UserContext.Provider value={{ username, setUsername }}>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <Toaster />
            <main className="flex-grow container mx-auto px-4 py-8">
              <Router />
            </main>
            <Footer />
          </div>
        </UserContext.Provider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
