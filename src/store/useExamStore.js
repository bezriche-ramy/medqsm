import { create } from 'zustand';
import allQuestions from '../data/questions.json';
import {
  buildStoredSession,
  createQuestionMap,
  createSessionRecord,
  getTimeRemaining,
  selectSessionQuestionIds,
} from '../lib/examUtils';
import {
  loadActiveSession,
  loadSessionHistory,
  saveActiveSession,
  saveSessionHistory,
} from '../lib/storage';

const questionBank = allQuestions;
const questionMap = createQuestionMap(questionBank);

function sortSessions(sessionHistory) {
  return [...sessionHistory].sort(
    (left, right) => new Date(right.completedAt).getTime() - new Date(left.completedAt).getTime(),
  );
}

function bootstrapPersistentState() {
  let activeSession = loadActiveSession();
  let sessionHistory = sortSessions(loadSessionHistory());

  if (activeSession && getTimeRemaining(activeSession.expiresAt) <= 0) {
    const expiredSession = buildStoredSession(questionMap, activeSession, activeSession.expiresAt, 'expired');
    sessionHistory = sortSessions([expiredSession, ...sessionHistory.filter((session) => session.id !== expiredSession.id)]);
    activeSession = null;
    saveActiveSession(null);
    saveSessionHistory(sessionHistory);
  }

  return {
    activeSession,
    sessionHistory,
    lastCompletedSession: sessionHistory[0] || null,
  };
}

const initialState = bootstrapPersistentState();

const useExamStore = create((set, get) => ({
  questionBank,
  questionMap,
  activeSession: initialState.activeSession,
  sessionHistory: initialState.sessionHistory,
  lastCompletedSession: initialState.lastCompletedSession,
  hasHydrated: true,

  startSession: () => {
    const state = get();
    const questionIds = selectSessionQuestionIds(state.questionBank, state.lastCompletedSession);
    const activeSession = createSessionRecord(questionIds, 'Cardiologie');

    saveActiveSession(activeSession);
    set({ activeSession });

    return activeSession;
  },

  toggleAnswer: (questionId, optionId) =>
    set((state) => {
      if (!state.activeSession) {
        return {};
      }

      const question = state.questionMap[questionId];

      if (!question) {
        return {};
      }

      const currentAnswers = state.activeSession.answersByQuestionId[questionId] || [];
      const isSingleAnswer = (question.correctAnswers || []).length <= 1;
      let updatedAnswers = currentAnswers;

      if (isSingleAnswer) {
        updatedAnswers = currentAnswers.includes(optionId) ? [] : [optionId];
      } else if (currentAnswers.includes(optionId)) {
        updatedAnswers = currentAnswers.filter((answerId) => answerId !== optionId);
      } else {
        updatedAnswers = [...currentAnswers, optionId];
      }

      const activeSession = {
        ...state.activeSession,
        answersByQuestionId: {
          ...state.activeSession.answersByQuestionId,
          [questionId]: updatedAnswers,
        },
      };

      saveActiveSession(activeSession);
      return { activeSession };
    }),

  goToQuestion: (index) =>
    set((state) => {
      if (!state.activeSession) {
        return {};
      }

      const safeIndex = Math.max(0, Math.min(index, state.activeSession.questionIds.length - 1));
      const activeSession = {
        ...state.activeSession,
        currentQuestionIndex: safeIndex,
      };

      saveActiveSession(activeSession);
      return { activeSession };
    }),

  goToNextQuestion: () =>
    set((state) => {
      if (!state.activeSession) {
        return {};
      }

      const activeSession = {
        ...state.activeSession,
        currentQuestionIndex: Math.min(
          state.activeSession.currentQuestionIndex + 1,
          state.activeSession.questionIds.length - 1,
        ),
      };

      saveActiveSession(activeSession);
      return { activeSession };
    }),

  goToPrevQuestion: () =>
    set((state) => {
      if (!state.activeSession) {
        return {};
      }

      const activeSession = {
        ...state.activeSession,
        currentQuestionIndex: Math.max(state.activeSession.currentQuestionIndex - 1, 0),
      };

      saveActiveSession(activeSession);
      return { activeSession };
    }),

  syncActiveSession: () => {
    const { activeSession } = get();

    if (!activeSession) {
      return {
        expired: false,
        timeRemaining: 0,
        completedSession: null,
      };
    }

    const timeRemaining = getTimeRemaining(activeSession.expiresAt);

    if (timeRemaining > 0) {
      return {
        expired: false,
        timeRemaining,
        completedSession: null,
      };
    }

    const completedSession = get().submitExam({
      completedAt: activeSession.expiresAt,
      finishedReason: 'expired',
    });

    return {
      expired: true,
      timeRemaining: 0,
      completedSession,
    };
  },

  submitExam: ({ completedAt = new Date().toISOString(), finishedReason = 'submitted' } = {}) => {
    const state = get();

    if (!state.activeSession) {
      return null;
    }

    const storedSession = buildStoredSession(state.questionMap, state.activeSession, completedAt, finishedReason);
    const sessionHistory = sortSessions([
      storedSession,
      ...state.sessionHistory.filter((session) => session.id !== storedSession.id),
    ]);

    saveSessionHistory(sessionHistory);
    saveActiveSession(null);

    set({
      activeSession: null,
      sessionHistory,
      lastCompletedSession: storedSession,
    });

    return storedSession;
  },

  getSessionById: (sessionId) => {
    const state = get();
    return state.sessionHistory.find((session) => session.id === sessionId) || null;
  },

  clearActiveSession: () => {
    saveActiveSession(null);
    set({ activeSession: null });
  },
}));

export default useExamStore;
