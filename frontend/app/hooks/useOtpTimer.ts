import { useEffect, useState } from "react";

export const useOtpTimer = (start: boolean, duration = 300) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (!start) return;

    setTimeLeft(duration);

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [start, duration]);

  return {
    timeLeft,
    expired: timeLeft === 0,
  };
};
