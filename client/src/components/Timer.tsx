import { useState, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";

interface TimerProps {
  duration: number;
  onExpire: () => void;
  onMinimumTimeReached?: () => void;
  minimumTimeBeforeSubmission?: number;
}

const Timer = forwardRef(({ 
  duration, 
  onExpire, 
  onMinimumTimeReached,
  minimumTimeBeforeSubmission = 120 // Default 2 minutes before allowing submission
}: TimerProps, ref) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [timerActive, setTimerActive] = useState(true);
  const [timerStarted, setTimerStarted] = useState(false);
  const [submissionAllowed, setSubmissionAllowed] = useState(false);
  
  // For circle animation
  const circumference = 283; // 2 * pi * 45 (circle radius)
  
  // Handle timer expiration
  const handleTimerExpire = useCallback(() => {
    setTimerActive(false);
    setSubmissionAllowed(true);
    onExpire();
  }, [onExpire]);
  
  // Handle minimum time reached
  const handleMinimumTimeReached = useCallback(() => {
    setSubmissionAllowed(true);
    if (onMinimumTimeReached) {
      onMinimumTimeReached();
    }
  }, [onMinimumTimeReached]);
  
  // Initialize timer
  useEffect(() => {
    // Initialize in useEffect to avoid React warnings
    setTimeRemaining(duration);
    setTimerStarted(true);
  }, []);
  
  // Timer countdown logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (timerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prevTime => {
          const newTime = prevTime - 1;
          
          // Check if we've reached the minimum time for submission
          if (newTime === duration - minimumTimeBeforeSubmission) {
            handleMinimumTimeReached();
          }
          
          // Check if timer has expired
          if (newTime <= 0) {
            if (interval) clearInterval(interval);
            handleTimerExpire();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timerActive, timeRemaining, handleTimerExpire, handleMinimumTimeReached, duration, minimumTimeBeforeSubmission]);
  
  useImperativeHandle(ref, () => ({
    stopTimer: () => {
      setTimerActive(false);
    },
    getTimeRemaining: () => timeRemaining,
    isActive: () => timerActive,
    isSubmissionAllowed: () => submissionAllowed
  }));
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate circle animation
  const dashoffset = circumference * (1 - timeRemaining / duration);
  
  // Determine circle color based on time remaining
  let circleColor = "#6C63FF"; // Default primary color
  if (timeRemaining < duration * 0.16) { // Less than 30 seconds
    circleColor = "#F44336"; // Red for urgency
  } else if (timeRemaining < duration * 0.33) { // Less than 1 minute
    circleColor = "#FF9800"; // Orange for warning
  }
  
  return (
    <div className="mt-4 md:mt-0 flex flex-col items-center">
      <div className="relative h-24 w-24">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#e6e6e6" strokeWidth="8"/>
          <circle 
            cx="50" 
            cy="50" 
            r="45" 
            fill="none" 
            stroke={circleColor} 
            strokeWidth="8" 
            className="timer-circle"
            style={{ strokeDashoffset: dashoffset }}
          />
        </svg>
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
          <span className="text-2xl font-bold">{formatTime(timeRemaining)}</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-1">Time Remaining</p>
    </div>
  );
});

Timer.displayName = "Timer";

export default Timer;
