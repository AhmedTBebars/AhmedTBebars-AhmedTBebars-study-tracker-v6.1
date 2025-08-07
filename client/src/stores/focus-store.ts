import { create } from "zustand";
import { persist } from "zustand/middleware";

interface FocusState {
  isRunning: boolean;
  timeLeft: number; // in seconds
  sessionLength: number; // in minutes
  breakLength: number; // in minutes
  currentTaskId: string | null;
  sessionsCompleted: number;
  lastSessionType: "focus" | "break";
  intervalId: NodeJS.Timeout | null;

  // Actions
  startSession: (taskId?: string) => void;
  pauseSession: () => void;
  resetSession: () => void;
  completeSession: () => void;
  setSessionLength: (minutes: number) => void;
  setBreakLength: (minutes: number) => void;
  tick: () => void;
}

export const useFocusStore = create<FocusState>()(
  persist(
    (set, get) => ({
      isRunning: false,
      timeLeft: 25 * 60, // 25 minutes default
      sessionLength: 25,
      breakLength: 5,
      currentTaskId: null,
      sessionsCompleted: 0,
      lastSessionType: "focus",
      intervalId: null,

      startSession: (taskId) => {
        const state = get();

        // لو المؤقت شغال لنفس المهمة، لا نعمل أي شيء
        if (state.isRunning && state.currentTaskId === taskId) return;

        // إيقاف أي مؤقت سابق
        if (state.intervalId) clearInterval(state.intervalId);

        const id = setInterval(() => {
          const current = get();
          if (current.timeLeft > 0) {
            set({ timeLeft: current.timeLeft - 1 });
          } else {
            get().completeSession();
          }
        }, 1000);

        set({
          isRunning: true,
          currentTaskId: taskId || state.currentTaskId,
          timeLeft: state.sessionLength * 60,
          lastSessionType: "focus",
          intervalId: id,
        });
      },

      pauseSession: () => {
        const { intervalId } = get();
        if (intervalId) clearInterval(intervalId);
        set({ isRunning: false, intervalId: null });
      },

      resetSession: () => {
        const { intervalId, sessionLength } = get();
        if (intervalId) clearInterval(intervalId);
        set({
          isRunning: false,
          timeLeft: sessionLength * 60,
          currentTaskId: null,
          intervalId: null,
        });
      },

      completeSession: () => {
        const { intervalId, sessionsCompleted, sessionLength } = get();
        if (intervalId) clearInterval(intervalId);
        set({
          isRunning: false,
          sessionsCompleted: sessionsCompleted + 1,
          timeLeft: sessionLength * 60,
          intervalId: null,
        });
      },

      setSessionLength: (minutes) => {
        const { isRunning } = get();
        set({
          sessionLength: minutes,
          timeLeft: isRunning ? get().timeLeft : minutes * 60,
        });
      },

      setBreakLength: (minutes) => {
        set({ breakLength: minutes });
      },

      tick: () => {
        const { isRunning, timeLeft } = get();
        if (isRunning && timeLeft > 0) {
          set({ timeLeft: timeLeft - 1 });
        }
      },
    }),
    {
      name: "focus-store",
      partialize: (state) => ({
        sessionLength: state.sessionLength,
        breakLength: state.breakLength,
        sessionsCompleted: state.sessionsCompleted,
      }),
    }
  )
);
