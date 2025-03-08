import { useEffect, useRef, useState } from "react";

export function useReverseTimer(initialTime = 20, onTimeout) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const timerRef = useRef(null);

  useEffect(() => {
    if (timeLeft === 0) {
      clearInterval(timerRef.current);
      onTimeout?.();
    }
  }, [timeLeft, onTimeout]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(initialTime);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  };

  return { timeLeft, startTimer, stopTimer };
}
