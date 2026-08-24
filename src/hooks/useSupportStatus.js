// frontend/src/hooks/useSupportStatus.js

import { useState, useEffect } from "react";

/**
 * A custom hook to determine if support is currently online.
 * Support hours are Monday - Friday, 9 AM to 5 PM WAT (UTC+1).
 * This corresponds to 8 AM to 4 PM (16:00) in UTC.
 */
export function useSupportStatus() {
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    const checkStatus = () => {
      const now = new Date();
      const currentUTCDay = now.getUTCDay(); // Sunday = 0, Monday = 1, etc.
      const currentUTCHour = now.getUTCHours();

      // Check if it's a weekday (Monday to Friday)
      const isWeekday = currentUTCDay >= 1 && currentUTCDay <= 5;

      // Check if the time is within 8:00 AM UTC and 15:59 PM UTC
      const isWithinHours = currentUTCHour >= 8 && currentUTCHour < 16;

      if (isWeekday && isWithinHours) {
        setIsOnline(true);
      } else {
        setIsOnline(false);
      }
    };

    // Check status immediately on component mount
    checkStatus();

    // Set an interval to re-check every 60 seconds
    const intervalId = setInterval(checkStatus, 60000);

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return { isOnline };
}