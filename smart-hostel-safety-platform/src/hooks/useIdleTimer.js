import { useEffect } from "react";

export function useIdleTimer(onIdle, timeoutMs = 900000) { // Default 15 mins (900,000ms)
  useEffect(() => {
    let timer;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        if (onIdle) onIdle();
      }, timeoutMs);
    };

    const events = ["mousedown", "mousemove", "keypress", "scroll", "touchstart"];
    events.forEach((evt) => window.addEventListener(evt, resetTimer));

    resetTimer();

    return () => {
      clearTimeout(timer);
      events.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [onIdle, timeoutMs]);
}
